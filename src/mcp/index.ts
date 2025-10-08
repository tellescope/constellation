#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { Session } from "@tellescope/sdk";
import * as dotenv from "dotenv";
import { z } from "zod";
import express from "express";

// Load environment variables
dotenv.config();

// Validate required environment variables
if (!process.env.TELLESCOPE_API_KEY) {
  console.error("Error: TELLESCOPE_API_KEY environment variable is required");
  process.exit(1);
}

// Initialize Tellescope SDK session
const session = new Session({
  host: process.env.TELLESCOPE_HOST || "https://api.tellescope.com",
  apiKey: process.env.TELLESCOPE_API_KEY,
});

// Define shared input schemas
const getSomeSchema = z.object({
  filter: z.record(z.any()).optional().describe("Filter criteria"),
  limit: z.number().optional().describe("Maximum number of items to return"),
  lastId: z.string().optional().describe("ID of the last item from previous page for cursor-based pagination"),
});

const getOneSchema = z.object({
  id: z.string().describe("Resource ID to fetch"),
});

// Create MCP server
const server = new Server(
  {
    name: "tellescope-mcp-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "templates_get_page",
      description: "Get a page of templates from Tellescope with optional filtering and pagination. Returns a list of message templates. Use lastId for cursor-based pagination to get the next page of results.",
      inputSchema: {
        type: "object",
        properties: {
          filter: {
            type: "object",
            description: "Filter criteria for templates (e.g., { type: 'email' })",
          },
          limit: {
            type: "number",
            description: "Maximum number of templates to return (default: 25)",
          },
          lastId: {
            type: "string",
            description: "ID of the last item from the previous page. Use this for pagination - pass the 'id' of the last template from the previous result to get the next page.",
          },
        },
      },
    },
    {
      name: "templates_get_one",
      description: "Get a single template by ID from Tellescope. Returns the full template object.",
      inputSchema: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "The unique ID of the template to fetch",
          },
        },
        required: ["id"],
      },
    },
    {
      name: "journeys_get_page",
      description: "Get a page of journeys from Tellescope with optional filtering and pagination. Returns a list of journeys (automation workflows). Use lastId for cursor-based pagination to get the next page of results.",
      inputSchema: {
        type: "object",
        properties: {
          filter: {
            type: "object",
            description: "Filter criteria for journeys (e.g., { title: 'Onboarding' })",
          },
          limit: {
            type: "number",
            description: "Maximum number of journeys to return (default: 25)",
          },
          lastId: {
            type: "string",
            description: "ID of the last item from the previous page. Use this for pagination - pass the 'id' of the last journey from the previous result to get the next page.",
          },
        },
      },
    },
    {
      name: "journeys_get_one",
      description: "Get a single journey by ID from Tellescope. Returns the full journey container but no steps. Use automation_steps_get_page, filtering by journeyId, to fetch steps for a journey.",
      inputSchema: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "The unique ID of the journey to fetch",
          },
        },
        required: ["id"],
      },
    },
    {
      name: "automation_steps_get_page",
      description: "Get a page of automation steps from Tellescope with optional filtering and pagination. Returns a list of automation steps. Use lastId for cursor-based pagination to get the next page of results.",
      inputSchema: {
        type: "object",
        properties: {
          filter: {
            type: "object",
            description: "Filter criteria for automation steps (e.g., { journeyId: 'journey-id' })",
          },
          limit: {
            type: "number",
            description: "Maximum number of automation steps to return (default: 25)",
          },
          lastId: {
            type: "string",
            description: "ID of the last item from the previous page. Use this for pagination - pass the 'id' of the last automation step from the previous result to get the next page.",
          },
        },
      },
    },
    {
      name: "automation_steps_get_one",
      description: "Get a single automation step by ID from Tellescope. Returns the full automation step object.",
      inputSchema: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "The unique ID of the automation step to fetch",
          },
        },
        required: ["id"],
      },
    },
    {
      name: "automation_triggers_get_page",
      description: "Get a page of automation triggers from Tellescope with optional filtering and pagination. Returns a list of automation triggers. Use lastId for cursor-based pagination to get the next page of results.",
      inputSchema: {
        type: "object",
        properties: {
          filter: {
            type: "object",
            description: "Filter criteria for automation triggers (e.g., { status: 'Active' })",
          },
          limit: {
            type: "number",
            description: "Maximum number of automation triggers to return (default: 25)",
          },
          lastId: {
            type: "string",
            description: "ID of the last item from the previous page. Use this for pagination - pass the 'id' of the last automation trigger from the previous result to get the next page.",
          },
        },
      },
    },
    {
      name: "automation_triggers_get_one",
      description: "Get a single automation trigger by ID from Tellescope. Returns the full automation trigger object.",
      inputSchema: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "The unique ID of the automation trigger to fetch",
          },
        },
        required: ["id"],
      },
    },
    {
      name: "organizations_get_page",
      description: "Get a page of organizations from Tellescope with optional filtering and pagination. Returns a list of organizations. Use lastId for cursor-based pagination to get the next page of results.",
      inputSchema: {
        type: "object",
        properties: {
          filter: {
            type: "object",
            description: "Filter criteria for organizations",
          },
          limit: {
            type: "number",
            description: "Maximum number of organizations to return (default: 25)",
          },
          lastId: {
            type: "string",
            description: "ID of the last item from the previous page. Use this for pagination - pass the 'id' of the last organization from the previous result to get the next page.",
          },
        },
      },
    },
    {
      name: "organizations_get_one",
      description: "Get a single organization by ID from Tellescope. Returns the full organization object including custom fields, roles, settings, etc.",
      inputSchema: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "The unique ID of the organization to fetch",
          },
        },
        required: ["id"],
      },
    },
    {
      name: "users_get_page",
      description: "Get a page of users from Tellescope with optional filtering and pagination. Returns a list of users. Use lastId for cursor-based pagination to get the next page of results.",
      inputSchema: {
        type: "object",
        properties: {
          filter: {
            type: "object",
            description: "Filter criteria for users (e.g., { fname: { _exists: true } })",
          },
          limit: {
            type: "number",
            description: "Maximum number of users to return (default: 25)",
          },
          lastId: {
            type: "string",
            description: "ID of the last item from the previous page. Use this for pagination - pass the 'id' of the last user from the previous result to get the next page.",
          },
        },
      },
    },
    {
      name: "users_get_one",
      description: "Get a single user by ID from Tellescope. Returns the full user object.",
      inputSchema: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "The unique ID of the user to fetch",
          },
        },
        required: ["id"],
      },
    },
    {
      name: "forms_get_page",
      description: "Get a page of forms from Tellescope with optional filtering and pagination. Returns a list of forms. Use lastId for cursor-based pagination to get the next page of results.",
      inputSchema: {
        type: "object",
        properties: {
          filter: {
            type: "object",
            description: "Filter criteria for forms (e.g., { title: 'PHQ-9' })",
          },
          limit: {
            type: "number",
            description: "Maximum number of forms to return (default: 25)",
          },
          lastId: {
            type: "string",
            description: "ID of the last item from the previous page. Use this for pagination - pass the 'id' of the last form from the previous result to get the next page.",
          },
        },
      },
    },
    {
      name: "forms_get_one",
      description: "Get a single form by ID from Tellescope. Returns the full form object.",
      inputSchema: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "The unique ID of the form to fetch",
          },
        },
        required: ["id"],
      },
    },
    {
      name: "form_fields_get_page",
      description: "Get a page of form fields from Tellescope with optional filtering and pagination. Returns a list of form fields. Use lastId for cursor-based pagination to get the next page of results.",
      inputSchema: {
        type: "object",
        properties: {
          filter: {
            type: "object",
            description: "Filter criteria for form fields (e.g., { formId: 'form-id' })",
          },
          limit: {
            type: "number",
            description: "Maximum number of form fields to return (default: 25)",
          },
          lastId: {
            type: "string",
            description: "ID of the last item from the previous page. Use this for pagination - pass the 'id' of the last form field from the previous result to get the next page.",
          },
        },
      },
    },
    {
      name: "form_fields_get_one",
      description: "Get a single form field by ID from Tellescope. Returns the full form field object.",
      inputSchema: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "The unique ID of the form field to fetch",
          },
        },
        required: ["id"],
      },
    },
    {
      name: "calendar_event_templates_get_page",
      description: "Get a page of calendar event templates from Tellescope with optional filtering and pagination. Returns a list of appointment types/templates. Use lastId for cursor-based pagination to get the next page of results.",
      inputSchema: {
        type: "object",
        properties: {
          filter: {
            type: "object",
            description: "Filter criteria for calendar event templates (e.g., { title: 'Initial Consultation' })",
          },
          limit: {
            type: "number",
            description: "Maximum number of calendar event templates to return (default: 25)",
          },
          lastId: {
            type: "string",
            description: "ID of the last item from the previous page. Use this for pagination - pass the 'id' of the last calendar event template from the previous result to get the next page.",
          },
        },
      },
    },
    {
      name: "calendar_event_templates_get_one",
      description: "Get a single calendar event template by ID from Tellescope. Returns the full appointment type/template object.",
      inputSchema: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "The unique ID of the calendar event template to fetch",
          },
        },
        required: ["id"],
      },
    },
    {
      name: "appointment_locations_get_page",
      description: "Get a page of appointment locations from Tellescope with optional filtering and pagination. Returns a list of physical and virtual appointment locations. Use lastId for cursor-based pagination to get the next page of results.",
      inputSchema: {
        type: "object",
        properties: {
          filter: {
            type: "object",
            description: "Filter criteria for appointment locations (e.g., { title: 'Main Office' })",
          },
          limit: {
            type: "number",
            description: "Maximum number of appointment locations to return (default: 25)",
          },
          lastId: {
            type: "string",
            description: "ID of the last item from the previous page. Use this for pagination - pass the 'id' of the last appointment location from the previous result to get the next page.",
          },
        },
      },
    },
    {
      name: "appointment_locations_get_one",
      description: "Get a single appointment location by ID from Tellescope. Returns the full location object.",
      inputSchema: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "The unique ID of the appointment location to fetch",
          },
        },
        required: ["id"],
      },
    },
    {
      name: "appointment_booking_pages_get_page",
      description: "Get a page of appointment booking pages from Tellescope with optional filtering and pagination. Returns a list of public booking pages. Use lastId for cursor-based pagination to get the next page of results.",
      inputSchema: {
        type: "object",
        properties: {
          filter: {
            type: "object",
            description: "Filter criteria for appointment booking pages (e.g., { title: 'Book Appointment' })",
          },
          limit: {
            type: "number",
            description: "Maximum number of appointment booking pages to return (default: 25)",
          },
          lastId: {
            type: "string",
            description: "ID of the last item from the previous page. Use this for pagination - pass the 'id' of the last appointment booking page from the previous result to get the next page.",
          },
        },
      },
    },
    {
      name: "appointment_booking_pages_get_one",
      description: "Get a single appointment booking page by ID from Tellescope. Returns the full booking page object.",
      inputSchema: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "The unique ID of the appointment booking page to fetch",
          },
        },
        required: ["id"],
      },
    },
    {
      name: "databases_get_page",
      description: "Get a page of databases from Tellescope with optional filtering and pagination. Returns a list of custom databases. Use lastId for cursor-based pagination to get the next page of results.",
      inputSchema: {
        type: "object",
        properties: {
          filter: {
            type: "object",
            description: "Filter criteria for databases (e.g., { title: 'Patient Registry' })",
          },
          limit: {
            type: "number",
            description: "Maximum number of databases to return (default: 25)",
          },
          lastId: {
            type: "string",
            description: "ID of the last item from the previous page. Use this for pagination - pass the 'id' of the last database from the previous result to get the next page.",
          },
        },
      },
    },
    {
      name: "databases_get_one",
      description: "Get a single database by ID from Tellescope. Returns the full database object including schema and configuration.",
      inputSchema: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "The unique ID of the database to fetch",
          },
        },
        required: ["id"],
      },
    },
    {
      name: "database_records_get_page",
      description: "Get a page of database records from Tellescope with optional filtering and pagination. Returns a list of records from custom databases. Use lastId for cursor-based pagination to get the next page of results.",
      inputSchema: {
        type: "object",
        properties: {
          filter: {
            type: "object",
            description: "Filter criteria for database records (e.g., { databaseId: 'db-id' })",
          },
          limit: {
            type: "number",
            description: "Maximum number of database records to return (default: 25)",
          },
          lastId: {
            type: "string",
            description: "ID of the last item from the previous page. Use this for pagination - pass the 'id' of the last database record from the previous result to get the next page.",
          },
        },
      },
    },
    {
      name: "database_records_get_one",
      description: "Get a single database record by ID from Tellescope. Returns the full database record object with all field values.",
      inputSchema: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "The unique ID of the database record to fetch",
          },
        },
        required: ["id"],
      },
    },
    {
      name: "managed_content_records_get_page",
      description: "Get a page of managed content records from Tellescope with optional filtering and pagination. Returns a list of managed content records. Use lastId for cursor-based pagination to get the next page of results.",
      inputSchema: {
        type: "object",
        properties: {
          filter: {
            type: "object",
            description: "Filter criteria for managed content records (e.g., { category: 'Articles' })",
          },
          limit: {
            type: "number",
            description: "Maximum number of managed content records to return (default: 25)",
          },
          lastId: {
            type: "string",
            description: "ID of the last item from the previous page. Use this for pagination - pass the 'id' of the last managed content record from the previous result to get the next page.",
          },
        },
      },
    },
    {
      name: "managed_content_records_get_one",
      description: "Get a single managed content record by ID from Tellescope. Returns the full managed content record object.",
      inputSchema: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "The unique ID of the managed content record to fetch",
          },
        },
        required: ["id"],
      },
    },
  ],
}));

