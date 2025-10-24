import { z } from "zod";
import { createCreateOneSchema, createUpdateOneSchema } from "./_utilities";

// ============================================================================
// Constants - Descriptions
// ============================================================================

export const DATABASE_RECORD_DESCRIPTIONS = {
  databaseId: "The unique ID of the database this record belongs to",
  values: `Array of field values for this database record. Each value has type, value, and label properties.

Value structure depends on field type:

1. Text - Single-line text
   { type: 'Text', value: string, label: string }

2. Email - Email address with validation
   { type: 'Email', value: string, label: string }

3. Phone - Phone number
   { type: 'Phone', value: string, label: string }

4. Text Long - Multi-line text
   { type: 'Text Long', value: string, label: string }

5. Text List - Array of text strings
   { type: 'Text List', value: string[], label: string }

6. Number - Numeric value or empty string
   { type: 'Number', value: number | '', label: string }

7. Address - Full address object
   { type: 'Address', value: {
     addressLineOne: string,
     addressLineTwo?: string,
     city: string,
     zipCode: string,
     zipPlusFour?: string,
     state: string
   } | undefined, label: string }

8. Multiple Select - Multiple choice selection
   { type: 'Multiple Select', value: string[], label: string }

9. Dropdown - Single choice selection
   { type: 'Dropdown', value: string, label: string }

10. Timestamp - ISO timestamp string
    { type: 'Timestamp', value: string, label: string }

11. Date - ISO date string
    { type: 'Date', value: string, label: string }

The 'label' field should match the field label defined in the parent Database schema.
The 'value' field type must match the field type's expected value type.`,
} as const;

// ============================================================================
// Constants - Enums
// ============================================================================

export const DATABASE_RECORD_FIELD_TYPES = [
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

export const buildDatabaseRecordProperties = (isUpdate = false) => ({
  databaseId: {
    type: "string" as const,
    description: DATABASE_RECORD_DESCRIPTIONS.databaseId,
  },
  values: {
    type: "array" as const,
    description: DATABASE_RECORD_DESCRIPTIONS.values,
    items: {
      type: "object" as const,
      properties: {
        type: {
          type: "string" as const,
          enum: DATABASE_RECORD_FIELD_TYPES,
          description: "The field type - must match a field defined in the parent Database schema",
        },
        label: {
          type: "string" as const,
          description: "The field label - must match a field label defined in the parent Database schema",
        },
        value: {
          description: "The value for this field. Type depends on the field type (string, number, array, object, etc.)",
        },
      },
      required: ["type", "label", "value"],
    },
  },
});

// ============================================================================
// Zod Schemas (Internal)
// ============================================================================

// Address value schema
const addressValueSchema = z.object({
  addressLineOne: z.string(),
  addressLineTwo: z.string().optional(),
  city: z.string(),
  zipCode: z.string(),
  zipPlusFour: z.string().optional(),
  state: z.string(),
}).optional();

// Database record value schema (union of all field types)
const databaseRecordValueSchema = z.union([
  // Text
  z.object({
    type: z.literal('Text'),
    value: z.string(),
    label: z.string(),
  }),
  // Email
  z.object({
    type: z.literal('Email'),
    value: z.string(),
    label: z.string(),
  }),
  // Phone
  z.object({
    type: z.literal('Phone'),
    value: z.string(),
    label: z.string(),
  }),
  // Text Long
  z.object({
    type: z.literal('Text Long'),
    value: z.string(),
    label: z.string(),
  }),
  // Text List
  z.object({
    type: z.literal('Text List'),
    value: z.array(z.string()),
    label: z.string(),
  }),
  // Number
  z.object({
    type: z.literal('Number'),
    value: z.union([z.number(), z.literal('')]),
    label: z.string(),
  }),
  // Address
  z.object({
    type: z.literal('Address'),
    value: addressValueSchema,
    label: z.string(),
  }),
  // Multiple Select
  z.object({
    type: z.literal('Multiple Select'),
    value: z.array(z.string()),
    label: z.string(),
  }),
  // Dropdown
  z.object({
    type: z.literal('Dropdown'),
    value: z.string(),
    label: z.string(),
  }),
  // Timestamp
  z.object({
    type: z.literal('Timestamp'),
    value: z.string(),
    label: z.string(),
  }),
  // Date
  z.object({
    type: z.literal('Date'),
    value: z.string(),
    label: z.string(),
  }),
]);

const databaseRecordDataSchema = z.object({
  databaseId: z.string().describe(DATABASE_RECORD_DESCRIPTIONS.databaseId),
  values: z.array(databaseRecordValueSchema).describe(DATABASE_RECORD_DESCRIPTIONS.values),
});

const databaseRecordUpdatesSchema = databaseRecordDataSchema.partial();

// ============================================================================
// Exported Wrapped Schemas (for Registry)
// ============================================================================

export const databaseRecordSchemas = {
  create: createCreateOneSchema(databaseRecordDataSchema),
  update: createUpdateOneSchema(databaseRecordUpdatesSchema),
};

// ============================================================================
// Tool Definitions
// ============================================================================

export const databaseRecordTools = [
  {
    name: "database_records_create_one",
    description: "Create a new database record in Tellescope. Returns the created database record object with its ID. Database records store structured data in custom databases defined by the Database schema.",
    inputSchema: {
      type: "object",
      properties: {
        data: {
          type: "object",
          description: "Database record creation data",
          properties: buildDatabaseRecordProperties(false),
          required: ["databaseId", "values"],
        },
      },
      required: ["data"],
    },
  },
  {
    name: "database_records_update_one",
    description: "Update an existing database record by ID in Tellescope. Returns the updated database record object.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "The unique ID of the database record to update",
        },
        updates: {
          type: "object",
          description: "Database record update data - all fields are optional",
          properties: buildDatabaseRecordProperties(true),
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
