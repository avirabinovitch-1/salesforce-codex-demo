# HLS Salesforce Demo Build Plan

## Source Brief

Approved source of truth: `/Users/avirabinovitch/Desktop/Pre-Sales Demo Building/HLS Salesforce Demo Discovery Brief.md`

This plan is based on the approved HLS Salesforce Demo Discovery Brief and the requested MVP demo story: "From legacy, batch-driven appeals management to a real-time healthcare appeals command center."

No Salesforce metadata changes or deployments are included in this planning step.

## Repository And Org Inspection Summary

### Local Salesforce DX Project

| Area | Finding |
|---|---|
| Project path | `/Users/avirabinovitch/Desktop/salesforce-codex-demo` |
| Package directories | `force-app` is the default package directory in `sfdx-project.json`, but the folder does not exist yet. |
| API version | `sourceApiVersion` is `67.0`. |
| Existing local objects | None found in source. |
| Existing local apps | None found in source. |
| Existing local permission sets | None found in source. |
| Existing local flows | None found in source. |
| Existing local Apex | No classes or triggers. Only sample script `scripts/apex/hello.apex`. |
| Existing local LWCs | None found in source. |
| Existing local reports/dashboards | None found in source. |
| Existing scripts | `scripts/soql/account.soql` and `scripts/apex/hello.apex`. |
| Naming conventions | Default Salesforce DX scaffold conventions only. No HLS-specific convention exists yet. |
| Deployment target | Local Salesforce config points `target-org` to `codexdev`. |

### Connected Org Read-Only Inspection

| Area | Finding |
|---|---|
| Default target org | `codexdev`, from local config at `/Users/avirabinovitch/Desktop/salesforce-codex-demo/.sf/config.json`. |
| Standard foundations | `Account`, `Case`, `Task`, `ContentDocument`, `ContentDocumentLink`, `User`, and `PermissionSet` are available. |
| Custom objects | No custom objects returned from Tooling API `CustomObject`. |
| Relevant HLS/Matter objects | No existing `Matter`, `HLS`, `Appeal`, `Denial`, `Claim`, `Patient`, `Payer`, or custom submission objects found. |
| Existing payment objects | Standard/package payment objects exist, including `Payment`, `PaymentMethod`, `PaymentGateway`, and related payment entities. They are not HLS appeal recovery records. |
| Apps | Standard apps and `Developer_Edition` app exist. No HLS Matters app found. |
| Permission sets | Default, packaged, and Developer Edition permission sets exist. No HLS demo permission set found. |
| Flows | No HLS/Matter/Appeal/Payment/Submission/Claim/Denial flows found. |
| Apex | No HLS-domain Apex classes found. |
| LWCs | No HLS-domain Lightning Web Components found. |
| Reports/dashboards | No HLS-domain reports or dashboards found. |
| Queues | No HLS-domain queues found. |

### Reuse Versus New Build

Reuse:

- `Account` for hospital/client accounts.
- `Task` for automated follow-ups.
- Salesforce Files through `ContentDocument` and `ContentDocumentLink` for documents and evidence.
- Standard Lightning record pages, Dynamic Forms, related lists, Path, activities, reports, dashboards, and queues.
- Standard `Case` only as a comparison point, not as the recommended MVP Matter record.

Create new:

- `Matter__c` as the central appeal record.
- `Payer__c` as the reusable payer reference object.
- `Matter_Payer__c` as the junction between Matter and Payer, with the payer role/order for Primary, Secondary, and Tertiary.
- `Matter_Payment__c` as the payment child object.
- HLS Matters console app, tabs, layouts, compact layouts, Lightning record pages, queues, flows, reports, dashboards, demo data scripts, and demo access permission set.

## Demo Objective

The demo should show Salesforce as the command center for HLS healthcare appeals work, replacing the feel of batch-driven Time Matters, Access, Excel, shared-drive, SQL, and bot workarounds with a live Salesforce workspace. The opening scene should give an operations manager immediate visibility into workload, aging, overdue follow-ups, high-dollar matters, productivity, payer mix, and payment outcomes. The specialist workflow should move from intake through assignment, Matter workspace review, payer roles, documents/evidence, automated follow-up, payment rollups, and billing readiness. The close should explain compliance and integration strategy as a talk track without building real PHI handling, MuleSoft integrations, payer portals, fax/mail automation, document generation, a submission object, or an integration-event object.

## Recommended Architecture

Recommended approach: build a custom `Matter__c` object for the MVP demo.

Why:

