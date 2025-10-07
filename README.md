# Constellation

Account configuration scripts for Tellescope using the [@tellescope/sdk](https://www.npmjs.com/package/@tellescope/sdk) package, powered by Claude Code and TypeScript.

## Features

- 🚀 TypeScript-first configuration scripts with full type safety
- 🤖 Claude Code agent integration for script generation and execution
- 🔧 CLI interface for easy script management
- ✅ Validation, execution, and rollback lifecycle hooks
- 🧪 Testing framework with Jest
- 📦 Extensible script registry system

## Project Structure

```
constellation/
├── .claude/agents/          # Claude Code agents
├── src/
│   ├── core/               # SDK client and shared types
│   ├── scripts/            # Configuration scripts
│   │   └── examples/       # Example scripts
│   ├── utils/              # Utilities (logger, validation, error handling)
│   └── cli/                # Command-line interface
├── config/                 # Environment configurations and templates
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

### List Available Scripts

```bash
npm run script -- --list
```

### Run a Script

```bash
npm run script -- <script-name> [options]
```

#### Options

- `-e, --env <environment>` - Environment: development, staging, production (default: development)
- `-d, --dry-run` - Run in dry-run mode (no changes made)
- `-l, --list` - List all available scripts
- `-h, --help` - Show help message

#### Examples

```bash
# Run setup-users script in production
npm run script -- setup-users --env production

# Run configure-workflows in dry-run mode
npm run script -- configure-workflows --dry-run

# List all available scripts
npm run script -- --list
```

## Creating New Scripts

### Using the Basic Script Template

For standalone scripts that don't need to integrate with the CLI, use the basic script template:

```bash
cp config/script-templates/basic-script.ts my-script.ts
```

The template includes:
- Session initialization with environment variables
- Environment variable validation
- Error handling with async/await
- Clean exit codes

Run the script directly:
```bash
npm run build && node dist/my-script.js
```

### Creating CLI-Integrated Scripts

1. Create a new file in `src/scripts/` or `src/scripts/examples/`
2. Extend the `BaseScript` class:

```typescript
import { BaseScript } from '../base-script';
import { ScriptContext, ScriptResult } from '../../core/types';
import { ScriptRegistry } from '../index';

class MyCustomScript extends BaseScript {
  name = 'my-custom-script';
  description = 'Description of what this script does';

  async validate(context: ScriptContext): Promise<void> {
    // Validation logic
  }

  async execute(context: ScriptContext): Promise<ScriptResult> {
    const { client, dryRun } = context;

    // Your implementation here

    return {
      success: true,
      message: 'Script completed successfully',
    };
  }

  async rollback(context: ScriptContext): Promise<void> {
    // Optional rollback logic
  }
}

// Register the script
ScriptRegistry.register(new MyCustomScript());
```

3. Import the script in `src/cli/index.ts` to register it
4. Build and run: `npm run build && npm run script -- my-custom-script`

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

This repository includes Claude Code agents in `.claude/agents/` for:

- **script-generator**: Generate new configuration scripts from natural language descriptions
- **script-runner**: Execute and manage script execution

## License

ISC
