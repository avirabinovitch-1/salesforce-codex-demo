# Salesforce GitHub Deployment

This project uses GitHub as the source of truth for Salesforce metadata. Pull requests validate metadata against the demo org, and deployment to the demo org is available only through a manual GitHub Actions workflow.

Codex may create metadata and documentation changes, but deployment to the demo org should be performed only through the manual GitHub Actions deploy workflow after human review.

## Current Project Baseline

- `sfdx-project.json` defines one default package directory: `force-app`.
- `sourceApiVersion` is `67.0`.
- `force-app` contains the HLS appeals demo metadata package:
  - `Matter__c`
  - `Payer__c`
  - `Matter_Payer__c`
  - `Matter_Payment__c`
  - Custom tabs for the four HLS objects
  - `HLS_Appeals_Command_Center` Lightning app shell
  - `HLS_Demo_Access` permission set
- There are no deployable Apex classes or triggers under `force-app` right now.
- The existing local Salesforce config points to the `codexdev` alias, but GitHub Actions authenticates with its own `demo` alias.
- GitHub Actions workflow files are included under `.github/workflows`.
- Local validation passed against `codexdev` on June 28, 2026 with `sf project deploy start --dry-run --source-dir force-app --target-org codexdev --test-level NoTestRun --wait 60`.

## Branch Strategy

- `main`: stable demo-ready source.
- `feature/hls-demo-build`: Codex implementation work.
- Open pull requests from feature branches into `main`.
- PR validation must pass before merge.
- Human review is required before merge.
- Manual deployment happens after merge or from an explicitly approved branch.

For feature work:

```bash
git switch main
git pull --ff-only
git switch -c feature/hls-demo-build
```

## First GitHub Setup

If this local repo is not connected to GitHub yet, create an empty GitHub repo, then run these commands locally and replace `OWNER/REPO` with the real repository path:

```bash
git add .
git commit -m "Initial Salesforce DX project commit"
git branch -M main
git remote add origin git@github.com:OWNER/REPO.git
git push -u origin main
```

Do not invent the owner or repository name. Do not commit secrets, access tokens, refresh tokens, org credentials, private keys, `.sf/`, `.sfdx/`, `.env`, or `server.key`.

## Pull Request Validation

Workflow name: `Salesforce Validate`

File: `.github/workflows/salesforce-validate.yml`

This workflow runs on pull requests into `main`. It:

- Checks out the repository.
- Installs Salesforce CLI.
- Authenticates to Salesforce with JWT secrets.
- Detects whether Apex classes or triggers exist in `force-app`.
- Uses `RunLocalTests` when Apex exists.
- Uses `NoTestRun` while the package has no Apex.
- Runs `sf project deploy start --dry-run --source-dir force-app --target-org demo`.
- Fails the pull request if validation fails.

To validate a PR, push a feature branch and open a pull request into `main`. GitHub Actions will run `Salesforce Validate` automatically. Same-repo feature branches are recommended because Salesforce authentication secrets are not exposed to forked pull requests.

## Manual Demo Deployment

Workflow name: `Deploy Salesforce Demo`

File: `.github/workflows/salesforce-deploy-demo.yml`

This workflow runs only from `workflow_dispatch`. It:

- Requires a manual workflow run.
- Requires the `deploy_confirmation` input to be exactly `DEPLOY`.
- Uses the GitHub Environment named `demo`.
- Checks out the selected branch or ref.
- Installs Salesforce CLI.
- Authenticates to Salesforce with JWT secrets.
- Detects the correct test level.
- Runs `sf project deploy start --source-dir force-app --target-org demo`.
- Writes a summary to the GitHub Actions run.

Recommended GitHub Environment setup:

1. In GitHub, open Settings > Environments.
2. Create an environment named `demo`.
3. Add required reviewers for human deployment approval.
4. Optionally restrict which branches can deploy.

To deploy manually:

1. Confirm the branch has been reviewed and validated.
2. Open GitHub Actions.
3. Select `Deploy Salesforce Demo`.
4. Choose the approved branch or `main`.
5. Enter `DEPLOY` for the confirmation input.
6. Run the workflow.

## Required GitHub Secrets

Add these repository or environment secrets in GitHub:

- `SF_CONSUMER_KEY`: Connected App consumer key.
- `SF_USERNAME`: Salesforce username for the deployment integration user.
- `SF_JWT_KEY`: Private key that matches the certificate uploaded to the Connected App.

Store the full private key value in `SF_JWT_KEY`. The workflow writes it to a temporary `server.key` file during the run and removes the file afterward. `server.key` and `*.key` are ignored by Git.

## Salesforce Connected App For JWT

Use JWT auth when possible:

1. Generate a private key and certificate outside the repo.
2. In Salesforce Setup, create a Connected App.
3. Enable OAuth settings.
4. Upload the certificate for digital signatures.
5. Add OAuth scopes required for deployment, usually `api` and `refresh_token, offline_access`.
6. Set the Connected App policy to pre-authorize approved users.
7. Assign the integration user through a profile or permission set.
8. Put the consumer key, Salesforce username, and private key into GitHub secrets.

Do not commit the private key, generated certificates, auth URLs, tokens, or local org config.

If JWT auth is not practical, an alternative is to store an auth URL in a GitHub secret and authenticate with `sf org login sfdx-url`. That alternative is documented here only and is not implemented in the workflows without explicit approval.

## Codex Operating Rules

When doing Salesforce build work after this setup:

1. Create or use a feature branch.
2. Make source changes only.
3. Update documentation.
4. Do not deploy directly.
5. Run local validation if possible.
6. Open or prepare a pull request.
7. Let GitHub Actions validate.
8. Wait for human approval before deployment.

## Rollback

Use Git as the rollback source:

1. Identify the last good commit or release tag.
2. Revert the bad metadata commit in a new branch.
3. Open a pull request into `main`.
4. Let `Salesforce Validate` pass.
5. After review, merge and run `Deploy Salesforce Demo` manually.

Avoid manual org edits as rollback unless they are emergency fixes that are later reconciled back into source control.

## What Not To Automate

- Do not deploy automatically from Codex.
- Do not deploy automatically on pull request creation.
- Do not deploy automatically on merge unless the team explicitly changes this strategy later.
- Do not run deployments from unreviewed local sessions.
- Do not commit secrets, private keys, access tokens, refresh tokens, auth URLs, `.sf/`, or `.sfdx/`.