- The repo and org do not already contain an HLS Matter model.
- HLS uses "Matter" as the business term, and the demo needs that term front and center.
- A custom object is the cleanest way to present flat patient, encounter, claim, denial, status, payer relationships, and payment rollup fields without fighting Case semantics.
- Payers should be modeled as reusable records through `Payer__c`, with `Matter_Payer__c` as the role/order junction. This avoids hard-coding payer names into Matter fields while still making Primary, Secondary, and Tertiary payer roles explicit for the demo.
- A custom object keeps the demo source-controlled and low-risk in a Developer Edition org.
- It avoids over-rotating into a production Health Cloud or Service Cloud architecture before HLS confirms the long-term implementation shape.

Tradeoff versus standard `Case`:

- `Case` brings familiar Service Cloud capabilities, assignment rules, queues, escalation patterns, and console behavior.
- `Case` also carries support-service language and existing fields that may distract from the HLS-specific Matter story.
- For a production implementation, `Case` or Health Cloud objects should be revisited if HLS wants native service entitlements, Omni-Channel, SLA/escalation management, or deeper Health Cloud alignment.
- For this persuasive MVP demo, `Matter__c` is faster, cleaner, and more explicit.

## Objects And Fields

### Account

| Attribute | Plan |
|---|---|
| API name | `Account` |
| Purpose | Represent hospital and health system clients, such as Northstar Regional Medical Center. |
| Create or modify | Reuse standard object. No metadata changes required for MVP. |
| Relationships | Parent lookup from `Matter__c.Client__c`. |
| Required fields | Standard `Name`. |
| Demo notes | Use Account records as client anchors for reporting by hospital/client. |

### Matter

| Attribute | Plan |
|---|---|
| API name | `Matter__c` |
| Purpose | Central appeal/denial workspace and command record. |
| Relationship model | Parent to `Matter_Payer__c` and `Matter_Payment__c`; lookup to `Account` for client. |
| Name field | Auto Number, display format `HLS-APL-{0000}`. |
| Required fields | `Client__c`, `Status__c`, `Dollar_Placed__c`. Require at least one Primary payer through demo data discipline or validation after the base model is stable. |
| Demo notes | This should be the main record opened during the specialist workflow. |

Matter fields:

| Field API name | Type | Notes |
|---|---|---|
| `Client__c` | Lookup(Account) | Hospital/client. Required. |
| `Patient_First_Name__c` | Text(40) | Fictional patient data only. |
| `Patient_Last_Name__c` | Text(80) | Fictional patient data only. |
| `Patient_Account_Number__c` | Text(50) | Demo account number. |
| `MRN__c` | Text(50) | Fictional MRN. |
| `Patient_Date_of_Birth__c` | Date | Fictional date. |
| `Encounter_ID__c` | Text(50) | Flat encounter reference. |
| `Claim_ID__c` | Text(50) | Flat claim reference. |
| `Service_Date__c` | Date | Encounter/service date. |
| `Denial_Date__c` | Date | Denial date. |
| `Denial_Reason__c` | Picklist | Medical Necessity, Timely Filing, Authorization, Coding, Eligibility, Other. |
| `Appeal_Level__c` | Picklist | First-level Appeal, Second-level Appeal, External Review, Reconsideration. |
| `Status__c` | Picklist | Intake, Documentation Needed, Appeal Drafting, Ready for Submission, Submitted, Follow-up Due, Response Received, Payment Posted, Closed. |
| `Disposition__c` | Picklist | Appeal Pending, Submitted Online, Fax Submitted, Print/Mail Submitted, Response Received, Payment Posted, Closed. |
| `Dollar_Placed__c` | Currency(16,2) | Required. |
| `Due_Date__c` | Date | Operational due date. |
| `Submission_Channel__c` | Picklist | Online Portal, Fax, Print/Mail, API, Other. Matter-level submission visibility only; do not build a separate submission object. |
| `Submission_Status__c` | Picklist | Not Started, Ready for Submission, Submitted, Response Received, Failed, Not Required. |
| `Submitted_Date__c` | Date | Date the appeal was submitted through the selected channel. |
| `Confirmation_Number__c` | Text(80) | Portal, fax, mail, or API confirmation reference. |
| `Response_Due_Date__c` | Date | Expected payer response date. |
| `Follow_Up_Due_Date__c` | Date | Set by follow-up flow or user. |
| `Next_Action__c` | Text(255) | Demo guidance such as "Verify Acme payment and mark billing ready." |
| `Assignment_Reason__c` | Text Area(255) | Visible explanation of queue routing. |
| `Integration_Source__c` | Picklist | Client File, API, RPA Handoff, Manual Demo Intake. |
| `Integration_Status__c` | Picklist | Received, Validated, Needs Review, Error. |
| `Close_Reason__c` | Picklist | Paid, Denied, Withdrawn, Duplicate, Client Closed, Other. |
| `Payer_Record_Count__c` | Roll-Up Summary COUNT | Counts related `Matter_Payer__c` records. |
| `Payment_Record_Count__c` | Roll-Up Summary COUNT | Counts related `Matter_Payment__c` records. |
| `Total_Payments__c` | Roll-Up Summary SUM | Sums `Matter_Payment__c.Payment_Amount__c`. |
| `Billable_Payments__c` | Roll-Up Summary SUM | Sums `Matter_Payment__c.Billable_Amount__c`. |
| `Non_Billable_Payments__c` | Roll-Up Summary SUM | Sums `Matter_Payment__c.Non_Billable_Amount__c`. |
| `Total_Adjustments__c` | Roll-Up Summary SUM | Sums `Matter_Payment__c.Adjustment_Amount__c`. |
| `Pending_Review_Payment_Count__c` | Roll-Up Summary COUNT | Filtered count where payment status/code requires review. |
| `Percent_Paid__c` | Formula Percent | `Total_Payments__c / Dollar_Placed__c` when dollar placed is greater than zero. |
| `Billing_Readiness__c` | Picklist | Not Ready, Ready for Review, Needs Payment Review, Billed. Updated manually or by payment/readiness flow. |
| `Net_Recovery__c` | Formula Currency | MVP should show actual payments; adjustments remain separate. |

