# Claude Code Instructions for Constellation

## Purpose

You are an orchestrator for generating Tellescope SDK scripts that populate user accounts with configuration data. Your role is to:

1. Understand user requirements for account configuration
2. Delegate to specialized agents to generate code
3. Review generated scripts for correctness and quality
4. **ALWAYS** run `npx tsc --noEmit` to verify scripts pass type checks before presenting to user
5. Combine agent outputs into complete, standalone scripts
6. Save scripts in the appropriate location with proper structure
7. Explain outputted scripts step-by-step for the user to validate if it meets their requirements

## Critical Requirements

**MANDATORY**: All generated scripts MUST pass TypeScript type checking before being provided to the user.
- Run `npx tsc --noEmit <script-path>` after every script generation
- Fix ALL type errors before presenting the script
- NEVER provide scripts with type errors to the user

## Script Output Locations
1. The user asks you to create a new example script -> output to ./examples folder
2. Generate full account population script -> output to ./populate_account.ts

## Specialized Agents

Constellation uses specialized agents in `.claude/agents/` for different tasks:

### Planning Agent (Architecture & Design)

#### 🏗️ **architect**
Analyzes customer requirements and designs comprehensive account configurations
- **Use for**: Complex setups requiring multiple resource types, workflows with dependencies
- **Outputs**: Detailed architecture document with resource inventory, dependency graph, implementation sequence, integration points, **and tagging strategy**
- **Key expertise**: Dependency mapping, resource relationships, implementation sequencing, ID passing between resources, **consistent resource tagging**
- **When to use**: **ALWAYS** for multi-resource setups (e.g., forms + templates + journeys) or when resources reference each other
- **Collaborates with**: All builder agents - provides them with clear specifications, dependency information, **and tagging guidelines**

### Builder Agents (Code Generation)

#### ⚙️ **organization-builder**
Configures Organization settings, custom fields, roles, and foundational account configuration
- **Use for**: Custom fields, roles, tags, branding, calendar/ticket/communication settings
- **Outputs**: TypeScript code using `session.api.organizations.updateOne()`
- **Key expertise**: Custom field design, role/permission setup, organization-wide settings
- **When to use**: **ALWAYS FIRST** - Custom fields must be defined before they can be referenced in forms, journeys, or templates
- **Critical**: Custom field names are used in AutomationSteps (enduserConditions), AutomationTriggers (Field Equals events), MessageTemplates ({{enduser.CustomField}}), and Forms (mapResponseToField)

#### 📝 **form-builder**
Creates Forms and FormFields with proper ordering and validation
- **Use for**: Surveys, intake forms, questionnaires, assessments
- **Outputs**: TypeScript code using `session.api.forms` and `session.api.form_fields`
- **Key expertise**: Field types, conditional logic, form customization

#### 🔄 **automation-builder**
Creates Journeys, AutomationSteps, and AutomationTriggers for workflow automation
- **Use for**: Patient onboarding, appointment follow-ups, automated campaigns
- **Outputs**: TypeScript code using `session.api.journeys`, `session.api.automation_steps`, `session.api.automation_triggers`
- **Key expertise**: Event-driven workflows, conditional branching, scheduled actions
- **Collaborates with**: message-template-builder (for branded emails)

#### 📧 **message-template-builder**
Creates MessageTemplates with modern, mobile-optimized HTML
- **Use for**: Email templates, SMS templates, multi-channel messaging
- **Outputs**: TypeScript code using `session.api.templates`
- **Key expertise**: Responsive HTML, inline CSS, template variables, mobile optimization
- **Collaborates with**: automation-builder (provides templates for Journey steps)

#### 📅 **calendar-builder**
Creates CalendarEventTemplates, AppointmentLocations, and AppointmentBookingPages
- **Use for**: Appointment types, booking pages, location setup, scheduling configuration
- **Outputs**: TypeScript code using `session.api.calendar_event_templates`, `session.api.appointment_locations`, `session.api.appointment_booking_pages`
- **Key expertise**: Appointment templates, reminders, booking restrictions, multi-location setup, telehealth configuration

### Quality Assurance Agent

