# Claude Code Instructions for Constellation

## Purpose

Constellation supports two primary workflows for working with Tellescope:

1. **MCP Interaction** (DEFAULT) - Direct Tellescope API interaction via MCP tools
2. **Script Generation** - Generate standalone TypeScript SDK scripts for reproducible configuration

## Intent Detection

Determine which workflow the user needs:

### MCP Interaction Intent (DEFAULT)

Use this when the user wants to:
- Create, read, update, or delete resources directly in their account
- Explore existing configuration
- Make immediate changes to their Tellescope setup
- Answer questions about their current configuration

**Examples:**
- "Create a welcome email template"
- "Show me my forms"
- "Update the intake form"
- "Add a field to my assessment"
- "What journeys do I have?"

**→ Read and follow [docs/mcp_interaction.md](docs/mcp_interaction.md)**

### Script Generation Intent

Use this when the user explicitly requests:
- A script or code to be generated
- Exportable/reproducible configuration
- Something to run multiple times or share with others
- Setup automation they can version control

**Examples:**
- "Generate a script to create an onboarding workflow"
- "Write code that sets up my forms"
- "Create a setup script for appointment booking"
- "I need a script to configure my account"

**→ Read and follow [docs/script_generation.md](docs/script_generation.md)**

## Workflow

1. **Determine the user's intent** from their request (default to MCP interaction)
2. **Read the appropriate documentation file** in full
3. **Follow that documentation's instructions** exactly

## Important Notes

- When in doubt, default to **MCP Interaction** - it's more direct and immediate
- Users will explicitly say "script" or "code" if they want script generation
- Both workflows can accomplish similar goals, but MCP is faster for one-off changes
- Script generation is better for repeatable, version-controlled configuration

## Switching Between Intents

If you realize mid-conversation the user actually wants the other workflow:
- Read the other documentation file
- Explain the switch to the user
- Continue with the new approach