### Payer

| Attribute | Plan |
|---|---|
| API name | `Payer__c` |
| Purpose | Reusable payer reference object for health plans, supplemental payers, assistance programs, and patient-responsibility placeholders. |
| Relationship model | Parent reference for `Matter_Payer__c`; optional lookup from `Matter_Payment__c` only if direct payment-to-payer reporting needs it. |
| Name field | Text, payer name. |
| Required fields | Standard `Name`. |
| Demo notes | Keeps payer names normalized instead of storing Primary, Secondary, and Tertiary payer as text fields on Matter. |

Payer fields:

| Field API name | Type | Notes |
|---|---|---|
| `Payer_Type__c` | Picklist | Commercial, Medicare Advantage, Medicaid, Supplemental, Assistance Program, Patient Responsibility, Other. |
| `External_Payer_Id__c` | Text(80), External ID | Optional stable key for demo reloads and future integration talk track. |
| `Portal_URL__c` | URL | Optional demo reference for payer portal context. |
| `Active__c` | Checkbox | Defaults true. |
| `Notes__c` | Long Text Area | Demo notes or payer-specific handling notes. |

### Matter Payer

| Attribute | Plan |
|---|---|
| API name | `Matter_Payer__c` |
| Purpose | Junction object that relates one Matter to one Payer and identifies whether the payer is Primary, Secondary, Tertiary, or another role. |
| Relationship model | Master-Detail to `Matter__c`; lookup to `Payer__c` so payer records stay reusable across many matters. |
| Name field | Auto Number, display format `MP-{0000}`. |
| Required fields | `Matter__c`, `Payer__c`, `Payer_Role__c`, `Payer_Order__c`. |
| Demo notes | This is the recommended way to show payer 1, payer 2, and payer 3 without locking the data model into three text fields. |

Matter Payer fields:

| Field API name | Type | Notes |
|---|---|---|
| `Matter__c` | Master-Detail(Matter__c) | Required parent Matter. |
| `Payer__c` | Lookup(Payer__c) | Required payer reference. |
| `Payer_Role__c` | Picklist | Primary, Secondary, Tertiary, Other. |
| `Payer_Order__c` | Number(1,0) | Use 1, 2, or 3 for demo sorting and validation. |
| `Is_Primary__c` | Formula Checkbox | True when `Payer_Order__c = 1` or role is Primary. |
| `Coverage_Type__c` | Picklist | Medical, Supplemental, Assistance, Patient Responsibility, Other. |
| `Policy_Number__c` | Text(80) | Fictional policy/reference number. |
| `Group_Number__c` | Text(80) | Fictional group/reference number. |
| `Effective_Date__c` | Date | Optional. |
| `Termination_Date__c` | Date | Optional. |
| `Assignment_Notes__c` | Text Area(255) | Why this payer is in the role/order for this Matter. |

