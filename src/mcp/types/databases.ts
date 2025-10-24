import { z } from "zod";
import { createCreateOneSchema, createUpdateOneSchema } from "./_utilities";

// ============================================================================
// Constants - Descriptions
// ============================================================================

export const DATABASE_DESCRIPTIONS = {
  title: "The title/name of the database for internal reference",
  fields: `Array of field definitions that define the database schema. Each field has a type, label, and optional configuration.

Field types and their exact structures:

1. Text - Single-line text input
   { type: 'Text', label: string, required?: boolean, hideFromTable?: boolean, wrap?: string }

2. Email - Email address field with validation
   { type: 'Email', label: string, required?: boolean, hideFromTable?: boolean, wrap?: string }

3. Phone - Phone number field
   { type: 'Phone', label: string, required?: boolean, hideFromTable?: boolean, wrap?: string }

4. Text Long - Multi-line text area
   { type: 'Text Long', label: string, required?: boolean, hideFromTable?: boolean, wrap?: string }

5. Text List - Array of text values
   { type: 'Text List', label: string, required?: boolean, hideFromTable?: boolean, wrap?: string }

6. Number - Numeric input field
   { type: 'Number', label: string, required?: boolean, hideFromTable?: boolean, wrap?: string }

7. Address - Full address with validation
   { type: 'Address', label: string, required?: boolean, hideFromTable?: boolean, wrap?: string }

8. Multiple Select - Multiple choice selection
   { type: 'Multiple Select', label: string, required?: boolean, hideFromTable?: boolean, wrap?: string, options: { options: string[], width?: string } }

9. Dropdown - Single choice dropdown
   { type: 'Dropdown', label: string, required?: boolean, hideFromTable?: boolean, wrap?: string, options: { options: string[], width?: string } }

10. Timestamp - ISO timestamp string
    { type: 'Timestamp', label: string, required?: boolean, hideFromTable?: boolean, wrap?: string }

11. Date - ISO date string
    { type: 'Date', label: string, required?: boolean, hideFromTable?: boolean, wrap?: string }

Common field properties:
- label: Display name for the field (required)
- required: Whether the field is required when creating records (optional, default: false)
- hideFromTable: Hide this field from the table view (optional, default: false)
- wrap: CSS wrap property for display (optional)
- showConditions: Conditional display logic based on other field values (optional, MongoDB-style filter)
- options: Configuration object for fields that need additional settings (Multiple Select, Dropdown)`,
  visibleForRoles: "Array of role names that can see and access this database. If not specified or empty, all roles can access.",
  isReferralDatabase: "Whether this database is used for managing referrals. Enables referral-specific features and workflows.",
} as const;

// ============================================================================
// Constants - Enums
// ============================================================================

export const DATABASE_FIELD_TYPES = [
  'Text',
  'Email',
  'Phone',
  'Text Long',
  'Text List',
  'Number',
  'Address',
  'Multiple Select',
  'Dropdown',
  'Timestamp',
  'Date',
] as const;

// ============================================================================
// Helper Function - JSON Schema Properties
// ============================================================================

export const buildDatabaseProperties = (isUpdate = false) => ({
  title: {
    type: "string" as const,
    description: DATABASE_DESCRIPTIONS.title,
  },
  fields: {
    type: "array" as const,
    description: DATABASE_DESCRIPTIONS.fields,
    items: {
      type: "object" as const,
      properties: {
        type: {
          type: "string" as const,
          enum: DATABASE_FIELD_TYPES,
          description: "The field type - determines the data type and input UI for this field",
        },
        label: {
          type: "string" as const,
          description: "Display name for this field, shown in the UI and used to reference values",
        },
        required: {
          type: "boolean" as const,
          description: "Whether this field is required when creating database records (default: false)",
        },
        hideFromTable: {
          type: "boolean" as const,
          description: "Hide this field from the table view in the UI (default: false)",
        },
        wrap: {
          type: "string" as const,
          description: "CSS wrap property for display formatting",
        },
        showConditions: {
          type: "object" as const,
          description: "MongoDB-style conditional logic to show/hide this field based on other field values",
        },
        options: {
          type: "object" as const,
          description: "Additional field configuration. For Multiple Select and Dropdown: { options: string[], width?: string }. Width property applies to all field types.",
          properties: {
            options: {
              type: "array" as const,
              items: { type: "string" as const },
              description: "Available options for Multiple Select or Dropdown fields",
            },
            width: {
              type: "string" as const,
              description: "CSS width property for field display",
            },
          },
        },
      },
      required: ["type", "label"],
    },
  },
  visibleForRoles: {
    type: "array" as const,
    items: { type: "string" as const },
    description: DATABASE_DESCRIPTIONS.visibleForRoles,
  },
  isReferralDatabase: {
    type: "boolean" as const,
    description: DATABASE_DESCRIPTIONS.isReferralDatabase,
  },
});

// ============================================================================
// Zod Schemas (Internal)
// ============================================================================

// Database field options schema
const databaseFieldOptionsSchema = z.object({
  options: z.array(z.string()).optional(),
  width: z.string().optional(),
}).optional();

