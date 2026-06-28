import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const root = process.cwd();
const sourceRoot = join(root, 'force-app', 'main', 'default');
const xmlns = 'http://soap.sforce.com/2006/04/metadata';

const objects = [
  {
    apiName: 'Matter__c',
    label: 'Matter',
    pluralLabel: 'Matters',
    description:
      'Central healthcare appeal workspace for the HLS demo command center.',
    nameField: {
      label: 'Matter Number',
      type: 'AutoNumber',
      displayFormat: 'HLS-APL-{0000}',
    },
    sharingModel: 'ReadWrite',
    enableActivities: true,
    fields: [
      lookup('Client__c', 'Client', 'Account', 'HLS_Matters', 'HLS Matters', {
        required: true,
      }),
      text('Patient_First_Name__c', 'Patient First Name', 40),
      text('Patient_Last_Name__c', 'Patient Last Name', 80),
      text('Patient_Account_Number__c', 'Patient Account Number', 50),
      text('MRN__c', 'MRN', 50),
      date('Patient_Date_of_Birth__c', 'Patient Date of Birth'),
      text('Encounter_ID__c', 'Encounter ID', 50),
      text('Claim_ID__c', 'Claim ID', 50),
      date('Service_Date__c', 'Service Date'),
      date('Denial_Date__c', 'Denial Date'),
      picklist('Denial_Reason__c', 'Denial Reason', [
        'Medical Necessity',
        'Timely Filing',
        'Authorization',
        'Coding',
        'Eligibility',
        'Other',
      ]),
      picklist('Appeal_Level__c', 'Appeal Level', [
        'First-level Appeal',
        'Second-level Appeal',
        'External Review',
        'Reconsideration',
      ]),
      picklist('Status__c', 'Status', [
        'Intake',
        'Documentation Needed',
        'Appeal Drafting',
        'Ready for Submission',
        'Submitted',
        'Follow-up Due',
        'Response Received',
        'Payment Posted',
        'Closed',
      ]),
      picklist('Disposition__c', 'Disposition', [
        'Appeal Pending',
        'Submitted Online',
        'Fax Submitted',
        'Print/Mail Submitted',
        'Response Received',
        'Payment Posted',
        'Closed',
      ]),
      currency('Dollar_Placed__c', 'Dollar Placed', { required: true }),
      date('Due_Date__c', 'Due Date'),
      picklist('Submission_Channel__c', 'Submission Channel', [
        'Online Portal',
        'Fax',
        'Print/Mail',
        'API',
        'Other',
      ]),
      picklist('Submission_Status__c', 'Submission Status', [
        'Not Started',
        'Ready for Submission',
        'Submitted',
        'Response Received',
        'Failed',
        'Not Required',
      ]),
      date('Submitted_Date__c', 'Submitted Date'),
      text('Confirmation_Number__c', 'Confirmation Number', 80),
      date('Response_Due_Date__c', 'Response Due Date'),
      date('Follow_Up_Due_Date__c', 'Follow-Up Due Date'),
      text('Next_Action__c', 'Next Action', 255),
      textarea('Assignment_Reason__c', 'Assignment Reason', 255),
      picklist('Integration_Source__c', 'Integration Source', [
        'Client File',
        'API',
        'RPA Handoff',
        'Manual Demo Intake',
      ]),
      picklist('Integration_Status__c', 'Integration Status', [
        'Received',
        'Validated',
        'Needs Review',
        'Error',
      ]),
      picklist('Close_Reason__c', 'Close Reason', [
        'Paid',
        'Denied',
        'Withdrawn',
        'Duplicate',
        'Client Closed',
        'Other',
      ]),
      rollupCount(
        'Payer_Record_Count__c',
        'Payer Record Count',
        'Matter_Payer__c.Matter__c',
      ),
      rollupCount(
        'Payment_Record_Count__c',
        'Payment Record Count',
        'Matter_Payment__c.Matter__c',
      ),
      rollupSum(
        'Total_Payments__c',
        'Total Payments',
        'Matter_Payment__c.Matter__c',
        'Matter_Payment__c.Payment_Amount__c',
      ),
      rollupSum(
        'Billable_Payments__c',
        'Billable Payments',
        'Matter_Payment__c.Matter__c',
        'Matter_Payment__c.Billable_Amount__c',
      ),
      rollupSum(
        'Non_Billable_Payments__c',
        'Non-Billable Payments',
        'Matter_Payment__c.Matter__c',
        'Matter_Payment__c.Non_Billable_Amount__c',
      ),
      rollupSum(
        'Total_Adjustments__c',
        'Total Adjustments',
        'Matter_Payment__c.Matter__c',
        'Matter_Payment__c.Adjustment_Amount__c',
      ),
      {
        fullName: 'Pending_Review_Payment_Count__c',
        label: 'Pending Review Payment Count',
        summaryForeignKey: 'Matter_Payment__c.Matter__c',
        summaryOperation: 'count',
        summaryFilterItems: [
          {
            field: 'Matter_Payment__c.HLS_Code__c',
            operation: 'equals',
            value: 'Pending Review',
          },
        ],
        type: 'Summary',
      },
      formulaPercent(
        'Percent_Paid__c',
        'Percent Paid',
        'IF(Dollar_Placed__c > 0, Total_Payments__c / Dollar_Placed__c, 0)',
      ),
      picklist('Billing_Readiness__c', 'Billing Readiness', [
        'Not Ready',
        'Ready for Review',
        'Needs Payment Review',
        'Billed',
      ]),
      formulaCurrency(
        'Net_Recovery__c',
        'Net Recovery',
        'Total_Payments__c',
      ),
    ],
  },
  {
    apiName: 'Payer__c',
    label: 'Payer',
    pluralLabel: 'Payers',
    description: 'Reusable payer reference record for the HLS demo.',
    nameField: {
      label: 'Payer Name',
      type: 'Text',
    },
    sharingModel: 'ReadWrite',
    fields: [
      picklist('Payer_Type__c', 'Payer Type', [
        'Commercial',
        'Medicare Advantage',
        'Medicaid',
        'Supplemental',
        'Assistance Program',
        'Patient Responsibility',
        'Other',
      ]),
      text('External_Payer_Id__c', 'External Payer ID', 80, {
        externalId: true,
        unique: true,
        caseSensitive: false,
      }),
      url('Portal_URL__c', 'Portal URL'),
      checkbox('Active__c', 'Active', true),
      longText('Notes__c', 'Notes', 32768, 5),
    ],
  },
  {
    apiName: 'Matter_Payer__c',
    label: 'Matter Payer',
    pluralLabel: 'Matter Payers',
    description:
      'Junction record that assigns payer roles and order to a Matter.',
    nameField: {
      label: 'Matter Payer Number',
      type: 'AutoNumber',
      displayFormat: 'MP-{0000}',
    },
    sharingModel: 'ControlledByParent',
    fields: [
      masterDetail(
        'Matter__c',
        'Matter',
        'Matter__c',
        'Matter_Payers',
        'Matter Payers',
      ),
      lookup('Payer__c', 'Payer', 'Payer__c', 'Payer_Matter_Payers', 'Matter Payers', {
        required: true,
      }),
      picklist('Payer_Role__c', 'Payer Role', [
        'Primary',
        'Secondary',
        'Tertiary',
        'Other',
      ], {
        required: true,
      }),
      number('Payer_Order__c', 'Payer Order', 1, 0, { required: true }),
      formulaCheckbox(
        'Is_Primary__c',
        'Is Primary',
        'OR(Payer_Order__c = 1, ISPICKVAL(Payer_Role__c, "Primary"))',
      ),
      picklist('Coverage_Type__c', 'Coverage Type', [
        'Medical',
        'Supplemental',
        'Assistance',
        'Patient Responsibility',
        'Other',
      ]),
      text('Policy_Number__c', 'Policy Number', 80),
      text('Group_Number__c', 'Group Number', 80),
      date('Effective_Date__c', 'Effective Date'),
      date('Termination_Date__c', 'Termination Date'),
      textarea('Assignment_Notes__c', 'Assignment Notes', 255),
    ],
  },
  {
    apiName: 'Matter_Payment__c',
    label: 'Matter Payment',
    pluralLabel: 'Matter Payments',
    description:
      'Payment, reimbursement, adjustment, or review row related to a Matter.',
    nameField: {
      label: 'Payment Number',
      type: 'AutoNumber',
      displayFormat: 'PAY-{0000}',
    },
    sharingModel: 'ControlledByParent',
    fields: [
      masterDetail(
        'Matter__c',
        'Matter',
        'Matter__c',
        'Matter_Payments',
        'Matter Payments',
      ),
      lookup(
        'Matter_Payer__c',
        'Matter Payer',
        'Matter_Payer__c',
        'Matter_Payer_Payments',
        'Matter Payments',
      ),
      date('Payment_Date__c', 'Payment Date', { required: true }),
      formulaText(
        'Payer_Role__c',
        'Payer Role',
        'TEXT(Matter_Payer__r.Payer_Role__c)',
      ),
      formulaText(
        'Payer_Name__c',
        'Payer Name',
        'Matter_Payer__r.Payer__r.Name',
      ),
      picklist('Payment_Type__c', 'Payment Type', [
        'Reimbursement',
        'Adjustment',
        'Patient Responsibility',
        'Small Balance Correction',
        'Recoupment',
      ], {
        required: true,
      }),
      picklist('Source_System__c', 'Source System', [
        'Payer Portal',
        'Client System',
        'Manual Demo Import',
        'RPA Handoff',
        'API',
      ]),
      currency('Payment_Amount__c', 'Payment Amount'),
      currency('Billable_Amount__c', 'Billable Amount'),
      currency('Non_Billable_Amount__c', 'Non-Billable Amount'),
      currency('Adjustment_Amount__c', 'Adjustment Amount'),
      picklist('HLS_Code__c', 'HLS Code', [
        'Verify Pay',
        'Billable',
        'Non-billable',
        'Adjustment',
        'Pending Review',
      ], {
        required: true,
      }),
      checkbox('Verify_Pay__c', 'Verify Pay', false),
      picklist('Invoice_Status__c', 'Invoice Status', [
        'Not Ready',
        'Ready for Review',
        'Hold',
        'Exported',
      ]),
      text('Payment_Reference__c', 'Payment Reference', 80),
      date('Imported_Date__c', 'Imported Date'),
      textarea('Demo_Note__c', 'Demo Note', 255),
    ],
  },
];

