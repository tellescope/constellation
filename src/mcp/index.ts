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
import { createCreateOneSchema, createUpdateOneSchema } from "./types/_utilities";
import { formFieldSchemas, formFieldTools } from "./types/form_fields";
import { formSchemas, formTools } from "./types/forms";
import { journeySchemas, journeyTools } from "./types/journeys";
import { automationStepSchemas, automationStepTools } from "./types/automation_steps";
import { messageTemplateSchemas, messageTemplateTools } from "./types/templates";
import { calendarEventTemplateSchemas, calendarEventTemplateTools } from "./types/calendar_event_templates";
import { appointmentLocationSchemas, appointmentLocationTools } from "./types/appointment_locations";
import { appointmentBookingPageSchemas, appointmentBookingPageTools } from "./types/appointment_booking_pages";
import { databaseRecordSchemas, databaseRecordTools } from "./types/database_records";
import { databaseSchemas, databaseTools } from "./types/databases";
import { organizationSchemas, organizationTools } from "./types/organizations";

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

// Define shared input schemas for read operations
const getSomeSchema = z.object({
  mdbFilter: z.record(z.any()).optional().describe("MongoDB-style filter query with native MongoDB operators ($exists, $gt, $in, $and, $or, etc.). Example: { tags: 'vip', state: 'CA' }"),
  limit: z.number().optional().describe("Maximum number of items to return (default: 25)"),
  lastId: z.string().optional().describe("ID of the last item from previous page for cursor-based pagination"),
  from: z.union([z.string(), z.number()]).optional().describe("Start date/time for createdAt range filter (ISO string or Unix timestamp)"),
  to: z.string().optional().describe("End date/time for createdAt range filter (ISO string)"),
  fromToField: z.string().optional().describe("Field name to use for from/to range filter (default: 'createdAt')"),
  fromUpdated: z.string().optional().describe("Start date/time for updatedAt range filter (ISO string)"),
  toUpdated: z.string().optional().describe("End date/time for updatedAt range filter (ISO string)"),
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
      name: "explain_concept",
      description: "Get detailed documentation for a specific Tellescope API concept. IMPORTANT: Call this tool BEFORE using features like replaceObjectFields, enduserConditions, mdbFilter, or date range filtering to understand correct usage and avoid data loss.",
      inputSchema: {
        type: "object",
        properties: {
          concept: {
            type: "string",
            enum: ["replaceObjectFields", "enduserFiltering", "mdbFilter", "dateRangeFiltering"],
            description: "The concept to explain:\n- 'replaceObjectFields': Update behavior for objects/arrays (merge vs replace) - CRITICAL to avoid data loss\n- 'enduserFiltering': Filter automations by patient properties (enduserCondition/enduserConditions)\n- 'mdbFilter': MongoDB query syntax for filtering resources in get_page calls\n- 'dateRangeFiltering': Using from/to parameters for date range queries",
          },
        },
        required: ["concept"],
      },
    },
    {
      name: "list_concepts",
      description: "List all available API concepts with brief descriptions. Use this to discover what concepts are available, then call explain_concept for detailed documentation.",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
    {
      name: "templates_get_page",
      description: "Get a page of templates from Tellescope with optional filtering and pagination. Returns a list of message templates. Use lastId for cursor-based pagination to get the next page of results.",
      inputSchema: {
        type: "object",
        properties: {
          mdbFilter: {
            type: "object",
            description: "MongoDB-style filter query with native MongoDB operators ($exists, $in, $gt, etc.). Example: { type: 'enduser' }, { tags: { $in: ['onboarding'] } })",
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
          mdbFilter: {
            type: "object",
            description: "MongoDB-style filter query for journeys (e.g., { title: 'Onboarding' })",
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
          mdbFilter: {
            type: "object",
            description: "MongoDB-style filter query for automation steps (e.g., { journeyId: 'journey-id' })",
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
          mdbFilter: {
            type: "object",
            description: "MongoDB-style filter query for automation triggers (e.g., { status: 'Active' })",
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
          mdbFilter: {
            type: "object",
            description: "MongoDB-style filter query for organizations",
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
          mdbFilter: {
            type: "object",
            description: "MongoDB-style filter query for users (e.g., { fname: { _exists: true } })",
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
          mdbFilter: {
            type: "object",
            description: "MongoDB-style filter query for forms (e.g., { title: 'PHQ-9' })",
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
          mdbFilter: {
            type: "object",
            description: "MongoDB-style filter query for form fields (e.g., { formId: 'form-id' })",
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
    ...formFieldTools,
    ...formTools,
    ...journeyTools,
    ...automationStepTools,
    ...messageTemplateTools,
    ...calendarEventTemplateTools,
    ...appointmentLocationTools,
    ...appointmentBookingPageTools,
    ...databaseTools,
    ...databaseRecordTools,
    ...organizationTools,
    {
      name: "calendar_event_templates_get_page",
      description: "Get a page of calendar event templates from Tellescope with optional filtering and pagination. Returns a list of appointment types/templates. Use lastId for cursor-based pagination to get the next page of results.",
      inputSchema: {
        type: "object",
        properties: {
          mdbFilter: {
            type: "object",
            description: "MongoDB-style filter query for calendar event templates (e.g., { title: 'Initial Consultation' })",
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
          mdbFilter: {
            type: "object",
            description: "MongoDB-style filter query for appointment locations (e.g., { title: 'Main Office' })",
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
          mdbFilter: {
            type: "object",
            description: "MongoDB-style filter query for appointment booking pages (e.g., { title: 'Book Appointment' })",
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
          mdbFilter: {
            type: "object",
            description: "MongoDB-style filter query for databases (e.g., { title: 'Patient Registry' })",
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
          mdbFilter: {
            type: "object",
            description: "MongoDB-style filter query for database records (e.g., { databaseId: 'db-id' })",
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
          mdbFilter: {
            type: "object",
            description: "MongoDB-style filter query for managed content records (e.g., { category: 'Articles' })",
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
    {
      name: "products_get_page",
      description: "Get a page of products from Tellescope with optional filtering and pagination. Returns a list of products. Use lastId for cursor-based pagination to get the next page of results.",
      inputSchema: {
        type: "object",
        properties: {
          mdbFilter: {
            type: "object",
            description: "MongoDB-style filter query for products (e.g., { name: 'Consultation' })",
          },
          limit: {
            type: "number",
            description: "Maximum number of products to return (default: 25)",
          },
          lastId: {
            type: "string",
            description: "ID of the last item from the previous page. Use this for pagination - pass the 'id' of the last product from the previous result to get the next page.",
          },
        },
      },
    },
    {
      name: "products_get_one",
      description: "Get a single product by ID from Tellescope. Returns the full product object.",
      inputSchema: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "The unique ID of the product to fetch",
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
    mdbFilter: args.mdbFilter,
    limit: args.limit,
    lastId: args.lastId,
    from: args.from,
    to: args.to,
    fromToField: args.fromToField,
    fromUpdated: args.fromUpdated,
    toUpdated: args.toUpdated,
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

// Helper function to handle createOne operations
async function handleCreateOne(modelName: string, args: any) {
  const model = (session.api as any)[modelName];
  if (!model || !model.createOne) {
    throw new Error(`Model ${modelName} not found or does not support createOne`);
  }

  const result = await model.createOne(args.data);

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}

// Helper function to handle updateOne operations
async function handleUpdateOne(modelName: string, args: any) {
  const model = (session.api as any)[modelName];
  if (!model || !model.updateOne) {
    throw new Error(`Model ${modelName} not found or does not support updateOne`);
  }

  const result = await model.updateOne(args.id, args.updates, args.options);

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}

// Registry of model-specific schemas for validation
const modelSchemas: Record<string, {
  create?: z.ZodType<any>;
  update?: z.ZodType<any>;
}> = {
  form_fields: formFieldSchemas,
  forms: formSchemas,
  journeys: journeySchemas,
  automation_steps: automationStepSchemas,
  templates: messageTemplateSchemas,
  calendar_event_templates: calendarEventTemplateSchemas,
  appointment_locations: appointmentLocationSchemas,
  appointment_booking_pages: appointmentBookingPageSchemas,
  databases: databaseSchemas,
  database_records: databaseRecordSchemas,
  organizations: organizationSchemas,
  // Add more models here as they're implemented
};

// Implement tool handlers
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const toolName = request.params.name;

    // Handle special documentation tools
    if (toolName === "list_concepts") {
      return {
        content: [
          {
            type: "text",
            text: `# Available Tellescope API Concepts

## replaceObjectFields
**Critical**: Controls merge vs. replace behavior when updating objects and arrays. MUST understand before using updateOne methods to avoid accidental data loss.

## enduserFiltering
Filter automation actions based on patient (enduser) properties. Used in AutomationStep enduserConditions and AutomationTrigger enduserCondition fields.

## mdbFilter
MongoDB-style query syntax for filtering resources in get_page calls. Uses native MongoDB operators with $ prefix ($exists, $in, $gt, etc.).

## dateRangeFiltering
Using dedicated from/to parameters for date range queries instead of mdbFilter with comparison operators. More efficient and cleaner syntax.

---

Call explain_concept with the concept name to get detailed documentation with examples.`,
          },
        ],
      };
    }

    if (toolName === "explain_concept") {
      const fs = await import("fs/promises");
      const path = await import("path");

      const args = request.params.arguments as { concept: string };
      const conceptName = args.concept;

      // Map concept names to file names
      const conceptPath = path.join(__dirname, `../../docs/concepts/${conceptName}.md`);

      try {
        const content = await fs.readFile(conceptPath, "utf-8");
        return {
          content: [
            {
              type: "text",
              text: content,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error: Concept '${conceptName}' not found. Use list_concepts to see available concepts.`,
            },
          ],
          isError: true,
        };
      }
    }

    // Parse tool name: {model}_{operation}_{one|page}
    // Supported patterns:
    // - {model}_get_{one|page}
    // - {model}_create_one
    // - {model}_update_one
    const getMatch = toolName.match(/^(.+)_get_(one|page)$/);
    const createMatch = toolName.match(/^(.+)_create_one$/);
    const updateMatch = toolName.match(/^(.+)_update_one$/);

    if (getMatch) {
      const [, modelName, operation] = getMatch;
      if (operation === "one") {
        const args = getOneSchema.parse(request.params.arguments);
        return await handleGetOne(modelName, args);
      } else {
        const args = getSomeSchema.parse(request.params.arguments);
        return await handleGetSome(modelName, args);
      }
    } else if (createMatch) {
      const [, modelName] = createMatch;

      // Use model-specific schema if available, otherwise fall back to generic
      const schema = modelSchemas[modelName]?.create ?? createCreateOneSchema(z.record(z.any()));
      const args = schema.parse(request.params.arguments);
      return await handleCreateOne(modelName, args);
    } else if (updateMatch) {
      const [, modelName] = updateMatch;

      // Use model-specific schema if available, otherwise fall back to generic
      const schema = modelSchemas[modelName]?.update ?? createUpdateOneSchema(z.record(z.any()));
      const args = schema.parse(request.params.arguments);
      return await handleUpdateOne(modelName, args);
    } else {
      throw new Error(`Invalid tool name format: ${toolName}`);
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
