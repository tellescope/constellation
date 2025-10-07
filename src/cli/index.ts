#!/usr/bin/env node

import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

import { ScriptRegistry } from '../scripts';
import { TellescopeClientFactory } from '../core/client';
import { EnvironmentConfig, ScriptContext } from '../core/types';

// Import example scripts to register them
import '../scripts/examples/setup-users';
import '../scripts/examples/configure-workflows';

interface CliArgs {
  scriptName?: string;
  environment?: 'development' | 'staging' | 'production';
  dryRun?: boolean;
  help?: boolean;
  list?: boolean;
}

function parseArgs(): CliArgs {
  const args: CliArgs = {};
  const cliArgs = process.argv.slice(2);

  for (let i = 0; i < cliArgs.length; i++) {
    const arg = cliArgs[i];

    switch (arg) {
      case '--help':
      case '-h':
        args.help = true;
        break;
      case '--list':
      case '-l':
        args.list = true;
        break;
      case '--dry-run':
      case '-d':
        args.dryRun = true;
        break;
      case '--env':
      case '-e':
        args.environment = cliArgs[++i] as 'development' | 'staging' | 'production';
        break;
      default:
        if (!arg.startsWith('-')) {
          args.scriptName = arg;
        }
    }
  }

  return args;
}

function printHelp(): void {
  console.log(`
Constellation - Tellescope Configuration Scripts

Usage: npm run script -- <script-name> [options]

Options:
  -e, --env <environment>   Environment: development, staging, production (default: development)
  -d, --dry-run            Run in dry-run mode (no changes made)
  -l, --list               List all available scripts
  -h, --help               Show this help message

Examples:
  npm run script -- setup-users --env production
  npm run script -- configure-workflows --dry-run
  npm run script -- --list
`);
}

function listScripts(): void {
  const scripts = ScriptRegistry.list();

  console.log('\nAvailable scripts:\n');
  scripts.forEach(script => {
    console.log(`  ${script.name.padEnd(25)} ${script.description}`);
  });
  console.log();
}

async function main(): Promise<void> {
  const args = parseArgs();

  if (args.help) {
    printHelp();
    process.exit(0);
  }

  if (args.list) {
    listScripts();
    process.exit(0);
  }

  if (!args.scriptName) {
    console.error('Error: Script name is required\n');
    printHelp();
    process.exit(1);
  }

  const script = ScriptRegistry.get(args.scriptName);
  if (!script) {
    console.error(`Error: Script "${args.scriptName}" not found\n`);
    listScripts();
    process.exit(1);
  }

  // Get environment configuration
  const environment = args.environment || 'development';
  const apiKey = process.env.TELLESCOPE_API_KEY;

  if (!apiKey) {
    console.error('Error: TELLESCOPE_API_KEY environment variable is required');
    process.exit(1);
  }

  const envConfig: EnvironmentConfig = {
    apiKey,
    environment,
    host: process.env.TELLESCOPE_HOST,
  };

  // Create script context
  const context: ScriptContext = {
    client: TellescopeClientFactory.getClient(envConfig),
    config: {
      name: script.name,
      description: script.description,
      environment,
    },
    dryRun: args.dryRun,
  };

  // Run the script
  const result = await script.run(context);

  if (!result.success) {
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