const tabs = [
  { apiName: 'Matter__c', motif: 'Custom20: Airplane' },
  { apiName: 'Payer__c', motif: 'Custom20: Airplane' },
  { apiName: 'Matter_Payer__c', motif: 'Custom20: Airplane' },
  { apiName: 'Matter_Payment__c', motif: 'Custom20: Airplane' },
];

for (const object of objects) {
  write(
    join(sourceRoot, 'objects', object.apiName, `${object.apiName}.object-meta.xml`),
    objectXml(object),
  );

  for (const field of object.fields) {
    write(
      join(
        sourceRoot,
        'objects',
        object.apiName,
        'fields',
        `${field.fullName}.field-meta.xml`,
      ),
      fieldXml(field),
    );
  }
}

for (const tab of tabs) {
  write(
    join(sourceRoot, 'tabs', `${tab.apiName}.tab-meta.xml`),
    tabXml(tab),
  );
}

write(
  join(sourceRoot, 'applications', 'HLS_Appeals_Command_Center.app-meta.xml'),
  appXml(),
);

write(
  join(sourceRoot, 'permissionsets', 'HLS_Demo_Access.permissionset-meta.xml'),
  permissionSetXml(),
);

function text(fullName, label, length, options = {}) {
  return { fullName, label, length, type: 'Text', ...options };
}

