import { z } from "zod";
import { createCreateOneSchema, createUpdateOneSchema } from "./_utilities";

// FormField field descriptions (reusable across create and update schemas)
export const FORM_FIELD_DESCRIPTIONS = {
  formId: "The ID of the form this field belongs to",
  title: "The title/label/question text displayed for this field",
  type: `The type of form field - determines the input UI, validation, and available options. CRITICAL: Choose the type based on the data you need to collect.

Common field types by category:

TEXT INPUT:
- 'string' - Short text input (single line)
- 'stringLong' - Long text input (multi-line textarea)
- 'Rich Text' - Rich text INPUT field for collecting formatted responses. Used sparingly - typically never for patient-facing forms, occasionally for internal documentation forms.
- 'email' - Email address with validation
- 'phone' - Phone number with formatting
- 'number' - Numeric input

DATES & TIME:
- 'date' - Date picker (stores as Date object)
- 'dateString' - Date picker (stores as string)
- 'Time' - Time selection
- 'Timezone' - Timezone selector

CHOICES & SELECTIONS:
- 'multiple_choice' - Checkboxes or radio buttons (options: { choices: string[], radio: boolean, other: boolean })
- 'Dropdown' - Dropdown select menu (options: { choices: string[] })
- 'Database Select' - Select from database records (options: { databaseId, databaseLabel })
- 'ranking' - Rank items in order (options: { choices: string[] })
- 'rating' - Star/number rating (options: { from: number, to: number })

MEDICAL/HEALTH:
- 'Conditions' - Medical conditions selector
- 'Allergies' - Allergies input
- 'Medications' - Medication list
- 'Insurance' - Insurance information form
- 'Height' - Height input with units

FILES & MEDIA:
- 'file' - Single file upload (options: { validFileTypes: string[], maxFileSize: number })
- 'files' - Multiple file upload (options: { validFileTypes: string[], maxFileSize: number })
- 'signature' - E-signature capture

DISPLAY-ONLY:
- 'description' - Display-only plain text for instructions and information

SPECIAL PURPOSE:
- 'Hidden Value' - Hidden field with preset value
- 'Redirect' - Redirect to another form or URL
- 'Question Group' - Group of sub-questions
- 'Table Input' - Table/grid input
- 'Address' - Full address form (options: { addressFields: string[], validStates: string[] })
- 'Related Contacts' - Related contacts selector
- 'Appointment Booking' - Inline appointment booking (options: { bookingPageId: string })
- 'Chargebee' - Chargebee payment integration
- 'Stripe' - Stripe payment integration
- 'Emotii' - Emotion/mood selector`,
  previousFieldsArray: `Defines field position and conditional display logic in the form flow. CRITICAL: Every form MUST have exactly one field with previousFields: [{ type: 'root', info: {} }] - this is the first field shown.

PreviousField types and their exact structures:

1. root - REQUIRED for first field in form
   [{ type: 'root', info: {} }]

2. after - Position immediately after another field
   [{ type: 'after', info: { fieldId: 'id-of-previous-field' } }]

3. previousEquals - Show only when a previous field equals specific value
   [{ type: 'previousEquals', info: {
     fieldId: 'id-of-conditional-field',
     equals: 'specific-value-to-match'
   }}]

4. compoundLogic - Show based on complex conditional logic
   [{ type: 'compoundLogic', info: {
     fieldId: 'id-of-previous-field',  // Field to position after
     priority: number,                 // Display order (lower = shown first)
     label: 'Condition description',   // Human-readable condition label
     condition: {                      // MongoDB-style query
       $and: [                         // Supports $and, $or
         { condition: { 'field_id_1': 'Yes' } },              // Field response match
         { condition: { age: { $gte: 18 } } },                // Calculated field (age, bmi, score, gender, state)
         { condition: { tags: 'high-risk' } }                 // Enduser property (tags, fname, lname, etc.)
       ]
     }
   }}]

Available operators in condition: $exists, $gt, $gte, $lt, $lte, $eq, $ne, $in, $nin

Common condition patterns:
- Field equals value: { 'fieldId': 'value' }
- Field exists: { 'fieldId': { $exists: true } }
- Age over 18: { age: { $gte: 18 } }
- Multiple conditions: { $and: [{ condition: {...} }, { condition: {...} }] }
- Any of multiple conditions: { $or: [{ condition: {...} }, { condition: {...} }] }

Calculated fields available in conditions:
- 'bmi' - Body Mass Index (calculated from height/weight fields)
- 'age' - Age in years (from dateOfBirth)
- 'score' - Form score (if form has scoring enabled)
- 'gender' - Gender value
- 'state' - US state

Enduser properties available in conditions (use sparingly):
- 'tags' - Enduser tags array
- 'fname', 'lname' - Name fields
- Any custom field name defined in organization settings`,
  previousFieldType:
    "Position/condition type: 'root' = first field in form (REQUIRED for exactly one field), 'after' = positioned after another field, " +
    "'previousEquals' = shown only when a previous field equals a specific value, " +
    "'compoundLogic' = shown based on conditional logic referencing previous field responses",
  previousFieldInfo:
    "Configuration for the previousField type. See previousFieldsArray description for complete documentation with exact JSON structures for all 4 types (root, after, previousEquals, compoundLogic).",
  previousFieldInfoUpdate: "Same structure as create - see previousFieldsArray description for complete documentation with exact JSON structures",
  isOptional: "Whether the field is optional (default: false = required)",
  placeholder: "Placeholder text shown in the input field",
  description: "Plain text help text or description shown below the field",
  htmlDescription: "HTML formatted description (for 'description' and 'Rich Text' type fields)",
  headerText: "Header text displayed above this field",
  internalNote: "Internal note visible only to staff, not shown to end users",
  options: `Field-specific configuration options object. Contents vary by field type. All fields are optional unless marked required.

CHOICE-BASED FIELDS (multiple_choice, Dropdown, ranking):
{
  choices: string[],              // (required) Array of choice options
  radio: boolean,                 // multiple_choice only: true for radio buttons, false for checkboxes
  other: boolean,                 // Allow "Other" option with text input
  optionDetails: Array<{          // Additional metadata per choice
    value: string,
    imageS3Key: string
  }>,
  radioChoices: string[]          // Alternative radio button choices
}

RATING FIELDS:
{
  from: number,                   // (required) Minimum rating value
  to: number,                     // (required) Maximum rating value
  rangeStepSize: number          // Step size for slider (default: 1)
}

FILE UPLOAD FIELDS (file, files):
{
  validFileTypes: string[],       // Allowed file types (e.g., ['Image', 'PDF', 'Video'])
  maxFileSize: number,            // Maximum file size in bytes
  hideFromPortal: boolean,        // Hide uploaded files from patient portal
  autoUploadFiles: boolean        // Auto-upload files without confirmation
}

DATABASE SELECT FIELDS:
{
  databaseId: string,             // (required) ID of database to select from
  databaseLabel: string,          // (required) Field to use as display label
  databaseLabels: string[],       // Multiple fields for compound labels
  filterByEnduserState: boolean,  // Filter records by enduser's state
  databaseFilter: {               // Additional filter criteria
    fieldId: string,
    databaseLabel: string
  },
  allowAddToDatabase: boolean     // Allow creating new database records inline
}

ADDRESS FIELDS:
{
  addressFields: string[],        // Fields to include (e.g., ['state'] for state-only)
  validStates: string[]           // Restrict to specific US states (e.g., ['CA', 'NY'])
}

APPOINTMENT BOOKING FIELDS:
{
  bookingPageId: string,          // (required) ID of AppointmentBookingPage
  holdAppointmentMinutes: number // Minutes to hold slot before confirmation
}

PAYMENT FIELDS (Stripe, Chargebee):
{
  productIds: string[],           // Product IDs for purchase
  chargeImmediately: boolean,     // Charge card immediately vs later
  customPriceMessage: string,     // Custom price display message
  stripeKey: string,              // Stripe publishable key (if custom)
  stripeProductSelectionMode: boolean,  // Enable product selection UI
  chargebeeEnvironment: string,   // Chargebee environment name
  chargebeePlanId: string,        // Chargebee plan ID
  chargebeeItemId: string         // Chargebee item ID
}

TABLE INPUT FIELDS:
{
  tableChoices: Array<{           // Table structure definition
    value: string,
    label: string
  }>
}

QUESTION GROUP FIELDS:
{
  subFields: Array<{              // Sub-questions within group
    title: string,
    type: string,
    // ... other field properties
  }>,
  groupPadding: number            // Spacing around group
}

REDIRECT FIELDS:
{
  redirectFormId: string,         // ID of form to redirect to
  redirectExternalUrl: string     // External URL to redirect to
}

SIGNATURE FIELDS:
{
  signatureUrl: string,           // PDF template URL for signature
  pdfAttachment: string,          // PDF file attachment
  prefillSignature: boolean,      // Prefill from previous signature
  esignatureTermsCompanyName: string  // Company name for e-signature terms
}

RELATED CONTACTS FIELDS:
{
  relatedContactTypes: string[],  // Contact types to allow (e.g., ['Parent', 'Guardian'])
  customTypeId: string,           // Custom contact type ID
  copyResponse: boolean,          // Copy response to related contacts when created
  sharedIntakeFields: string[],   // Fields to share with related contact
  hiddenDefaultFields: string[]   // Default fields to hide
}

INSURANCE FIELDS:
{
  requirePredefinedInsurer: boolean,  // Require selecting from predefined insurers
  includeGroupNumber: boolean         // Include group number field
}

MEDICAL/EHR INTEGRATION FIELDS:
{
  dataSource: string,             // Data source (e.g., 'Canvas' for EHR)
  canvasCodings: Array<{          // Canvas FHIR codings
    system: string,
    code: string,
    display: string
  }>,
  canvasConsentCategory: string,  // Canvas consent category
  canvasDocumentCoding: {         // Canvas document category coding
    system: string,
    code: string
  },
  canvasDocumentType: {           // Canvas document type coding
    system: string,
    code: string,
    display: string
  },
  canvasDocumentComment: string,  // Comment for Canvas document
  canvasReviewMode: string,       // Canvas review mode
  observationCode: string,        // LOINC/SNOMED observation code
  observationDisplay: string,     // Observation display name
  observationUnit: string,        // Observation unit (e.g., 'kg', 'cm')
  billingProvider: string,        // Billing provider ('Canvas', 'Candid', etc.)
  elationHistoryType: string,     // Elation history type
  elationIsAllergy: boolean,      // Mark as allergy in Elation
  elationAppendToNote: boolean,   // Append to Elation note
  elationAppendToNotePrefix: string  // Prefix for Elation note append
}

DISPLAY & UX OPTIONS (apply to many field types):
{
  default: string,                // Default value for field
  useDatePicker: boolean,         // Use date picker UI
  autoAdvance: boolean,           // Auto-advance to next field on completion
  autoSubmit: boolean,            // Auto-submit form on completion
  disableGoBack: boolean,         // Disable back button for this field
  disableNext: boolean,           // Disable next button until field complete
  saveIntakeOnPartial: boolean    // Save intake data on partial submission
}

ADVANCED USER SELECTION:
{
  userTags: string[],             // Filter users by tags
  userFilterTags: string[]        // Additional user tag filters
}`,
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
    description: "Create a new form field in Tellescope. Returns the created form field object with its ID. CRITICAL: Every form MUST have exactly one field with previousFields: [{ type: 'root', info: {} }] - this is the first field shown to users.",
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