### Matter Payment

| Attribute | Plan |
|---|---|
| API name | `Matter_Payment__c` |
| Purpose | Child payment, reimbursement, adjustment, or review item related to one Matter. |
| Relationship model | Master-Detail to `Matter__c` so native roll-up summaries work; lookup to `Matter_Payer__c` to identify which payer role generated the payment. |
| Name field | Auto Number, display format `PAY-{0000}`. |
| Required fields | `Matter__c`, `Payment_Date__c`, `Payment_Type__c`, `HLS_Code__c`. Require `Matter_Payer__c` when the payment is payer-specific. |
| Demo notes | Use this instead of the standard/package `Payment` object to avoid semantic collision with Revenue/Commerce payment entities. |

Matter Payment fields:

| Field API name | Type | Notes |
|---|---|---|
| `Matter__c` | Master-Detail(Matter__c) | Required parent relationship. |
| `Matter_Payer__c` | Lookup(Matter_Payer__c) | Optional for non-payer rows such as patient responsibility; required for Primary, Secondary, and Tertiary payer payments. |
| `Payment_Date__c` | Date | Required. |
| `Payer_Role__c` | Formula Text | Optional display field from `Matter_Payer__c.Payer_Role__c`; use only if supported cleanly. |
| `Payer_Name__c` | Formula Text | Optional display field from related Payer; use only if supported cleanly. |
| `Payment_Type__c` | Picklist | Reimbursement, Adjustment, Patient Responsibility, Small Balance Correction, Recoupment. |
| `Source_System__c` | Picklist | Payer Portal, Client System, Manual Demo Import, RPA Handoff, API. |
| `Payment_Amount__c` | Currency(16,2) | Payment/reimbursement amount. |
| `Billable_Amount__c` | Currency(16,2) | Amount eligible for billing review. |
| `Non_Billable_Amount__c` | Currency(16,2) | Patient responsibility or other non-billable amount. |
| `Adjustment_Amount__c` | Currency(16,2) | Contractual or balance adjustment. |
| `HLS_Code__c` | Picklist | Verify Pay, Billable, Non-billable, Adjustment, Pending Review. |
| `Verify_Pay__c` | Checkbox | Flags items requiring verification. |
| `Invoice_Status__c` | Picklist | Not Ready, Ready for Review, Hold, Exported. |
| `Payment_Reference__c` | Text(80) | Check, remittance, or transaction reference. |
| `Imported_Date__c` | Date | Demo import date. |
| `Demo_Note__c` | Text Area(255) | Short demo explanation. |

### Task

| Attribute | Plan |
|---|---|
| API name | `Task` |
| Purpose | Automated and manual follow-up work. |
| Create or modify | Reuse standard object. No custom fields required for MVP. |
| Relationships | `WhatId` relates tasks to `Matter__c`. |
| Required fields | Standard task fields: `Subject`, `Status`, `Priority`, `ActivityDate`. |
| Demo notes | Follow-up tasks should appear on the Matter activity timeline and in manager reports. |

### Salesforce Files

| Attribute | Plan |
|---|---|
| API names | `ContentDocument`, `ContentDocumentLink` |
| Purpose | Related medical records, payer response letters, prior appeal packet, denial packet, and evidence files. |
| Create or modify | Reuse standard Files. No metadata changes required. |
| Relationships | Files linked to Matter. |
| Demo notes | Do not build S-Docs or document generation. Use representative fictional evidence files or file links only. |

## Automation

| Automation | Type | Purpose | MVP behavior |
|---|---|---|---|
| `HLS_Assign_Matter_To_Work_Queue` | Record-triggered Flow on `Matter__c` or `Matter_Payer__c` | Demonstrate automated assignment and queue routing. | On create/update, route high-dollar matters to a high-dollar queue, payer-specific matters to a payer queue, and unmatched matters to intake review. Set `Assignment_Reason__c`. |
| `HLS_Create_Matter_Follow_Up_Task` | Record-triggered Flow on `Matter__c` | Create consistent follow-up work. | When a Matter is Submitted or enters Follow-up Due and has `Follow_Up_Due_Date__c` or `Response_Due_Date__c`, create a follow-up Task tied to the Matter. |
| `HLS_Update_Matter_On_Payment` | Record-triggered Flow on `Matter_Payment__c` | Support payment/billing readiness story. | When payments are added or updated, move Matter to Payment Posted when appropriate and set/recalculate readiness fields if formulas alone are not enough. |
| `HLS_Close_Follow_Up_On_Response` | Record-triggered Flow on `Matter__c` | Avoid stale follow-up tasks. | When response/payment is received, close or mark related follow-up tasks complete. |

