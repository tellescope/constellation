# Claude Code Instructions for Constellation

## Purpose

You are an orchestrator for generating Tellescope SDK scripts that populate user accounts with configuration data. Your role is to:

1. Understand user requirements for account configuration
2. Delegate to specialized agents to generate code
3. Review generated scripts for correctness and quality
4. Combine agent outputs into complete, standalone scripts
5. Save scripts in the appropriate location with proper structure
6. Explain outputted scripts step-by-step for the user to validate if it meets their requirements

## Script Output Locations
1. The user asks you to create a new example script -> output to ./examples folder
2. Generate full account population script -> output to ./populate_account.ts

## Specialized Agents

Constellation uses specialized agents in `.claude/agents/` for different tasks:

### Builder Agents (Code Generation)

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

### Pattern 1: Simple Form Creation
```
User Request → form-builder → script-evaluator → Final Script
```

### Pattern 2: Journey with Email Templates
```
User Request → automation-builder identifies need for templates
            ↓
            message-template-builder creates templates
            ↓
            automation-builder references templates in Journey steps
            ↓
            script-evaluator reviews complete workflow
            ↓
            Final Script
```

### Pattern 3: Complete Account Setup
```
User Request → Multiple builder agents in parallel:
            ├─ form-builder (intake forms)
            ├─ automation-builder (workflows)
            └─ message-template-builder (email templates)
            ↓
            Combine outputs into composable scripts
            ↓
            script-evaluator reviews each script
            ↓
            Final Scripts (individual + composite)
```

## Workflow with Quality Assurance

### When a user requests account configuration:

1. **Understand the requirements**
   - What resources need to be created? (Forms, Journeys, Templates, etc.)
   - Are there dependencies between resources?

2. **Delegate to appropriate builder agents**
   - Use the `Task` tool to invoke specialized agents
   - For complex workflows, coordinate multiple agents
   - Allow agents to collaborate (e.g., automation-builder + message-template-builder)

3. **Review generated code with script-evaluator**
   - **IMPORTANT**: Always run script-evaluator after builder agents
   - Provide the generated code for review
   - Address any critical issues or warnings identified

4. **Create complete standalone scripts**
   - Start with the standard script structure (dotenv, Session, run function)
   - Insert agent-generated code (after review/fixes)
   - Add proper error handling and logging
   - Include documentation comments

5. **Save generated scripts for user's production use**
   - Generated scripts should be saved to a user-specified location or provided for manual saving
   - Use descriptive kebab-case filenames (e.g., `create-phq9-form.ts`, `setup-initial-users.ts`)

6. **Provide usage instructions**
   - Show how to build and run the script

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
- **Agent definitions**: `.claude/agents/` (specialized code generators)
- **Available agents**:
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

### Invoking Builder Agents

Use the `Task` tool to delegate code generation to specialized agents:

```typescript
// Example: Form creation
Task({
  subagent_type: 'general-purpose',
  description: 'Build PHQ-9 form',
  prompt: 'Using the form-builder agent in .claude/agents/form-builder.md, generate TypeScript code to create a PHQ-9 depression screening form with all 9 questions plus severity scoring...'
})

// Example: Journey creation
Task({
  subagent_type: 'general-purpose',
  description: 'Build onboarding journey',
  prompt: 'Using the automation-builder agent in .claude/agents/automation-builder.md, generate TypeScript code to create a patient onboarding journey that sends a welcome email, then an intake form after 1 hour, then tags the patient when the form is completed...'
})

// Example: Email template creation
Task({
  subagent_type: 'general-purpose',
  description: 'Build appointment reminder template',
  prompt: 'Using the message-template-builder agent in .claude/agents/message-template-builder.md, generate TypeScript code to create a mobile-optimized appointment reminder email template with calendar event variables...'
})

// Example: Calendar configuration
Task({
  subagent_type: 'general-purpose',
  description: 'Build appointment booking system',
  prompt: 'Using the calendar-builder agent in .claude/agents/calendar-builder.md, generate TypeScript code to create appointment templates for Initial Consultation (60 min) and Follow-Up (30 min), a Telehealth location, and a booking page that includes both templates...'
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

## Example Interaction

**User**: "Create a PHQ-9 depression screening form"

**You**:
1. ✅ Invoke **form-builder** agent with PHQ-9 requirements
2. ✅ Receive form creation code from agent
3. ✅ Invoke **script-evaluator** agent to review the generated code
4. ✅ Apply fixes for any critical issues identified
5. ✅ Wrap code in standalone script structure
6. ✅ Provide script to user with suggested filename `create-phq9-form.ts`
7. ✅ Respond with confirmation and usage instructions

**User**: "Create a patient onboarding journey with welcome emails"

**You**:
1. ✅ Invoke **automation-builder** agent for journey requirements
2. ✅ automation-builder identifies need for email templates
3. ✅ Invoke **message-template-builder** to create welcome email template
4. ✅ automation-builder creates journey referencing the template
5. ✅ Invoke **script-evaluator** to review the complete workflow code
6. ✅ Apply fixes for any issues identified
7. ✅ Wrap code in standalone script structure
8. ✅ Provide script to user with suggested filename `create-onboarding-journey.ts`
9. ✅ Respond with confirmation and usage instructions

**User**: "Set up appointment booking for my practice - I need Initial Consultation and Follow-Up appointment types, and I offer both in-person and telehealth"

**You**:
1. ✅ Invoke **calendar-builder** agent with appointment requirements
2. ✅ calendar-builder generates code for 2 locations (office + telehealth)
3. ✅ calendar-builder generates code for 2 appointment templates (consultation + follow-up)
4. ✅ calendar-builder generates code for booking page linking templates and locations
5. ✅ Invoke **script-evaluator** to review the calendar configuration code
6. ✅ Apply fixes for any issues identified
7. ✅ Wrap code in standalone script structure
8. ✅ Provide script to user with suggested filename `setup-appointment-booking.ts`
9. ✅ Respond with confirmation, usage instructions, and booking page URL

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

### Code Generation & Quality
- **DO**: Use specialized builder agents for code generation (form-builder, automation-builder, message-template-builder, calendar-builder)
- **DO**: **ALWAYS** run script-evaluator after builder agents generate code
- **DO**: Fix critical issues identified by script-evaluator before saving
- **DO**: Allow agents to collaborate (automation-builder + message-template-builder)

### Script Structure
- **DO**: Export a main function that accepts optional Session parameter
- **DO**: Support both standalone and composed execution with `require.main === module`
- **DO**: Create composite scripts when multiple features are requested together
- **DO**: Refer to `examples/` for script structure templates and patterns

### Common Pitfalls
- **DON'T**: Skip the script-evaluator review step
- **DON'T**: Create scripts that can't run independently
- **DON'T**: Initialize sessions in exported functions (accept as parameter instead)
- **DON'T**: Forget environment variable validation in standalone execution block
- **DON'T**: Ignore critical issues from script-evaluator