function textarea(fullName, label, length) {
  return { fullName, label, type: 'TextArea' };
}

function longText(fullName, label, length, visibleLines) {
  return { fullName, label, length, visibleLines, type: 'LongTextArea' };
}

function url(fullName, label) {
  return { fullName, label, type: 'Url' };
}

function date(fullName, label, options = {}) {
  return { fullName, label, type: 'Date', ...options };
}

function checkbox(fullName, label, defaultValue) {
  return { fullName, label, defaultValue, type: 'Checkbox' };
}

function number(fullName, label, precision, scale, options = {}) {
  return { fullName, label, precision, scale, type: 'Number', ...options };
}

function currency(fullName, label, options = {}) {
  return { fullName, label, precision: 16, scale: 2, type: 'Currency', ...options };
}

function picklist(fullName, label, values, options = {}) {
  return {
    fullName,
    label,
    required: options.required,
    type: 'Picklist',
    valueSet: values.map((value, index) => ({
      fullName: value,
      label: value,
      default: index === 0 && options.defaultFirst === true,
    })),
  };
}

function lookup(
  fullName,
  label,
  referenceTo,
  relationshipName,
  relationshipLabel,
  options = {},
) {
  return {
    fullName,
    deleteConstraint: options.required ? 'Restrict' : 'SetNull',
    label,
    referenceTo,
    relationshipLabel,
    relationshipName,
    required: options.required,
    type: 'Lookup',
  };
}