Rollup logic:

- Prefer native roll-up summary fields from `Matter_Payment__c` to `Matter__c` by using Master-Detail.
- Use formula fields for percent paid and simple billing-readiness indicators.
- Use Flow only where roll-up summary and formula fields cannot express the demo logic cleanly.
- No Apex is recommended for MVP unless Flow limitations block a key demo moment.

Assignment and queue concept:

- Create queues such as `HLS_Intake_Review`, `HLS_High_Dollar_Appeals`, and `HLS_Follow_Up`.
- Use owner assignment on `Matter__c` to show queue routing.
- Use the Matter owner or a follow-up owner for Tasks depending on what the org supports cleanly.

Validation and guardrails:

- Add a validation rule on `Matter_Payer__c` requiring `Payer_Order__c` to be 1, 2, or 3 for Primary, Secondary, and Tertiary roles.
- Add a simple role/order consistency rule if it deploys cleanly: Primary = 1, Secondary = 2, Tertiary = 3.
- Do not build cross-record uniqueness enforcement for MVP; use demo data discipline so each Matter has only one Primary, Secondary, and Tertiary payer.

## User Experience

| UX element | Plan |
|---|---|
| App | Create `HLS Matters` Lightning console app. |
| Navigation items | Matters, Accounts, Payers, Matter Payers, Matter Payments, Tasks, Reports, Dashboards. |
| Matter record page | Use Dynamic Forms or standard Lightning Record Page sections for summary, patient/claim, payer roles, Matter-level submission status, payment rollups, assignment, follow-up, and compliance notes. |
| Highlights panel | Show Matter number, status, client, dollar placed, total payments, percent paid, billing readiness, and follow-up/response due date. Show payer roles in a prominent related list, not cached Matter fields. |
| Compact layout | Optimize for status, client, dollar placed, total payments, billing readiness, and follow-up due date. |
| Path | Use `Matter__c.Status__c` as the lifecycle Path. |
| Related lists | Matter Payers, Matter Payments, Files, Tasks, Activity. |
| Documents/evidence | Use Files related list and Matter evidence/context fields. |
| Payment visibility | Use related list plus Matter rollup fields. A custom LWC is not needed for MVP. |
| Quick actions | Add demo-friendly actions such as Add Payment, Mark Submitted, Mark Follow-Up Due, Mark Payment Posted, and Ready for Billing Review. |
| Manager opening scene | Use dashboard as first screen, then drill into a Matter. |
| Compliance talk track | Include visible field history/audit-readiness notes where possible, and explain Shield/Event Monitoring as production hardening. |

## Reports And Dashboards

### Reports

| Report | Purpose |
|---|---|
| HLS Active Matters by Status | Manager view of current workload and lifecycle bottlenecks. |
| HLS Overdue Follow-Ups | Show stalled work that would otherwise rely on Access queries. |
| HLS High-Dollar Matters | Surface matters with high dollar placed amounts. |
| HLS Submission Status by Channel | Show Matter-level submission status by online portal, fax, print/mail, API, or other channel. |
| HLS Response Due and Submission Aging | Show submitted Matters approaching or past response/follow-up dates. |
| HLS Matters by Payer Role | Show primary, secondary, and tertiary payer distribution by Matter. |
| HLS Productivity by Owner | Show active and completed work by user/queue. |
| HLS Payment Recovery by Client | Show payments, billable amounts, non-billable amounts, and adjustments by client. |
| HLS Payment Recovery by Payer | Show recoveries by payer and payer role. |
| HLS Billing Readiness Review | Show matters ready for payment/billing review. |
| HLS Matter Outcomes | Show closed matters by outcome and close reason. |

### Dashboard

Dashboard name: `HLS Operations Command Center`

Recommended components:

- Active Matters KPI.
- Overdue Follow-Ups KPI.
- High-Dollar Matters table.
- Matters by Status chart.
- Submission Status by Channel chart.
- Response Due / Aging table.
- Matters by Payer Role chart.
- Productivity by Owner chart.
- Payment Recovery by Client chart.
- Payment Recovery by Payer chart.
- Billing Readiness table.

## Demo Data

### Core Records

