import { z } from "zod";
import { createCreateOneSchema, createUpdateOneSchema } from "./_utilities";

// FormField field descriptions (reusable across create and update schemas)
export const FORM_FIELD_DESCRIPTIONS = {
  formId: "The ID of the form this field belongs to",
  title: "The title/label/question text displayed for this field",
  type: "The type of form field - determines the input UI and validation",
  previousFieldsArray: "Defines field position and conditional display logic in the form flow",
  previousFieldType:
    "Position/condition type: 'root' = first field in form, 'after' = positioned after another field, " +
    "'previousEquals' = shown only when a previous field equals a specific value, " +
    "'compoundLogic' = shown based on conditional logic referencing previous field responses",
  previousFieldInfo:
    "Configuration for the previousField type. " +
    "For 'root': {}. " +
    "For 'after': { fieldId: 'id-of-previous-field' }. " +
    "For 'previousEquals': { fieldId: 'field-id', equals: 'value' }. " +
    "For 'compoundLogic': { fieldId: 'field-id', priority: number, label: 'label', condition: { $and: [{ condition: { <fieldId>: <value> } }] } }. " +
    "The 'condition' structure uses MongoDB-style operators ($and, $or) with nested condition objects. " +
    "Most commonly, reference previous field responses by fieldId (e.g., 'field_abc123': 'Yes'). " +
    "Can also use calculated fields ('bmi', 'age', 'score', 'gender', 'state') or rarely enduser properties ('tags', 'fname'). " +
    "Operators: $exists, $gt, $gte, $lt, $lte, $in, $nin. " +
    "Example: { $and: [{ condition: { 'insurance_field_id': 'Yes' } }, { condition: { age: { $gte: 18 } } }] }",
  previousFieldInfoUpdate: "Same structure as create - see create schema for details on compoundLogic condition format",
  isOptional: "Whether the field is optional (default: false = required)",
  placeholder: "Placeholder text shown in the input field",
  description: "Plain text help text or description shown below the field",
  htmlDescription: "HTML formatted description (for 'description' and 'Rich Text' type fields)",
  headerText: "Header text displayed above this field",
  internalNote: "Internal note visible only to staff, not shown to end users",
  options:
    "Field-specific configuration options. Contents vary by field type. " +
    "For multiple_choice/Dropdown/ranking: { choices: string[], radio: boolean, other: boolean }. " +
    "For rating: { from: number, to: number }. " +
    "For file/files: { validFileTypes: string[], maxFileSize: number }. " +
    "For Database Select: { databaseId: string, databaseLabel: string }. " +
    "See FormFieldOptions type for complete list of options.",
  intakeField:
    "Name of the enduser (patient) custom field to map this response to. " +
    "Use exact custom field name defined in your organization settings. " +
    "Special reserved values: 'email', 'phone', 'dateOfBirth', 'state', 'gender', 'height', etc.",
  sharedWithEnduser: "Whether this field's value is visible to the enduser in their portal",
  prepopulateFromFields: "Whether to prepopulate this field from existing enduser data",
  disabledWhenPrepopulated: "Disable editing if field was prepopulated from existing data",
  externalId: "External identifier for integration with other systems",
  highlightOnTimeline: "Whether to highlight this field's response on the enduser timeline",
  fullZIP: "For address fields: require full ZIP+4 format instead of 5-digit ZIP",
  titleFontSize: "Custom font size for the field title (in pixels)",
} as const;

// FormField type enum (reusable)
export const FORM_FIELD_TYPES = [
  // Literal types
  'Rich Text', 'description', 'string', 'stringLong', 'number', 'email', 'phone',
  'date', 'dateString', 'rating', 'Time', 'Timezone',
  // Complex types
  'Conditions', 'Allergies', 'Emotii', 'Hidden Value', 'Redirect', 'Height',
  'Appointment Booking', 'multiple_choice', 'file', 'files', 'signature', 'ranking',
  'Question Group', 'Table Input', 'Address', 'Chargebee', 'Stripe', 'Dropdown',
  'Database Select', 'Medications', 'Related Contacts', 'Insurance',
] as const;

// PreviousField type enum (reusable)
export const PREVIOUS_FIELD_TYPES = ['root', 'after', 'previousEquals', 'compoundLogic'] as const;

/**
 * Helper to build JSON Schema properties object from constants
 * @param isUpdate - Whether this is for an update schema (affects required fields and descriptions)
 * @returns JSON Schema properties object
 */