// Database field schema (union of all field types)
const databaseFieldSchema = z.union([
  // Text
  z.object({
    type: z.literal('Text'),
    label: z.string(),
    required: z.boolean().optional(),
    hideFromTable: z.boolean().optional(),
    wrap: z.string().optional(),
    showConditions: z.record(z.any()).optional(),
    options: z.object({ width: z.string().optional() }).optional(),
  }),
  // Email
  z.object({
    type: z.literal('Email'),
    label: z.string(),
    required: z.boolean().optional(),
    hideFromTable: z.boolean().optional(),
    wrap: z.string().optional(),
    showConditions: z.record(z.any()).optional(),
    options: z.object({ width: z.string().optional() }).optional(),
  }),
  // Phone
  z.object({
    type: z.literal('Phone'),
    label: z.string(),
    required: z.boolean().optional(),
    hideFromTable: z.boolean().optional(),
    wrap: z.string().optional(),
    showConditions: z.record(z.any()).optional(),
    options: z.object({ width: z.string().optional() }).optional(),
  }),
  // Text Long
  z.object({
    type: z.literal('Text Long'),
    label: z.string(),
    required: z.boolean().optional(),
    hideFromTable: z.boolean().optional(),
    wrap: z.string().optional(),
    showConditions: z.record(z.any()).optional(),
    options: z.object({ width: z.string().optional() }).optional(),
  }),
  // Text List
  z.object({
    type: z.literal('Text List'),
    label: z.string(),
    required: z.boolean().optional(),
    hideFromTable: z.boolean().optional(),
    wrap: z.string().optional(),
    showConditions: z.record(z.any()).optional(),
    options: z.object({ width: z.string().optional() }).optional(),
  }),
  // Number
  z.object({
    type: z.literal('Number'),
    label: z.string(),
    required: z.boolean().optional(),
    hideFromTable: z.boolean().optional(),
    wrap: z.string().optional(),
    showConditions: z.record(z.any()).optional(),
    options: z.object({ width: z.string().optional() }).optional(),
  }),
  // Address
  z.object({
    type: z.literal('Address'),
    label: z.string(),
    required: z.boolean().optional(),
    hideFromTable: z.boolean().optional(),
    wrap: z.string().optional(),
    showConditions: z.record(z.any()).optional(),
    options: z.object({ width: z.string().optional() }).optional(),
  }),
  // Multiple Select
  z.object({
    type: z.literal('Multiple Select'),
    label: z.string(),
    required: z.boolean().optional(),
    hideFromTable: z.boolean().optional(),
    wrap: z.string().optional(),
    showConditions: z.record(z.any()).optional(),
    options: z.object({
      options: z.array(z.string()),
      width: z.string().optional(),
    }).optional(),
  }),
  // Dropdown
  z.object({
    type: z.literal('Dropdown'),
    label: z.string(),
    required: z.boolean().optional(),
    hideFromTable: z.boolean().optional(),
    wrap: z.string().optional(),
    showConditions: z.record(z.any()).optional(),
    options: z.object({
      options: z.array(z.string()),
      width: z.string().optional(),
    }).optional(),
  }),
  // Timestamp
  z.object({
    type: z.literal('Timestamp'),
    label: z.string(),
    required: z.boolean().optional(),
    hideFromTable: z.boolean().optional(),
    wrap: z.string().optional(),
    showConditions: z.record(z.any()).optional(),
    options: z.object({ width: z.string().optional() }).optional(),
  }),
  // Date
  z.object({
    type: z.literal('Date'),
    label: z.string(),
    required: z.boolean().optional(),
    hideFromTable: z.boolean().optional(),
    wrap: z.string().optional(),
    showConditions: z.record(z.any()).optional(),
    options: z.object({ width: z.string().optional() }).optional(),
  }),
]);

const databaseDataSchema = z.object({
  title: z.string().describe(DATABASE_DESCRIPTIONS.title),
  fields: z.array(databaseFieldSchema).describe(DATABASE_DESCRIPTIONS.fields),
  visibleForRoles: z.array(z.string()).optional().describe(DATABASE_DESCRIPTIONS.visibleForRoles),
  isReferralDatabase: z.boolean().optional().describe(DATABASE_DESCRIPTIONS.isReferralDatabase),
});

const databaseUpdatesSchema = databaseDataSchema.partial();

// ============================================================================
// Exported Wrapped Schemas (for Registry)
// ============================================================================

export const databaseSchemas = {
  create: createCreateOneSchema(databaseDataSchema),
  update: createUpdateOneSchema(databaseUpdatesSchema),
};

// ============================================================================
// Tool Definitions
// ============================================================================

export const databaseTools = [
  {
    name: "databases_create_one",
    description: "Create a new database in Tellescope. Returns the created database object with its ID. Databases are custom data structures for storing structured records with defined field schemas.",
    inputSchema: {
      type: "object",
      properties: {
        data: {
          type: "object",
          description: "Database creation data",
          properties: buildDatabaseProperties(false),
          required: ["title", "fields"],
        },
      },
      required: ["data"],
    },
  },
  {
    name: "databases_update_one",
    description: "Update an existing database by ID in Tellescope. Returns the updated database object. Note: Updating fields will affect the schema for all records in this database.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "The unique ID of the database to update",
        },
        updates: {
          type: "object",
          description: "Database update data - all fields are optional",
          properties: buildDatabaseProperties(true),
        },
        options: {
          type: "object",
          description: "Update options",
          properties: {
            replaceObjectFields: {
              type: "boolean",
              description: "Controls merge vs. replace for objects/arrays. CRITICAL: Call explain_concept tool with concept='replaceObjectFields' BEFORE use to avoid data loss. Default (false) = merge behavior (safe). True = complete replacement (dangerous - deletes unmentioned data).",
            },
          },
        },
      },
      required: ["id", "updates"],
    },
  },
];