#### ✅ **script-evaluator**
Reviews and validates scripts for correctness, best practices, and common issues
- **Use for**: Reviewing any generated script before finalization
- **Outputs**: Detailed feedback with categorized issues and suggested fixes
- **Key expertise**: API usage patterns, composability, error handling, TypeScript quality
- **When to use**: **ALWAYS** run after builder agents generate code

## Agent Collaboration Patterns

### Pattern 1: Simple Single-Resource Creation
```
User Request → builder agent (form/template/calendar) → script-evaluator → Final Script
```
**Use when**: Creating a single resource type with no external dependencies
**Example**: "Create a PHQ-9 form" or "Create a welcome email template"

### Pattern 2: Multi-Resource Setup with Dependencies (RECOMMENDED)
```
User Request → architect analyzes requirements
            ↓
            architect creates architecture document (resources, dependencies, sequence, CUSTOM FIELDS)
            ↓
            builder agents execute in sequence (sharing IDs):
            Step 0: organization-builder (creates custom fields) → outputs: field names
            Step 1: form-builder (creates forms, may reference custom fields) → outputs: formIds
            Step 2: message-template-builder (uses formIds + custom field vars) → outputs: templateIds
            Step 3: automation-builder (uses templateIds + formIds + custom fields) → outputs: journeyIds
            ↓
            script-evaluator reviews complete workflow
            ↓
            Final Script (with all ID references and field names correct)
```
**Use when**: Creating multiple resources that reference each other
**Example**: "Set up patient onboarding with intake form, welcome email, and automation"
**Note**: If custom fields are needed, organization-builder MUST be step 0

### Pattern 3: Complex Campaign/Workflow
```
User Request → architect creates detailed plan with dependency graph
            ↓
            Multiple builder agents work in coordinated sequence:
            Step 0: organization-builder (custom fields, roles, tags) → field names, roles, tags
            Step 1: form-builder creates all forms → formIds
            Step 2: message-template-builder creates all templates (refs formIds) → templateIds
            Step 3: calendar-builder creates booking system (refs templateIds) → calendarIds
            Step 4: automation-builder creates journeys + triggers (refs all IDs + custom fields)
            ↓
            script-evaluator reviews each component
            ↓
            Composite script combining all components
```
**Use when**: Building complete workflows with 5+ resources and complex dependencies
**Example**: "Set up wellness program with intake, assessment, conditional emails, and follow-ups"
**Note**: Organization setup (Step 0) is critical when custom fields, roles, or tags are referenced in later steps

## Recommended Workflow

### For Simple Single-Resource Requests:

1. **Delegate directly to builder agent**
   - Use form-builder, message-template-builder, calendar-builder, or automation-builder
   - Builder generates code for single resource type

2. **Review with script-evaluator**
   - Always run script-evaluator after builder agent
   - Address any critical issues

3. **Create standalone script**
   - Wrap code in composable script structure
   - Save with descriptive filename

### For Multi-Resource Requests (RECOMMENDED WORKFLOW):

1. **Invoke architect agent first**
   - Architect analyzes requirements
   - Architect creates architecture document with:
     - **Custom fields needed** (CRITICAL - must be defined first)
     - Resource inventory
     - Dependency graph
     - Implementation sequence
     - Integration points (ID passing + field name usage)
     - Builder agent instructions

2. **Review architecture with user (if complex)**
   - Present the plan for validation
   - **Confirm custom field names** with user
   - Confirm all requirements are captured
   - Adjust if needed

3. **Execute builder agents in sequence**
   - Follow architect's implementation sequence
   - **Step 0**: If custom fields/roles/tags needed, **organization-builder FIRST**
   - Pass IDs and field names between agents as specified in integration points
   - Example sequence:
     a. **organization-builder** creates custom fields → capture field names
     b. form-builder creates forms (may reference custom fields) → capture formIds
     c. message-template-builder creates templates using formIds + custom field variables → capture templateIds
     d. automation-builder creates journey using templateIds + formIds + custom fields in conditions

4. **Review each component with script-evaluator**
   - Run evaluator after each builder agent completes
   - Fix critical issues before proceeding

5. **Combine into final script**
   - Merge all builder outputs into single script
   - Ensure all ID references are correct
   - Add error handling and logging
   - Include architecture documentation in comments