export const buildFormFieldProperties = (isUpdate = false) => ({
  formId: {
    type: "string" as const,
    description: FORM_FIELD_DESCRIPTIONS.formId,
  },
  title: {
    type: "string" as const,
    description: FORM_FIELD_DESCRIPTIONS.title,
  },
  type: {
    type: "string" as const,
    enum: FORM_FIELD_TYPES,
    description: FORM_FIELD_DESCRIPTIONS.type,
  },
  previousFields: {
    type: "array" as const,
    description: FORM_FIELD_DESCRIPTIONS.previousFieldsArray,
    items: {
      type: "object" as const,
      properties: {
        type: {
          type: "string" as const,
          enum: PREVIOUS_FIELD_TYPES,
          description: FORM_FIELD_DESCRIPTIONS.previousFieldType,
        },
        info: {
          type: "object" as const,
          description: isUpdate ? FORM_FIELD_DESCRIPTIONS.previousFieldInfoUpdate : FORM_FIELD_DESCRIPTIONS.previousFieldInfo,
        },
      },
      required: ["type", "info"],
    },
  },
  isOptional: {
    type: "boolean" as const,
    description: FORM_FIELD_DESCRIPTIONS.isOptional,
  },
  placeholder: {
    type: "string" as const,
    description: FORM_FIELD_DESCRIPTIONS.placeholder,
  },
  description: {
    type: "string" as const,
    description: FORM_FIELD_DESCRIPTIONS.description,
  },
  htmlDescription: {
    type: "string" as const,
    description: FORM_FIELD_DESCRIPTIONS.htmlDescription,
  },
  headerText: {
    type: "string" as const,
    description: FORM_FIELD_DESCRIPTIONS.headerText,
  },
  internalNote: {
    type: "string" as const,
    description: FORM_FIELD_DESCRIPTIONS.internalNote,
  },
  options: {
    type: "object" as const,
    description: FORM_FIELD_DESCRIPTIONS.options,
  },
  intakeField: {
    type: "string" as const,
    description: FORM_FIELD_DESCRIPTIONS.intakeField,
  },
  sharedWithEnduser: {
    type: "boolean" as const,
    description: FORM_FIELD_DESCRIPTIONS.sharedWithEnduser,
  },
  prepopulateFromFields: {
    type: "boolean" as const,
    description: FORM_FIELD_DESCRIPTIONS.prepopulateFromFields,
  },
  disabledWhenPrepopulated: {
    type: "boolean" as const,
    description: FORM_FIELD_DESCRIPTIONS.disabledWhenPrepopulated,
  },
  externalId: {
    type: "string" as const,
    description: FORM_FIELD_DESCRIPTIONS.externalId,
  },
  highlightOnTimeline: {
    type: "boolean" as const,
    description: FORM_FIELD_DESCRIPTIONS.highlightOnTimeline,
  },
  fullZIP: {
    type: "boolean" as const,
    description: FORM_FIELD_DESCRIPTIONS.fullZIP,
  },
  titleFontSize: {
    type: "number" as const,
    description: FORM_FIELD_DESCRIPTIONS.titleFontSize,
  },
});

// FormField Zod schemas
export const formFieldDataSchema = z.object({
  formId: z.string().describe(FORM_FIELD_DESCRIPTIONS.formId),
  title: z.string().describe(FORM_FIELD_DESCRIPTIONS.title),
  type: z.enum(FORM_FIELD_TYPES).describe(FORM_FIELD_DESCRIPTIONS.type),
  previousFields: z.array(z.object({
    type: z.enum(PREVIOUS_FIELD_TYPES).describe(FORM_FIELD_DESCRIPTIONS.previousFieldType),
    info: z.record(z.any()).describe(FORM_FIELD_DESCRIPTIONS.previousFieldInfo),
  })).describe(FORM_FIELD_DESCRIPTIONS.previousFieldsArray),
  isOptional: z.boolean().optional().describe(FORM_FIELD_DESCRIPTIONS.isOptional),
  placeholder: z.string().optional().describe(FORM_FIELD_DESCRIPTIONS.placeholder),
  description: z.string().optional().describe(FORM_FIELD_DESCRIPTIONS.description),
  htmlDescription: z.string().optional().describe(FORM_FIELD_DESCRIPTIONS.htmlDescription),
  headerText: z.string().optional().describe(FORM_FIELD_DESCRIPTIONS.headerText),
  internalNote: z.string().optional().describe(FORM_FIELD_DESCRIPTIONS.internalNote),
  options: z.record(z.any()).optional().describe(FORM_FIELD_DESCRIPTIONS.options),
  intakeField: z.string().optional().nullable().describe(FORM_FIELD_DESCRIPTIONS.intakeField),
  sharedWithEnduser: z.boolean().optional().describe(FORM_FIELD_DESCRIPTIONS.sharedWithEnduser),
  prepopulateFromFields: z.boolean().optional().describe(FORM_FIELD_DESCRIPTIONS.prepopulateFromFields),
  disabledWhenPrepopulated: z.boolean().optional().describe(FORM_FIELD_DESCRIPTIONS.disabledWhenPrepopulated),
  externalId: z.string().optional().describe(FORM_FIELD_DESCRIPTIONS.externalId),
  highlightOnTimeline: z.boolean().optional().describe(FORM_FIELD_DESCRIPTIONS.highlightOnTimeline),
  fullZIP: z.boolean().optional().describe(FORM_FIELD_DESCRIPTIONS.fullZIP),
  titleFontSize: z.number().optional().describe(FORM_FIELD_DESCRIPTIONS.titleFontSize),
}).describe("Form field creation data");