| Record | Demo data |
|---|---|
| Account | Northstar Regional Medical Center |
| Matter | `HLS-APL-1007` |
| Payers | Acme Health Plan, BluePeak Supplemental, County Assistance Program, Patient responsibility |
| Matter payer roles | Acme Health Plan = Primary / order 1; BluePeak Supplemental = Secondary / order 2; County Assistance Program = Tertiary / order 3 |
| Dollar placed | `$124,800` |
| Appeal level | First-level Appeal |
| Current status | Payment Posted |
| Submission channel/status | Online Portal / Response Received |
| Confirmation number | `ACME-PORTAL-88421` |
| Response due date | Recent date suitable for demo context |
| Next action | Verify Acme payment and mark billing ready |
| Billing readiness | Ready for Review |

### Seven Payment Records

| Payment | Payer role | Payer name | Type | Amount | Billable | Non-billable | Adjustment | HLS code/status |
|---|---|---|---|---:|---:|---:|---:|---|
| Primary payer payment | Primary | Acme Health Plan | Reimbursement | $32,450 | $32,450 | $0 | $0 | Verify Pay |
| Interest payment | Primary | Acme Health Plan | Reimbursement | $1,220 | $1,220 | $0 | $0 | Billable |
| Contractual adjustment | Primary | Acme Health Plan | Adjustment | $0 | $0 | $0 | $4,000 | Adjustment |
| Secondary payment | Secondary | BluePeak Supplemental | Reimbursement | $18,750 | $18,750 | $0 | $0 | Verify Pay |
| Patient responsibility | None | Patient responsibility | Patient Responsibility | $3,500 | $0 | $3,500 | $0 | Non-billable |
| Tertiary payer payment | Tertiary | County Assistance Program | Reimbursement | $9,800 | $9,800 | $0 | $0 | Verify Pay |
| Small balance correction | Primary | Acme Health Plan | Small Balance Correction | $0 | $0 | $0 | $0 | Pending Review |

Expected Matter rollup display:

| Rollup | Value |
|---|---:|
| Payment records | 7 |
| Total payments | $65,720 |
| Billable payments | $62,220 |
| Non-billable payments | $3,500 |
| Adjustments | $4,000 |
| Percent paid | 52.7% |
| Billing readiness | Ready for Review |

Additional demo data:

- Four `Payer__c` records: Acme Health Plan, BluePeak Supplemental, County Assistance Program, and Patient responsibility.
- Three `Matter_Payer__c` records for Primary, Secondary, and Tertiary payer roles on `HLS-APL-1007`.
- One follow-up task related to the Matter.
- Three to four representative fictional file names linked to the Matter, such as medical records, prior appeal packet, denial packet, and payer response letter.
- Eight to twelve supporting Matters across statuses, owners, payer roles, overdue follow-ups, submission channels, and billing readiness values so the operations dashboard feels real before drilling into the hero Matter.

Supporting Matter seed-data pattern:

| Matter profile | Demo purpose |
|---|---|
| Intake / high dollar / unassigned | Shows new work arriving and assignment value. |
| Documentation Needed / fax channel | Shows evidence/document gap. |
| Ready for Submission / online portal | Shows work queued for action. |
| Submitted / overdue response | Drives overdue follow-up KPI. |
| Follow-up Due / high-dollar payer | Drives queue and aging reports. |
| Response Received / needs payment review | Bridges submission to payment. |
| Payment Posted / ready for review | Shows billing readiness. |
| Closed / paid | Gives outcome reporting something to count. |

Recommended data loading approach after metadata approval:

- Use simple CSV files or Salesforce data tree files under `scripts/data/hls/`.
- Use stable external IDs where helpful, such as `External_Matter_Id__c`, if demo reloads will be repeated.
- Keep all data fictional and safe for screenshots.

## Permission Sets

| Permission set | Purpose | Access |
|---|---|---|
| `HLS_Matters_Demo_User` | Main demo user access. | HLS Matters app visibility; read/create/edit on `Matter__c`, `Payer__c`, `Matter_Payer__c`, `Matter_Payment__c`; read Account; create/edit Tasks; Files access as needed. |
| `HLS_Matters_Demo_Manager` | Optional manager/demo presenter access. | Same as demo user plus report/dashboard folder access and broader read visibility for manager views. |

For MVP speed, one permission set can be built first: `HLS_Matters_Demo_User`.

## Files To Change

Current planning file:

- `discovery/hls/build-plan.md`

Expected implementation files after approval:

| Metadata area | Expected files |
|---|---|
| Custom objects | `force-app/main/default/objects/Matter__c/Matter__c.object-meta.xml`, `Payer__c`, `Matter_Payer__c`, `Matter_Payment__c`. |
| Fields | `force-app/main/default/objects/*/fields/*.field-meta.xml`. |
| Compact layouts | `force-app/main/default/objects/*/compactLayouts/*.compactLayout-meta.xml`. |
| List views | `force-app/main/default/objects/*/listViews/*.listView-meta.xml`. |
| Validation rules | `force-app/main/default/objects/Matter_Payer__c/validationRules/*.validationRule-meta.xml` for payer role/order guardrails. |
| Tabs | `force-app/main/default/tabs/*.tab-meta.xml`. |
| App | `force-app/main/default/applications/HLS_Matters.app-meta.xml`. |
| Quick actions | `force-app/main/default/objects/Matter__c/quickActions/*.quickAction-meta.xml` for the demo click path. |
| Lightning pages | `force-app/main/default/flexipages/HLS_Matter_Record_Page.flexipage-meta.xml`, optional app/home pages. |
| Layouts | `force-app/main/default/layouts/*.layout-meta.xml`. |
| Permission sets | `force-app/main/default/permissionsets/HLS_Matters_Demo_User.permissionset-meta.xml`, optional manager permission set. |
| Queues | `force-app/main/default/queues/*.queue-meta.xml` and related queue/object metadata as needed. |
| Flows | `force-app/main/default/flows/HLS_Assign_Matter_To_Work_Queue.flow-meta.xml`, `HLS_Create_Matter_Follow_Up_Task.flow-meta.xml`, optional payment/readiness flows. |
| Report types | `force-app/main/default/reportTypes/*.reportType-meta.xml` for Matter with Payers, Matter with Payments, and Payment Recovery by Payer. |
| Reports | `force-app/main/default/reports/HLS_Matters/*.report-meta.xml`. |
| Dashboards | `force-app/main/default/dashboards/HLS_Operations/*.dashboard-meta.xml`. |
| Demo data | `scripts/data/hls/*.csv` or data tree JSON files. |
| Demo script/readme | `discovery/hls/demo-script.md` or an HLS section in `README.md`. |

## Validation Plan

Run these checks before deployment:

1. Confirm changed source:
   - `git status --short`
   - `sf project deploy preview --source-dir force-app/main/default --target-org codexdev`
2. Validate metadata without committing changes to the org:
   - `sf project deploy start --dry-run --source-dir force-app/main/default --target-org codexdev --test-level NoTestRun`
3. If Apex is introduced later, run tests:
   - `sf apex run test --target-org codexdev --test-level RunLocalTests --code-coverage`
4. Validate demo data load separately after metadata deploy:
   - `sf data import tree --target-org codexdev --files scripts/data/hls/demo-data-plan.json`
   - Or use CSV import/upsert commands if CSV is chosen.
5. Smoke-test in the org:
   - Open HLS Matters app.
   - Confirm Matter record page renders.
   - Confirm Path shows lifecycle statuses.
   - Confirm payer role related list shows Primary, Secondary, and Tertiary payers.
   - Confirm Matter-level submission fields show channel, status, confirmation number, and response due date.
   - Confirm payment rollups match the seven-record payment set.
   - Confirm Matter follow-up task is created.
   - Confirm quick actions support the main demo path.
   - Confirm supporting seed Matters populate dashboard charts and KPIs.
   - Confirm manager dashboard loads.

## Deployment Plan

Do not run deployment until the plan is approved.

Recommended deployment steps after approval:

1. Deploy data model first:
   - `sf project deploy start --source-dir force-app/main/default/objects --target-org codexdev --test-level NoTestRun`
2. Deploy permission set:
   - `sf project deploy start --source-dir force-app/main/default/permissionsets --target-org codexdev --test-level NoTestRun`
3. Deploy app and UX metadata:
   - `sf project deploy start --source-dir force-app/main/default/applications --source-dir force-app/main/default/tabs --source-dir force-app/main/default/layouts --source-dir force-app/main/default/flexipages --target-org codexdev --test-level NoTestRun`
4. Deploy automation:
   - `sf project deploy start --source-dir force-app/main/default/flows --target-org codexdev --test-level NoTestRun`
5. Deploy reports and dashboards:
   - `sf project deploy start --source-dir force-app/main/default/reportTypes --source-dir force-app/main/default/reports --source-dir force-app/main/default/dashboards --target-org codexdev --test-level NoTestRun`
6. Assign permission set to demo user:
   - `sf org assign permset --name HLS_Matters_Demo_User --target-org codexdev`
