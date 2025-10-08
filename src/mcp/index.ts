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