export const formFieldUpdatesSchema = z.object({
  title: z.string().optional().describe(FORM_FIELD_DESCRIPTIONS.title),
  isOptional: z.boolean().optional().describe(FORM_FIELD_DESCRIPTIONS.isOptional),
  placeholder: z.string().optional().describe(FORM_FIELD_DESCRIPTIONS.placeholder),
  description: z.string().optional().describe(FORM_FIELD_DESCRIPTIONS.description),
  htmlDescription: z.string().optional().describe(FORM_FIELD_DESCRIPTIONS.htmlDescription),
  headerText: z.string().optional().describe(FORM_FIELD_DESCRIPTIONS.headerText),
  internalNote: z.string().optional().describe(FORM_FIELD_DESCRIPTIONS.internalNote),
  options: z.record(z.any()).optional().describe(FORM_FIELD_DESCRIPTIONS.options),
  previousFields: z.array(z.object({
    type: z.enum(PREVIOUS_FIELD_TYPES),
    info: z.record(z.any()).describe(FORM_FIELD_DESCRIPTIONS.previousFieldInfoUpdate),
  })).optional().describe(FORM_FIELD_DESCRIPTIONS.previousFieldsArray),
  intakeField: z.string().optional().nullable().describe(FORM_FIELD_DESCRIPTIONS.intakeField),
  sharedWithEnduser: z.boolean().optional().describe(FORM_FIELD_DESCRIPTIONS.sharedWithEnduser),
  prepopulateFromFields: z.boolean().optional().describe(FORM_FIELD_DESCRIPTIONS.prepopulateFromFields),
  disabledWhenPrepopulated: z.boolean().optional().describe(FORM_FIELD_DESCRIPTIONS.disabledWhenPrepopulated),
  externalId: z.string().optional().describe(FORM_FIELD_DESCRIPTIONS.externalId),
  highlightOnTimeline: z.boolean().optional().describe(FORM_FIELD_DESCRIPTIONS.highlightOnTimeline),
  fullZIP: z.boolean().optional().describe(FORM_FIELD_DESCRIPTIONS.fullZIP),
  titleFontSize: z.number().optional().describe(FORM_FIELD_DESCRIPTIONS.titleFontSize),
}).describe("Form field update data");

// Export wrapped schemas for registry
export const formFieldSchemas = {
  create: createCreateOneSchema(formFieldDataSchema),
  update: createUpdateOneSchema(formFieldUpdatesSchema),
};

// Export tool definitions
export const formFieldTools = [
  {
    name: "form_fields_create_one",
    description: "Create a new form field in Tellescope. Returns the created form field object with its ID.",
    inputSchema: {
      type: "object",
      properties: {
        data: {
          type: "object",
          description: "Form field creation data",
          properties: buildFormFieldProperties(false),
          required: ["formId", "title", "type", "previousFields"],
        },
      },
      required: ["data"],
    },
  },
  {
    name: "form_fields_update_one",
    description: "Update an existing form field in Tellescope. Returns the updated form field object.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "The unique ID of the form field to update",
        },
        updates: {
          type: "object",
          description: "Form field update data - all fields are optional",
          properties: buildFormFieldProperties(true),
        },
      },
      required: ["id", "updates"],
    },
  },
];
