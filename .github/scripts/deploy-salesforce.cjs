const fs = require('node:fs');
const { ComponentSet } = require('@salesforce/source-deploy-retrieve');
const { AuthInfo, Connection } = require('@salesforce/core');

const sourceDir = process.env.SF_SOURCE_DIR || 'force-app';
const accessToken = process.env.SF_ACCESS_TOKEN;
const instanceUrl = process.env.SF_INSTANCE_URL;
const testLevel = process.env.SF_TEST_LEVEL || 'NoTestRun';
const checkOnly = process.env.SF_CHECK_ONLY === 'true';
const apiVersion = process.env.SF_API_VERSION || readProjectApiVersion() || '67.0';

function readProjectApiVersion() {
  try {
    const project = JSON.parse(fs.readFileSync('sfdx-project.json', 'utf8'));
    return project.sourceApiVersion;
  } catch {
    return undefined;
  }
}

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function summarizeFailures(response) {
  const componentFailures = asArray(response.details?.componentFailures);
  const testFailures = asArray(response.details?.runTestResult?.failures);

  if (componentFailures.length) {
    console.error('\nComponent failures:');
    for (const failure of componentFailures.slice(0, 20)) {
      const name = [failure.componentType, failure.fullName].filter(Boolean).join(' ');
      const location = failure.lineNumber ? `:${failure.lineNumber}` : '';
      console.error(`- ${name}${location} - ${failure.problem || 'Deployment component failed.'}`);
    }
  }

  if (testFailures.length) {
    console.error('\nApex test failures:');
    for (const failure of testFailures.slice(0, 20)) {
      console.error(`- ${failure.name}.${failure.methodName}: ${failure.message || failure.stackTrace || 'Test failed.'}`);
    }
  }
}

async function main() {
  if (!accessToken || !instanceUrl) {
    throw new Error('Missing SF_ACCESS_TOKEN or SF_INSTANCE_URL from the OAuth step.');
  }

  console.log(`Preparing ${checkOnly ? 'validation' : 'deployment'} from ${sourceDir}.`);
  console.log(`Using Salesforce API v${apiVersion} with test level ${testLevel}.`);

  const authInfo = await AuthInfo.create({
    username: accessToken,
    accessTokenOptions: { instanceUrl },
  });
  const connection = await Connection.create({
    authInfo,
    connectionOptions: { version: apiVersion },
  });

  const components = ComponentSet.fromSource(sourceDir);
  const sourceCount = components.getSourceComponents().toArray().length;
  if (sourceCount === 0) {
    throw new Error(`No deployable metadata was found in ${sourceDir}.`);
  }
  console.log(`Found ${sourceCount} metadata components.`);

  const operation = await components.deploy({
    usernameOrConnection: connection,
    apiOptions: {
      checkOnly,
      rollbackOnError: true,
      ignoreWarnings: false,
      singlePackage: true,
      testLevel,
    },
  });

  console.log(`Salesforce deploy id: ${operation.id}`);
  const result = await operation.pollStatus(5000, 3600);
  const response = result.response;

  console.log(`Salesforce deploy status: ${response.status}`);
  console.log(`Components: ${response.numberComponentsDeployed || 0}/${response.numberComponentsTotal || 0}`);
  if (response.numberTestsTotal) {
    console.log(`Tests: ${response.numberTestsCompleted || 0}/${response.numberTestsTotal}`);
  }

  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(
      process.env.GITHUB_STEP_SUMMARY,
      [
        '',
        '### Salesforce Metadata API Result',
        '',
        `- Deploy ID: \`${operation.id}\``,
        `- Status: \`${response.status}\``,
        `- Success: \`${Boolean(response.success)}\``,
        `- Check only: \`${Boolean(response.checkOnly)}\``,
        `- Components: \`${response.numberComponentsDeployed || 0}/${response.numberComponentsTotal || 0}\``,
      ].join('\n') + '\n',
    );
  }

  if (!response.success) {
    summarizeFailures(response);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error.stack || error.message || error);
  process.exitCode = 1;
});