// Helper function to handle getSome operations
async function handleGetSome(modelName: string, args: any) {
  const model = (session.api as any)[modelName];
  if (!model || !model.getSome) {
    throw new Error(`Model ${modelName} not found or does not support getSome`);
  }

  const results = await model.getSome({
    filter: args.filter,
    limit: args.limit,
    lastId: args.lastId,
  });

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(results, null, 2),
      },
    ],
  };
}

// Helper function to handle getOne operations
async function handleGetOne(modelName: string, args: any) {
  const model = (session.api as any)[modelName];
  if (!model || !model.getOne) {
    throw new Error(`Model ${modelName} not found or does not support getOne`);
  }

  const result = await model.getOne(args.id);

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}

// Implement tool handlers
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const toolName = request.params.name;

    // Parse tool name: {model}_get_{one|page}
    const match = toolName.match(/^(.+)_get_(one|page)$/);
    if (!match) {
      throw new Error(`Invalid tool name format: ${toolName}`);
    }

    const [, modelName, operation] = match;

    // Determine if it's a getSome or getOne operation
    if (operation === "one") {
      const args = getOneSchema.parse(request.params.arguments);
      return await handleGetOne(modelName, args);
    } else {
      const args = getSomeSchema.parse(request.params.arguments);
      return await handleGetSome(modelName, args);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text",
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server with appropriate transport
async function main() {
  const mode = process.env.MCP_TRANSPORT || "stdio";

  if (mode === "http" || mode === "sse") {
    // HTTP/SSE mode for hosted deployment
    const app = express();
    const port = parseInt(process.env.PORT || "3000");

    app.use(express.json());

    // SSE endpoint
    app.get("/sse", async (req, res) => {
      console.error(`SSE connection from ${req.ip}`);
      const transport = new SSEServerTransport("/message", res);
      await server.connect(transport);
    });

    // POST endpoint for SSE messages
    app.post("/message", async (req, res) => {
      // SSE transport handles the message routing
      res.status(200).end();
    });

    app.listen(port, () => {
      console.error(`Tellescope MCP server running on http://localhost:${port}`);
      console.error(`SSE endpoint: http://localhost:${port}/sse`);
    });
  } else {
    // Stdio mode for local development with Claude Code
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Tellescope MCP server running on stdio");
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