function masterDetail(
  fullName,
  label,
  referenceTo,
  relationshipName,
  relationshipLabel,
) {
  return {
    fullName,
    label,
    referenceTo,
    relationshipLabel,
    relationshipName,
    reparentableMasterDetail: false,
    type: 'MasterDetail',
    writeRequiresMasterRead: false,
  };
}

function formulaCheckbox(fullName, label, formula) {
  return {
    fullName,
    formula,
    formulaTreatBlanksAs: 'BlankAsZero',
    label,
    type: 'Checkbox',
  };
}

function formulaCurrency(fullName, label, formula) {
  return {
    fullName,
    formula,
    formulaTreatBlanksAs: 'BlankAsZero',
    label,
    precision: 16,
    scale: 2,
    type: 'Currency',
  };
}

function formulaPercent(fullName, label, formula) {
  return {
    fullName,
    formula,
    formulaTreatBlanksAs: 'BlankAsZero',
    label,
    precision: 18,
    scale: 2,
    type: 'Percent',
  };
}

function formulaText(fullName, label, formula) {
  return {
    fullName,
    formula,
    formulaTreatBlanksAs: 'BlankAsBlank',
    label,
    type: 'Text',
  };
}

function rollupCount(fullName, label, summaryForeignKey) {
  return {
    fullName,
    label,
    summaryForeignKey,
    summaryOperation: 'count',
    type: 'Summary',
  };
}

function rollupSum(fullName, label, summaryForeignKey, summarizedField) {
  return {
    fullName,
    label,
    summaryForeignKey,
    summaryOperation: 'sum',
    summarizedField,
    type: 'Summary',
  };
}

function objectXml(object) {
  const lines = [
    xmlHeader('CustomObject'),
    tag('deploymentStatus', 'Deployed', 1),
    tag('description', object.description, 1),
    tag('enableActivities', object.enableActivities === true, 1),
    tag('enableBulkApi', true, 1),
    tag('enableFeeds', true, 1),
    tag('enableHistory', false, 1),
    tag('enableReports', true, 1),
    tag('label', object.label, 1),
    '    <nameField>',
  ];

  if (object.nameField.displayFormat) {
    lines.push(tag('displayFormat', object.nameField.displayFormat, 2));
  }

  lines.push(
    tag('label', object.nameField.label, 2),
    tag('type', object.nameField.type, 2),
    '    </nameField>',
    tag('pluralLabel', object.pluralLabel, 1),
    tag('enableSearch', true, 1),
    tag('sharingModel', object.sharingModel, 1),
    '</CustomObject>',
  );

  return `${lines.join('\n')}\n`;
}

function fieldXml(field) {
  const lines = [xmlHeader('CustomField'), tag('fullName', field.fullName, 1)];

  for (const key of [
    'caseSensitive',
    'defaultValue',
    'deleteConstraint',
    'description',
    'externalId',
    'formula',
    'formulaTreatBlanksAs',
    'label',
    'length',
    'precision',
    'referenceTo',
    'relationshipLabel',
    'relationshipName',
    'reparentableMasterDetail',
    'required',
    'scale',
    'summarizedField',
    'summaryFilterItems',
    'summaryForeignKey',
    'summaryOperation',
    'type',
    'unique',
    'visibleLines',
    'writeRequiresMasterRead',
  ]) {
    if (key === 'summaryFilterItems' && field.summaryFilterItems) {
      for (const item of field.summaryFilterItems) {
        lines.push('    <summaryFilterItems>');
        lines.push(tag('field', item.field, 2));
        lines.push(tag('operation', item.operation, 2));
        lines.push(tag('value', item.value, 2));
        lines.push('    </summaryFilterItems>');
      }
    } else if (field[key] !== undefined) {
      lines.push(tag(key, field[key], 1));
    }
  }

  if (field.valueSet) {
    lines.push('    <valueSet>');
    lines.push(tag('restricted', true, 2));
    lines.push('        <valueSetDefinition>');
    lines.push(tag('sorted', false, 3));
    for (const value of field.valueSet) {
      lines.push('            <value>');
      lines.push(tag('fullName', value.fullName, 4));
      lines.push(tag('default', value.default === true, 4));
      lines.push(tag('label', value.label, 4));
      lines.push('            </value>');
    }
    lines.push('        </valueSetDefinition>');
    lines.push('    </valueSet>');
  }

  lines.push('</CustomField>');
  return `${lines.join('\n')}\n`;
}