6. **Final review**
   - Run script-evaluator on complete script
   - Verify against architect's validation checklist
   - Test that all integration points work

7. **Save and provide usage instructions**
   - Save with descriptive filename
   - Provide build/run commands
   - Include architecture summary for user reference

## Script Structure

### All scripts MUST be composable and self-executable

Scripts should be designed to work both **independently** and as **composable modules** that can be imported into larger setup scripts.

**Pattern: Composable Script**

```typescript
import * as dotenv from 'dotenv';
import { Session } from '@tellescope/sdk';

// Load environment variables (only if running standalone)
if (require.main === module) {
  dotenv.config();
}

/**
 * Main configuration function that can be imported or run standalone
 * @param session - Tellescope Session (optional, will create if not provided)
 */
export async function configureMyFeature(session?: Session): Promise<void> {
  // Create session if not provided (for standalone execution)
  const sess = session ?? new Session({
    host: process.env.TELLESCOPE_HOST,
    apiKey: process.env.TELLESCOPE_API_KEY,
  });

  try {
    console.log('Configuring my feature...');

    // Script logic here

    console.log('My feature configured successfully');
  } catch (error) {
    console.error('Failed to configure my feature:', error);
    throw error;
  }
}

// Standalone execution (only runs if called directly, not imported)
if (require.main === module) {
  // Validate environment variables
  if (!process.env.TELLESCOPE_API_KEY) {
    console.error('Error: TELLESCOPE_API_KEY environment variable is required');
    process.exit(1);
  }

  // Run the script
  configureMyFeature()
    .then(() => {
      console.log('Done');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}
```

**Pattern: Composite Script (runs multiple scripts)**

```typescript
import * as dotenv from 'dotenv';
import { Session } from '@tellescope/sdk';

// Import individual configuration functions
import { configureMyFeature } from './configure-my-feature';
import { setupUsers } from './setup-users';
import { createForms } from './create-forms';

dotenv.config();

async function setupAccount(): Promise<void> {
  if (!process.env.TELLESCOPE_API_KEY) {
    console.error('Error: TELLESCOPE_API_KEY environment variable is required');
    process.exit(1);
  }

  // Create shared session for all scripts
  const session = new Session({
    host: process.env.TELLESCOPE_HOST,
    apiKey: process.env.TELLESCOPE_API_KEY,
  });

  try {
    console.log('Starting account setup...\n');

    // Run scripts in sequence, sharing the same session
    await configureMyFeature(session);
    await setupUsers(session);
    await createForms(session);

    console.log('\n✓ Account setup complete!');
  } catch (error) {
    console.error('Account setup failed:', error);
    throw error;
  }
}

// Execute
setupAccount()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
```

## File Locations

### Examples (Reference Only)
- **Example scripts**: `examples/` (reference examples for agents - do not modify)
  - `basic-script.ts` - Basic composable script template
  - `create-phq9-form.ts` - Complete PHQ-9 form creation example
- **Environment example**: `.env.example` (for documentation)

### Agents
- **Agent definitions**: `.claude/agents/` (specialized agents for planning, code generation, and quality assurance)
- **Available agents**:
  - `architect.md` - Analyzes requirements and designs account configurations with dependency mapping
  - `organization-builder.md` - **[FOUNDATION]** Expert at configuring Organization settings, custom fields, roles, and tags
  - `form-builder.md` - Expert at creating Tellescope Forms and FormFields
  - `automation-builder.md` - Expert at creating Journeys and automation workflows
  - `message-template-builder.md` - Expert at creating mobile-optimized MessageTemplates
  - `calendar-builder.md` - Expert at creating CalendarEventTemplates, AppointmentLocations, and AppointmentBookingPages
  - `script-evaluator.md` - Reviews scripts for correctness and best practices

## Workflow

### When a user requests account configuration:

1. **Understand the requirements**
   - What resources need to be created? (Forms, Users, Journeys, etc.)
   - What are the specific details?

2. **Delegate to appropriate agents**
   - Use the `Task` tool to invoke specialized agents (e.g., form-builder)
   - Agents return code snippets that you integrate

3. **Create a complete standalone script**
   - Start with the standard script structure (dotenv, Session, run function)
   - Insert agent-generated code into the `run()` function
   - Add proper error handling and logging
   - Include documentation comments

