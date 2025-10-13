# Constellation

Two powerful ways to configure and interact with your Tellescope account using Claude Code:

1. **Direct Interaction via MCP** (recommended for most tasks) - Talk to Claude to explore and modify your Tellescope configuration in real-time
2. **Script Generation** - Generate TypeScript scripts for repeatable, version-controlled configuration

## Quick Start: Direct Interaction with Claude Code (MCP)

The fastest way to work with your Tellescope account is to use Claude Code's MCP (Model Context Protocol) integration. This lets you have a conversation with Claude to explore and modify your configuration directly.

### Setup

1. **Install dependencies**: Run `npm install` to set up the MCP server (required before first use)
2. **Configure your Tellescope API key** in the MCP settings (see MCP configuration below)
3. **Optional: Add permissions** to `.claude/settings.json` to avoid approval prompts for read operations (see [docs/mcp_interaction.md](docs/mcp_interaction.md))
4. **Start chatting with Claude** - just ask questions or request changes!

### Example Conversations

```
You: "What forms do I have?"
Claude: Shows you all forms in your account

You: "Add a phone number field to my intake form"
Claude: Finds your form, adds the field, confirms success

You: "Show me how my onboarding journey works"
Claude: Maps out the complete workflow with all steps and templates
```

### What You Can Do

- ✅ **Explore**: "What journeys do I have?", "Show me my forms", "List all email templates"
- ✅ **Create**: "Create a welcome email template", "Add a new form field"
- ✅ **Update**: "Change the subject line", "Add a reminder to this appointment type"
- ✅ **Understand**: "Explain how this workflow works", "What happens when someone submits this form?"

**Learn more**: See [docs/mcp_interaction.md](docs/mcp_interaction.md) for complete documentation.

---

## Alternative: Generate TypeScript Scripts

If you need repeatable, version-controlled configuration or want to share setup code with others, you can ask Claude to generate TypeScript SDK scripts instead.

### Features

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

## MCP Configuration

To use Claude Code with direct Tellescope interaction, you need to install dependencies and configure the MCP server.

### Prerequisites

**Important**: Run this command first to install dependencies and build the MCP server:

```bash
npm install
```

This installs required dependencies and automatically builds the MCP server (via the `prepare` script). The MCP server cannot function without this step.

### VSCode Claude Code Extension

Add this to your MCP configuration file (usually `~/Library/Application Support/Claude/claude_desktop_config.json` on Mac):

```json
{
  "mcpServers": {
    "tellescope": {
      "command": "npx",
      "args": [
        "-y",
        "@tellescope/mcp-server"
      ],
      "env": {
        "TELLESCOPE_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

Replace `your_api_key_here` with your actual Tellescope API key.

### Optional: Configure Permissions

To avoid approval prompts for read operations, create or edit `.claude/settings.json`:

```json
{
  "permissions": {
    "allow": [
      "mcp__tellescope__organizations_get_page",
      "mcp__tellescope__forms_get_page",
      "mcp__tellescope__journeys_get_page"
    ]
  }
}
```

See [docs/mcp_interaction.md](docs/mcp_interaction.md) for the complete recommended permissions list.

---

## Script Generation Setup

If you want to generate and run TypeScript SDK scripts, follow this setup:

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

This repository includes specialized Claude Code agents in `.claude/agents/` for working with Tellescope:

### MCP Interaction Agents (Direct Configuration)

Use these agents when working directly with your Tellescope account via MCP:

- **mcp-architect**: Plans account configurations and understands resource dependencies
- **mcp-form-builder**: Creates Forms and FormFields via MCP with proper ordering
- **mcp-automation-builder**: Creates Journeys, AutomationSteps, and AutomationTriggers via MCP
- **mcp-message-template-builder**: Creates MessageTemplates via MCP with mobile-optimized HTML
- **mcp-calendar-builder**: Creates CalendarEventTemplates, AppointmentLocations, and AppointmentBookingPages via MCP
- **mcp-organization-builder**: Configures Organization settings, custom fields, roles, and tags via MCP

### Script Generation Agents (TypeScript SDK)

Use these agents when you need to generate repeatable TypeScript SDK scripts:

- **script-architect**: Plans script-based account configurations
- **script-form-builder**: Generates Form and FormField creation code
- **script-automation-builder**: Generates Journey and AutomationStep creation code
- **script-message-template-builder**: Generates MessageTemplate creation code with HTML
- **script-calendar-builder**: Generates calendar resource creation code
- **script-organization-builder**: Generates Organization configuration code
- **script-evaluator**: Reviews and validates generated scripts for correctness

See [CLAUDE.md](CLAUDE.md) for detailed instructions on using these agents.

## License

ISC