function tabXml(tab) {
  return [
    xmlHeader('CustomTab'),
    tag('customObject', true, 1),
    tag('motif', tab.motif, 1),
    '</CustomTab>',
    '',
  ].join('\n');
}

function appXml() {
  return [
    xmlHeader('CustomApplication'),
    '    <brand>',
    tag('headerColor', '#0176D3', 2),
    tag('shouldOverrideOrgTheme', false, 2),
    '    </brand>',
    tag(
      'description',
      'Lightning app shell for the HLS appeals command center demo.',
      1,
    ),
    tag('formFactors', 'Large', 1),
    tag('isNavAutoTempTabsDisabled', false, 1),
    tag('isNavPersonalizationDisabled', false, 1),
    tag('isNavTabPersistenceDisabled', false, 1),
    tag('isOmniPinnedViewEnabled', false, 1),
    tag('label', 'HLS Appeals Command Center', 1),
    tag('navType', 'Standard', 1),
    tag('tabs', 'Matter__c', 1),
    tag('tabs', 'Payer__c', 1),
    tag('tabs', 'Matter_Payer__c', 1),
    tag('tabs', 'Matter_Payment__c', 1),
    tag('uiType', 'Lightning', 1),
    '</CustomApplication>',
    '',
  ].join('\n');
}

function permissionSetXml() {
  const fieldPermissions = objects
    .flatMap((object) =>
      object.fields
        .filter((field) => field.required !== true && field.type !== 'MasterDetail')
        .map((field) => {
          const editable = !field.formula && field.type !== 'Summary';
          return [
            '    <fieldPermissions>',
            tag('editable', editable, 2),
            tag('field', `${object.apiName}.${field.fullName}`, 2),
            tag('readable', true, 2),
            '    </fieldPermissions>',
          ].join('\n');
        }),
    )
    .join('\n');

  const objectPermissions = objects
    .map((object) =>
      [
        '    <objectPermissions>',
        tag('allowCreate', true, 2),
        tag('allowDelete', false, 2),
        tag('allowEdit', true, 2),
        tag('allowRead', true, 2),
        tag('modifyAllRecords', false, 2),
        tag('object', object.apiName, 2),
        tag('viewAllRecords', false, 2),
        '    </objectPermissions>',
      ].join('\n'),
    )
    .join('\n');

  const tabSettings = tabs
    .map((tab) =>
      [
        '    <tabSettings>',
        tag('tab', tab.apiName, 2),
        tag('visibility', 'Visible', 2),
        '    </tabSettings>',
      ].join('\n'),
    )
    .join('\n');

  return [
    xmlHeader('PermissionSet'),
    '    <applicationVisibilities>',
    tag('application', 'HLS_Appeals_Command_Center', 2),
    tag('visible', true, 2),
    '    </applicationVisibilities>',
    tag(
      'description',
      'Access to HLS appeals demo objects, fields, app, and tabs.',
      1,
    ),
    fieldPermissions,
    tag('hasActivationRequired', false, 1),
    tag('label', 'HLS Demo Access', 1),
    objectPermissions,
    tabSettings,
    '</PermissionSet>',
    '',
  ].join('\n');
}

function write(filePath, content) {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, content);
}

function xmlHeader(type) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<${type} xmlns="${xmlns}">`;
}

function tag(name, value, indent) {
  return `${'    '.repeat(indent)}<${name}>${escapeXml(String(value))}</${name}>`;
}

function escapeXml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