7. Load demo data:
   - Use the selected CSV or data tree import approach under `scripts/data/hls/`.

## Risks And Assumptions

| Category | Item | Impact | Recommendation |
|---|---|---|---|
| Decision | Use custom `Matter__c` for MVP instead of `Case`. | Stronger HLS terminology and cleaner demo, but less native Service Cloud behavior. | Approve custom Matter for demo; revisit Case/Health Cloud for production architecture. |
| Decision | Use `Payer__c` plus `Matter_Payer__c` instead of Primary/Secondary/Tertiary text fields on Matter. | Slightly more metadata, but cleaner reporting, reuse, and role/order tracking. | Build the junction model and keep payer-role UX prominent on the Matter page. |
| Decision | Keep submission visibility as fields on `Matter__c`, not a separate `Appeal_Submission__c` object. | Preserves the demo story while keeping the model lean. | Build Matter-level submission fields and reports, with submission object explicitly out of scope. |
| Risk | Standard/package `Payment` objects exist in the org. | Reusing them could confuse revenue/commerce payment concepts with appeal recovery payments. | Use `Matter_Payment__c` for the demo. |
| Risk | `force-app` does not exist yet. | Implementation will create the metadata tree from scratch. | Build carefully in small deployable slices. |
| Risk | Report and dashboard metadata can be fussy in Salesforce DX. | Some dashboard polish may need retrieve/edit/iterate cycles. | Build report types and reports first, then dashboard. |
| Risk | Shield/Event Monitoring may not be fully licensed in Developer Edition. | Compliance may need to be a talk track, not a live product screen. | Use permission sets, field history where available, and architecture notes for Shield. |
| Risk | Flow-based assignment and follow-up logic can get overbuilt. | Overbuilding will slow the MVP. | Keep flows demo-simple and visible. |
| Assumption | Real PHI will not be used. | Keeps the demo safe for screenshots and repeat use. | Use fictional data only. |
| Assumption | Document generation remains out of scope. | Avoids S-Docs and template complexity. | Use Salesforce Files and evidence links only. |
| Assumption | Invoice generation remains out of scope. | Billing readiness is enough for MVP. | Stop at payment review and reporting. |
| Open question | Should there be one or two permission sets? | One is faster; two better separates manager/demo user access. | Start with `HLS_Matters_Demo_User`; add manager only if needed. |

## Build Sequence

After approval, implement in this order:

1. Data model:
   - Create `force-app`.
   - Create `Matter__c`, `Payer__c`, `Matter_Payer__c`, and `Matter_Payment__c`.
   - Create fields, rollups, formulas, validation rules, compact layouts, list views, and tabs.
2. Permission set:
   - Create `HLS_Matters_Demo_User`.
   - Add object, field, app, tab, report/dashboard access as needed.
3. App and UX metadata:
   - Create HLS Matters console app.
   - Create Matter record page, layouts, Path, related lists, and quick actions.
4. Automation:
   - Create assignment flow.
   - Create Matter follow-up task flow.
   - Add payment/readiness automation only if rollups/formulas are insufficient.
5. Reports and dashboard:
   - Create report types.
   - Create manager reports.
   - Create HLS Operations Command Center dashboard.
6. Demo data scripts:
   - Create fictional Account, hero Matter, supporting Matters, Payers, Matter Payers, seven hero Payments, supporting payment/task rows, and Files/evidence placeholders.
7. README/demo script:
   - Write click path, talk track, and validation notes.
8. Validation:
   - Run dry-run deployment.
   - Deploy only after approval.
   - Load demo data and smoke-test the app.

## Out Of Scope

The MVP demo will not build:

- S-Docs.
- Document generation.
- Real PHI.
- Real MuleSoft integrations.
- Separate appeal submission object.
- Integration event object.
- Real payer portal automation.
- Real fax/mail integrations.
- Full invoice generation.
- Accounting integration.
- Full Health Cloud production architecture.
- Data migration tooling beyond demo sample data.
- Client-facing Power BI replacement.
- Advanced AI document reading or next-action recommendation.
- Full HL7/FHIR architecture.

## Implementation Rules

- This build plan is the approval checkpoint.
- Do not create Salesforce metadata until Avi approves the plan.
- Do not deploy anything until Avi approves deployment.
- Keep the demo easy to explain, visually compelling, grounded in the approved brief, fast to navigate, safe for fictional healthcare data, source-controlled, deployable through Salesforce CLI, and not overbuilt.
