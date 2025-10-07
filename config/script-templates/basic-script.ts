import * as dotenv from 'dotenv';
import { Session } from '@tellescope/sdk';

// Load environment variables from .env file
dotenv.config();

/**
 * Basic Script Template
 *
 * This template shows how to initialize a Session and run a basic script.
 * Environment variables required:
 * - TELLESCOPE_HOST: The API host (e.g., https://api.tellescope.com)
 * - TELLESCOPE_API_KEY: Your API key for authentication
 */

// Validate required environment variables
if (!process.env.TELLESCOPE_API_KEY) {
  console.error('Error: TELLESCOPE_API_KEY environment variable is required');
  process.exit(1);
}

// Initialize Session with environment variables
const session = new Session({
  host: process.env.TELLESCOPE_HOST,
  apiKey: process.env.TELLESCOPE_API_KEY,
});

/**
 * Main script function
 * Add your script logic here
 */
async function run(): Promise<void> {
  try {
    console.log('Script starting...');

    // Test connection
    const result = await session.test_authenticated();
    console.log('Authentication test:', result);

    // Add your script logic here
    // Example: const users = await session.api.users.getSome({ limit: 10 });

    console.log('Script completed successfully');
  } catch (error) {
    console.error('Script failed:', error);
    throw error;
  }
}

// Execute the script
run()
  .then(() => {
    console.log('Done');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
