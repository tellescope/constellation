# Constellation

Account configuration scripts for Tellescope using the [@tellescope/sdk](https://www.npmjs.com/package/@tellescope/sdk) package, powered by Claude Code and TypeScript.

## Features

- 🚀 TypeScript-first configuration scripts with full type safety
- 🤖 Claude Code agent integration for script generation
- 📦 Composable, standalone scripts that can be imported or run independently
- 🧪 Testing framework with Jest

## Project Structure

```
constellation/
├── .claude/agents/          # Claude Code agents
├── examples/               # Example scripts and templates (reference only)
├── config/                 # Environment configurations
└── tests/                  # Test files
```

## Getting Started

### Installation

```bash
npm install
```

### Configuration

Create a `.env` file in the root directory (or set environment variables):

```bash
cp .env.example .env
```

Edit `.env` with your Tellescope credentials:

```env
TELLESCOPE_API_KEY=your_api_key_here
TELLESCOPE_HOST=https://api.tellescope.com
```

Alternatively, export environment variables:

```bash
export TELLESCOPE_API_KEY=your_api_key_here
export TELLESCOPE_HOST=https://api.tellescope.com
```

### Build

```bash
npm run build
```

## Usage

### Running Scripts

Scripts can be executed in two ways:

#### Build and run (recommended for production):
```bash
npm run build
node dist/scripts/script-name.js
```

#### Direct execution with ts-node (for development):
```bash
npx ts-node path/to/script-name.ts
```

## Creating New Scripts

Scripts in Constellation follow a composable pattern that allows them to work both independently and as importable modules.

### Composable Script Pattern

See `examples/` for reference templates. Scripts should export a main function accepting an optional Session parameter:

```typescript
import * as dotenv from 'dotenv';
import { Session } from '@tellescope/sdk';

// Load environment variables (only if running standalone)
if (require.main === module) {
  dotenv.config();
}

/**
 * Main configuration function that can be imported or run standalone
 */
export async function configureMyFeature(session?: Session): Promise<void> {
  // Create session if not provided (for standalone execution)
  const sess = session ?? new Session({
    host: process.env.TELLESCOPE_HOST,
    apiKey: process.env.TELLESCOPE_API_KEY,
  });

  try {
    console.log('Configuring my feature...');

    // Your implementation here

    console.log('My feature configured successfully');
  } catch (error) {
    console.error('Failed to configure my feature:', error);
    throw error;
  }
}

// Standalone execution (only runs if called directly, not imported)
if (require.main === module) {
  if (!process.env.TELLESCOPE_API_KEY) {
    console.error('Error: TELLESCOPE_API_KEY environment variable is required');
    process.exit(1);
  }

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

This pattern enables:
- **Standalone execution**: `npx ts-node my-script.ts`
- **Composable imports**: Other scripts can import and run your script with a shared session

**Reference Examples:**
- `examples/basic-script.ts` - Basic composable script template
- `examples/create-phq9-form.ts` - Complete PHQ-9 form creation example

## Development

### Linting

```bash
npm run lint       # Check for issues
npm run lint:fix   # Auto-fix issues
```

### Testing

```bash
npm test              # Run tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

### Watch Mode

```bash
npm run build:watch
```

## Claude Code Agents

This repository includes specialized Claude Code agents in `.claude/agents/` for generating Tellescope SDK scripts:

- **form-builder**: Creates Forms and FormFields with proper ordering and validation
- **automation-builder**: Creates Journeys, AutomationSteps, and AutomationTriggers
- **message-template-builder**: Creates MessageTemplates with modern, mobile-optimized HTML
- **script-evaluator**: Reviews and validates scripts for correctness and best practices

See [CLAUDE.md](CLAUDE.md) for detailed instructions on using these agents.

## License

ISC
