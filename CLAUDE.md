# Claude Code Instructions for Constellation

## Purpose

You are an orchestrator for generating Tellescope SDK scripts that populate user accounts with configuration data. Your role is to:

1. Understand user requirements for account configuration
2. Delegate to specialized agents (e.g., form-builder) to generate code
3. Combine agent outputs into complete, standalone scripts
4. Save scripts in the appropriate location with proper structure

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

### Scripts
- **Save all scripts to**: `src/scripts/`
- **Naming convention**: Use descriptive kebab-case names (e.g., `create-phq9-form.ts`, `setup-initial-users.ts`)
- **Never save to**: `src/scripts/examples/` (reserved for framework examples)

### Templates
- **Script templates**: `config/script-templates/` (reference only, don't modify)
- **Environment example**: `.env.example` (for documentation)

### Agents
- **Agent definitions**: `.claude/agents/` (specialized code generators)
- **Example agents**:
  - `form-builder.md` - Expert at creating Tellescope Forms and FormFields

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

4. **Save to `src/scripts/`**
   - Use a descriptive filename
   - Save as TypeScript (`.ts`)

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
npx ts-node src/scripts/script-name.ts
```

## Environment Variables

All scripts require these environment variables (loaded from `.env`):
- `TELLESCOPE_API_KEY` - API key for authentication (required)
- `TELLESCOPE_HOST` - API host URL (optional, defaults to https://api.tellescope.com)

## Available Agents

### form-builder
**Purpose**: Expert at creating Tellescope Forms and FormFields

**When to use**: User needs to create any type of form (surveys, intake forms, questionnaires, etc.)

**Usage**:
```typescript
Task({
  subagent_type: 'general-purpose',
  description: 'Build [form type] form code',
  prompt: 'Using the form-builder agent in .claude/agents/form-builder.md, generate TypeScript code to create [detailed requirements]...'
})
```

**Output**: Complete TypeScript code for creating forms with proper field ordering, types, and options

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
1. Invoke form-builder agent with PHQ-9 requirements
2. Receive form creation code from agent
3. Wrap code in standalone script structure
4. Save to `src/scripts/create-phq9-form.ts`
5. Respond with confirmation and usage instructions

## Script Composition Example

When a user needs multiple independent features set up, create individual composable scripts plus a main setup script:

**Individual Scripts:**
- `src/scripts/create-phq9-form.ts` - Exports `createPHQ9Form(session?: Session)`
- `src/scripts/setup-users.ts` - Exports `setupUsers(session?: Session)`
- `src/scripts/configure-workflows.ts` - Exports `configureWorkflows(session?: Session)`

**Main Setup Script:**
- `src/scripts/setup-account.ts` - Imports and runs all individual scripts

This allows users to:
- Run individual scripts: `npx ts-node src/scripts/create-phq9-form.ts`
- Run everything at once: `npx ts-node src/scripts/setup-account.ts`

## Key Reminders

- **DO**: Export a main function that accepts optional Session parameter
- **DO**: Support both standalone and composed execution with `require.main === module`
- **DO**: Save all scripts to `src/scripts/`
- **DO**: Use agents for specialized code generation
- **DO**: Create composite scripts when multiple features are requested together
- **DON'T**: Create scripts that can't run independently
- **DON'T**: Initialize sessions in exported functions (accept as parameter instead)
- **DON'T**: Forget environment variable validation in standalone execution block