4. **Save generated scripts for user's production use**
   - Generated scripts should be saved to a user-specified location or provided for manual saving
   - Use descriptive kebab-case filenames

5. **Provide usage instructions**
   - Show how to build and run the script

## Running Scripts

Scripts can be executed in two ways:

### Build and run (recommended for production):
```bash
npm run build
node dist/scripts/script-name.js
```

### Direct execution with ts-node (for development):
```bash
npx ts-node path/to/script-name.ts
```

## Environment Variables

All scripts require these environment variables (loaded from `.env`):
- `TELLESCOPE_API_KEY` - API key for authentication (required)
- `TELLESCOPE_HOST` - API host URL (optional, defaults to https://api.tellescope.com)

## Using Agents in Practice

### Invoking the Architect Agent (For Multi-Resource Setups)

**ALWAYS** start with the architect for requests involving multiple resource types:

```typescript
// Example: Complex onboarding workflow
Task({
  subagent_type: 'general-purpose',
  description: 'Design patient onboarding architecture',
  prompt: 'Using the architect agent in .claude/agents/architect.md, analyze this customer request and create a detailed architecture document:\n\n"Set up patient onboarding: when someone submits our intake form, send a welcome email with the form link, wait 2 days and send an assessment form, then if score > 10 send high-risk email and create ticket, otherwise send normal follow-up."\n\nProvide: resource inventory, dependency graph, implementation sequence, integration points, and builder agent instructions.'
})
```

The architect will output a structured plan that you can then use to coordinate builder agents.

### Invoking Builder Agents

Use the `Task` tool to delegate code generation to specialized agents. **For multi-resource setups, pass the architect's instructions to each builder:**

```typescript
// Example: Form creation (using architect's specifications)
Task({
  subagent_type: 'general-purpose',
  description: 'Build intake and assessment forms',
  prompt: 'Using the form-builder agent in .claude/agents/form-builder.md, generate TypeScript code based on these architect specifications:\n\nForms to create:\n1. Intake Form (name, email, phone, DOB)\n2. Health Assessment Form (9 scored questions, 0-3 points each)\n\nExport variables: intakeFormId, assessmentFormId\n\nThese IDs will be used in message templates and journey actions.'
})

// Example: Templates referencing forms (using IDs from previous step)
Task({
  subagent_type: 'general-purpose',
  description: 'Build email templates with form links',
  prompt: 'Using the message-template-builder agent in .claude/agents/message-template-builder.md, generate TypeScript code based on architect specifications:\n\nTemplates to create:\n1. Welcome Email - include placeholder {{forms.{intakeFormId}.link}}\n2. Assessment Reminder - include placeholder {{forms.{assessmentFormId}.link}}\n3. High Risk Email - no form links\n4. Normal Follow-Up - no form links\n\nExport variables: welcomeTemplateId, reminderTemplateId, highRiskTemplateId, normalTemplateId\n\nNote: Form IDs will be provided from previous step.'
})

// Example: Journey using templates and forms (using IDs from previous steps)
Task({
  subagent_type: 'general-purpose',
  description: 'Build onboarding journey',
  prompt: 'Using the automation-builder agent in .claude/agents/automation-builder.md, generate TypeScript code based on architect specifications:\n\nJourney steps:\n1. Send welcome email (onJourneyStart, use welcomeTemplateId)\n2. Wait 2 days, send assessment reminder (use reminderTemplateId)\n3. Send assessment form (use assessmentFormId)\n4a. If score >= 10: send high risk email (use highRiskTemplateId) + create ticket\n4b. If score < 10: send normal email (use normalTemplateId)\n\nExport variables: onboardingJourneyId\n\nNote: Template IDs and form IDs will be provided from previous steps.'
})
```

### Invoking the Evaluator Agent

**CRITICAL**: Always run script-evaluator after builder agents generate code:

```typescript
Task({
  subagent_type: 'general-purpose',
  description: 'Review generated script',
  prompt: 'Using the script-evaluator agent in .claude/agents/script-evaluator.md, review the following script for correctness, best practices, and common issues:\n\n```typescript\n[INSERT GENERATED SCRIPT HERE]\n```\n\nProvide detailed feedback with categorized issues and suggested fixes.'
})
```

**When to review:**
- ✅ After form-builder generates form creation code
- ✅ After automation-builder generates journey code
- ✅ After message-template-builder generates template code
- ✅ After calendar-builder generates calendar configuration code
- ✅ Before combining multiple scripts into a composite script
- ✅ Before providing any script to the user

**What to do with feedback:**
1. Read the script-evaluator's categorized issues
2. Fix all **Critical Issues** (must fix)
3. Address **Warnings** (should fix)
4. Consider **Suggestions** (nice to have)
5. Re-run evaluator if significant changes were made

## Best Practices

1. **Make scripts composable** - Export a function that accepts an optional Session parameter
2. **Support standalone execution** - Use `require.main === module` to detect direct execution
3. **Share sessions when composing** - Pass the same session to multiple scripts to reuse authentication
4. **Use dotenv conditionally** - Only load .env when running standalone
5. **Validate inputs** - Check for required environment variables before running standalone
6. **Handle errors** - Wrap logic in try/catch and exit with proper codes
7. **Log progress** - Include console.log statements for key steps and final results
8. **Document clearly** - Add comments explaining what the script does and its parameters
9. **Return useful info** - Log IDs of created resources for reference

## Example Interactions

### Example 1: Simple Single-Resource Request

**User**: "Create a PHQ-9 depression screening form"

**You** (Pattern 1: Direct to builder):
1. ✅ Invoke **form-builder** agent with PHQ-9 requirements
2. ✅ Receive form creation code from agent
3. ✅ Invoke **script-evaluator** agent to review the generated code
4. ✅ Apply fixes for any critical issues identified
5. ✅ Wrap code in standalone script structure
6. ✅ Provide script to user with suggested filename `create-phq9-form.ts`
7. ✅ Respond with confirmation and usage instructions

### Example 2: Multi-Resource Request with Dependencies

**User**: "Set up patient onboarding: when someone submits our intake form, send a welcome email with next steps, then after 2 days send them a health assessment form"

**You** (Pattern 2: Architect-led):
1. ✅ Invoke **architect** agent to analyze requirements and create architecture document
   - Architect identifies: Intake Form, Assessment Form, Welcome Email Template, Reminder Email Template, Onboarding Journey, Form Submit Trigger
   - Architect maps dependencies: Forms → Templates (form links) → Journey (template refs) → Trigger
   - Architect defines sequence: Forms first, then Templates, then Journey, then Trigger

2. ✅ Present architecture summary to user for validation
   - "I've designed a system with 2 forms, 2 email templates, 1 journey, and 1 trigger. The forms will be linked in the emails, and the journey will send both emails with proper delays."

3. ✅ Execute builder agents in sequence (following architect's plan):
   - **form-builder**: Creates Intake Form and Assessment Form → outputs: intakeFormId, assessmentFormId
   - **message-template-builder**: Creates Welcome and Reminder templates (using form IDs) → outputs: welcomeTemplateId, reminderTemplateId
   - **automation-builder**: Creates Journey (using template IDs and form IDs) and Trigger → outputs: journeyId, triggerId

4. ✅ Invoke **script-evaluator** to review complete integrated script
5. ✅ Apply fixes based on evaluator feedback
6. ✅ Wrap in standalone script structure with all components integrated
7. ✅ Provide script with filename `setup-patient-onboarding.ts`
8. ✅ Include architecture summary in script comments for future reference

### Example 3: Complex Multi-Resource Request

**User**: "Set up appointment booking for my practice - I need Initial Consultation and Follow-Up appointment types, send reminder emails 24 hours before appointments, and I offer both in-person and telehealth"

**You** (Pattern 2: Architect-led):
1. ✅ Invoke **architect** agent to analyze requirements
   - Architect identifies: 2 Locations, 1 Reminder Template, 2 Calendar Templates, 1 Booking Page
   - Architect maps dependencies: Locations + Reminder Template → Calendar Templates → Booking Page
   - Architect defines integration points: Reminder template ID goes into calendar template reminders array, location IDs and template IDs go into booking page

2. ✅ Execute builder agents in sequence:
   - **calendar-builder**: Creates Office and Telehealth locations → outputs: officeId, telehealthId
   - **message-template-builder**: Creates Reminder Email (with calendar variables) → outputs: reminderTemplateId
   - **calendar-builder**: Creates Consultation and Follow-Up templates (using reminderTemplateId in reminders) → outputs: consultTemplateId, followUpTemplateId
   - **calendar-builder**: Creates Booking Page (using location IDs and template IDs) → outputs: bookingPageId

3. ✅ Invoke **script-evaluator** to review calendar configuration
4. ✅ Apply fixes
5. ✅ Wrap in standalone script structure
6. ✅ Provide script `setup-appointment-booking.ts` with booking page URL
7. ✅ Include validation checklist from architect

### Example 4: Workflow with Custom Fields (Organization-First Pattern)

**User**: "Set up a wellness program where we tag high-risk patients based on their assessment score. If score > 15, send them a special care plan email and assign to our high-risk care team."

**You** (Pattern 2 with organization-builder):
1. ✅ Invoke **architect** agent to analyze requirements
   - Architect identifies CUSTOM FIELDS NEEDED: "Wellness Score" (Number), "Risk Level" (Select)
   - Architect identifies: Assessment Form, Care Plan Template, Wellness Journey, Score-Based Trigger
   - Architect maps dependencies: **Custom Fields** → Form (maps to fields) → Template (uses field vars) → Journey (conditional on field values)
   - Architect notes: Journey conditional logic requires "Risk Level" field, Template uses "Wellness Score" variable

2. ✅ Present architecture to user
   - "I'll create 2 custom fields: 'Wellness Score' (number) and 'Risk Level' (High/Medium/Low). These will be used in your forms, emails, and automation logic."
   - User confirms field names

3. ✅ **Execute organization-builder FIRST** (Step 0)
   - **organization-builder**: Creates custom fields "Wellness Score", "Risk Level", and tag "High Risk" → outputs: field names
   - Console output: "Custom fields configured: Wellness Score (Number), Risk Level (Select)"

4. ✅ Execute remaining builder agents in sequence:
   - **form-builder**: Creates Assessment Form with fields that map to "Wellness Score" and "Risk Level" custom fields → outputs: assessmentFormId
   - **message-template-builder**: Creates Care Plan Email using `{{enduser.Wellness Score}}` variable → outputs: carePlanTemplateId
   - **automation-builder**: Creates Journey with enduserConditions filtering by "Risk Level" = "High", adds "High Risk" tag, sends carePlanTemplate → outputs: journeyId
   - **automation-builder**: Creates Trigger on "Risk Level" field change → outputs: triggerId

5. ✅ Invoke **script-evaluator** to review complete workflow
6. ✅ Verify custom field usage: "Risk Level" in conditions, "Wellness Score" in template, "High Risk" tag in action
7. ✅ Wrap in standalone script structure
8. ✅ Provide script `setup-wellness-program.ts`
9. ✅ Note to user: "Custom fields 'Wellness Score' and 'Risk Level' are now available throughout your organization for forms, filters, and automation."

## Script Composition Example

When a user needs multiple independent features set up, create individual composable scripts plus a main setup script:

**Individual Scripts:**
- `create-phq9-form.ts` - Exports `createPHQ9Form(session?: Session)`
- `setup-users.ts` - Exports `setupUsers(session?: Session)`
- `configure-workflows.ts` - Exports `configureWorkflows(session?: Session)`

**Main Setup Script:**
- `setup-account.ts` - Imports and runs all individual scripts

This allows users to:
- Run individual scripts: `npx ts-node create-phq9-form.ts`
- Run everything at once: `npx ts-node setup-account.ts`

## Key Reminders

### Planning & Architecture
- **DO**: Use **architect** agent for ANY multi-resource setup (forms + templates, journeys + forms, calendar + templates, etc.)
- **DO**: Have architect identify custom fields, roles, and tags needed FIRST in architecture doc
- **DO**: Let architect define implementation sequence and ID/field name passing between resources
- **DO**: Present architecture summary to user for complex requests before coding
- **DO**: Confirm custom field names with user before proceeding
- **DO**: Follow architect's integration points exactly when builder agents reference IDs and field names

### Organization Foundation
- **DO**: Use **organization-builder** as **Step 0** whenever custom fields, roles, or tags are needed
- **DO**: Define custom fields BEFORE creating forms, journeys, or templates that reference them
- **DO**: Use descriptive custom field names (Title Case: "Insurance Provider" not "insurance_provider")
- **DO**: Document which resources will use which custom field names
- **DO**: Create organization tags that will be used in automation logic

### Code Generation & Quality
- **DO**: Use specialized builder agents for code generation (organization-builder, form-builder, automation-builder, message-template-builder, calendar-builder)
- **DO**: Pass architect's specifications to builder agents so they know what IDs and field names to export/reference
- **DO**: **ALWAYS** run script-evaluator after builder agents generate code
- **DO**: Fix critical issues identified by script-evaluator before saving
- **DO**: Verify against architect's validation checklist after script completion

### Script Structure
- **DO**: Export a main function that accepts optional Session parameter
- **DO**: Support both standalone and composed execution with `require.main === module`
- **DO**: Create composite scripts when multiple features are requested together
- **DO**: Refer to `examples/` for script structure templates and patterns
- **DO**: Include architect's summary in script comments for future reference

### Automation Best Practices
- **DO**: Use `'Form Started'` trigger for abandoned cart/form workflows
- **DO**: For abandoned cart/form workflows: Use separate AutomationTriggers to start (`'Form Started'` → Add to Journey) and stop (`'Form Submitted'` → Remove from Journey) the workflow
- **DO**: Fetch real users for sender IDs (query users with fname/lname/username set)
- **DO**: Use SDK filter operators (`_exists`, `_in`, `_gt`) not MongoDB operators (`$exists`, `$in`, `$gt`)
- **DON'T**: Use `'Form Unsubmitted'` event (deprecated - use `'Form Started'` instead)
- **DON'T**: Use `cancelConditions` on afterAction events (deprecated - use triggers with Remove from Journey instead)
- **DON'T**: Include `journeyId` at root level for global triggers (Add To Journey, Remove From Journey)
- **DON'T**: Rely on `session.userInfo.id` for senderId in email/form actions

### SDK Quick Reference

**Filter Operators** (use `_` prefix, not `$`):
- Existence: `_exists` (not `$exists`)
- Comparison: `_gt`, `_gte`, `_lt`, `_lte`, `_eq`, `_ne`
- Arrays: `_in`, `_nin`
- Example: `filter: { fname: { _exists: true }, age: { _gt: 18 } }`

**Form Field Start Question**:
- Use: `previousFields: [{ type: 'root', info: {} }]`
- NOT: `previousFields: []`

**Field Types**:
- Long text: `'stringLong'` (not `'Long Text'`)
- Short text: `'string'`
- Email: `'email'`
- Phone: `'phone'`
- Number: `'number'`

**AutomationTrigger journeyId**:
- Global triggers (Add To Journey, Remove From Journey): NO `journeyId` at root
- waitForTrigger triggers: YES `journeyId` at root

**Sender IDs**:
- Fetch real user: `const users = await session.api.users.getSome({ filter: { fname: { _exists: true }, lname: { _exists: true }, username: { _exists: true } }, limit: 1 })`
- Use user ID: `senderId: users[0].id`

**Resource Tags**:
- ✅ Use: workflow identifier + purpose + timing (e.g., `['abandoned-cart', 'reminder', 'first', '24h']`)
- ❌ Avoid: redundant type tags (no `'template'`, `'form'`, `'trigger'`, `'journey'`)

### Common Pitfalls
- **DON'T**: Skip architect for multi-resource setups - IDs and field names will be wrong
- **DON'T**: Create forms/journeys/templates before defining custom fields they reference
- **DON'T**: Use inconsistent custom field names (check exact spelling/casing)
- **DON'T**: Skip the script-evaluator review step
- **DON'T**: Create scripts that can't run independently
- **DON'T**: Initialize sessions in exported functions (accept as parameter instead)
- **DON'T**: Forget environment variable validation in standalone execution block
- **DON'T**: Ignore critical issues from script-evaluator
- **DON'T**: Hardcode IDs or field names - use variables passed between builder agents
