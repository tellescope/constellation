import { z } from "zod";
import { createCreateOneSchema, createUpdateOneSchema } from "./_utilities";

// ============================================================================
// Constants
// ============================================================================

/**
 * Field descriptions for AutomationTrigger properties
 */
export const AUTOMATION_TRIGGER_DESCRIPTIONS = {
  event: `The triggering event configuration. Object with 'type' and 'info' defining when this trigger fires.

Event types and their exact structures:

1. Form Submitted - When a form is submitted
   { type: 'Form Submitted', info: { formId: string } }

2. Form Started - When a form is started (for abandoned form workflows)
   { type: 'Form Started', info: { formId: string } }

3. Field Equals - When an enduser field changes to a specific value
   { type: 'Field Equals', info: { field: string, value: string } }

4. Tag Added - When a tag is added to an enduser
   { type: 'Tag Added', info: { tag: string } }

5. Appointment Booked - When an appointment is booked
   { type: 'Appointment Booked', info: { templateId?: string } }

6. Appointment Cancelled - When an appointment is cancelled
   { type: 'Appointment Cancelled', info: { templateId?: string } }

7. Ticket Created - When a ticket is created
   { type: 'Ticket Created', info: {} }

8. Ticket Closed - When a ticket is closed
   { type: 'Ticket Closed', info: { closedForReason?: string } }

9. New User - When a new enduser is created
   { type: 'New User', info: {} }

10. Webhook - External webhook event
    { type: 'Webhook', info: { url?: string } }

And many more event types available for different triggers.`,

  action: `The action to perform when trigger fires. Object with 'type' and 'info'.

Common action types:

1. Add To Journey
   { type: 'Add To Journey', info: {
     journeyId: string,
     doNotRestart?: boolean  // Prevents re-enrolling if already in journey
   }}

2. Remove From Journey
   { type: 'Remove From Journey', info: { journeyId: string } }

3. Add Tags
   { type: 'Add Tags', info: { tags: string[] } }

4. Remove Tags
   { type: 'Remove Tags', info: { tags: string[] } }

5. Set Field
   { type: 'Set Field', info: {
     field: string,
     value: string
   }}

6. Send Email
   { type: 'Send Email', info: {
     templateId: string,
     senderId: string
   }}

7. Send SMS
   { type: 'Send SMS', info: {
     templateId: string,
     senderId: string
   }}

8. Create Ticket
   { type: 'Create Ticket', info: {
     title: string,
     assigneeId?: string
   }}

And many more action types for different operations.`,

  status: `Trigger status: 'Active' (enabled), 'Inactive' (disabled), or 'Testing' (test mode)`,

  title: `The title/name of the trigger for identification`,

  description: `Optional description explaining what this trigger does and when it fires`,

  tags: `Array of tags for categorizing and filtering triggers (e.g., ['onboarding', 'high-priority'])`,

  enduserCondition: `Optional MongoDB-style filter to restrict which endusers this trigger applies to. Uses SDK-style operators (_exists, _in, _gt, etc., NOT $ prefix). Can filter on enduser fields, custom fields, tags, journey state. Example: { 'Risk Level': 'High', tags: { _in: ['vip'] } } or compound: { $and: [{ condition: { tags: 'vip' } }] }. Note: Use $and/$or for compound logic, but use _ prefix for comparison operators.`,

  journeyId: `Optional journey ID if this is a journey-specific trigger. Most triggers are global (no journeyId) and use 'Add To Journey' or 'Remove From Journey' actions instead.`,
};

// ============================================================================
// Zod Schemas
// ============================================================================

// Event schemas
const eventInfoSchema = z.record(z.any()).describe("Event-specific configuration");
const eventSchema = z.object({
  type: z.string().describe("Event type (e.g., 'Form Submitted', 'Tag Added', 'Field Equals')"),
  info: eventInfoSchema,
});

// Action schemas
const actionInfoSchema = z.record(z.any()).describe("Action-specific configuration");
const actionSchema = z.object({
  type: z.string().describe("Action type (e.g., 'Add To Journey', 'Send Email', 'Add Tags')"),
  info: actionInfoSchema,
});

// Enduser condition schema
const enduserConditionSchema = z.record(z.any()).describe(
  AUTOMATION_TRIGGER_DESCRIPTIONS.enduserCondition
);

// Create automation trigger data schema
const automationTriggerCreateDataSchema = z.object({
  event: eventSchema.describe(AUTOMATION_TRIGGER_DESCRIPTIONS.event),
  action: actionSchema.describe(AUTOMATION_TRIGGER_DESCRIPTIONS.action),
  status: z.enum(["Active", "Inactive", "Testing"]).describe(AUTOMATION_TRIGGER_DESCRIPTIONS.status),
  title: z.string().min(1).describe(AUTOMATION_TRIGGER_DESCRIPTIONS.title),
  description: z.string().optional().describe(AUTOMATION_TRIGGER_DESCRIPTIONS.description),
  tags: z.array(z.string()).optional().describe(AUTOMATION_TRIGGER_DESCRIPTIONS.tags),
  enduserCondition: enduserConditionSchema.optional(),
  journeyId: z.string().optional().describe(AUTOMATION_TRIGGER_DESCRIPTIONS.journeyId),
});

// Update automation trigger data schema (all fields optional)
const automationTriggerUpdateDataSchema = z.object({
  event: eventSchema.optional().describe(AUTOMATION_TRIGGER_DESCRIPTIONS.event),
  action: actionSchema.optional().describe(AUTOMATION_TRIGGER_DESCRIPTIONS.action),
  status: z.enum(["Active", "Inactive", "Testing"]).optional().describe(AUTOMATION_TRIGGER_DESCRIPTIONS.status),
  title: z.string().min(1).optional().describe(AUTOMATION_TRIGGER_DESCRIPTIONS.title),
  description: z.string().optional().describe(AUTOMATION_TRIGGER_DESCRIPTIONS.description),
  tags: z.array(z.string()).optional().describe(AUTOMATION_TRIGGER_DESCRIPTIONS.tags),
  enduserCondition: enduserConditionSchema.optional(),
  journeyId: z.string().optional().describe(AUTOMATION_TRIGGER_DESCRIPTIONS.journeyId),
});

// ============================================================================
// Export Schemas
// ============================================================================

export const automationTriggerSchemas = {
  create: createCreateOneSchema(automationTriggerCreateDataSchema),
  update: createUpdateOneSchema(automationTriggerUpdateDataSchema),
};

// ============================================================================
// Tool Definitions
// ============================================================================

export const automationTriggerTools = [
  {
    name: "automation_triggers_create_one",
    description: "Create a new automation trigger in Tellescope. Returns the created automation trigger object with its ID. Triggers automatically fire actions when specific events occur (e.g., form submitted, tag added, appointment booked).",
    inputSchema: {
      type: "object",
      properties: {
        data: {
          type: "object",
          description: "Automation trigger creation data",
          properties: {
            event: {
              type: "object",
              description: AUTOMATION_TRIGGER_DESCRIPTIONS.event,
              properties: {
                type: { type: "string" },
                info: { type: "object" },
              },
              required: ["type", "info"],
            },
            action: {
              type: "object",
              description: AUTOMATION_TRIGGER_DESCRIPTIONS.action,
              properties: {
                type: { type: "string" },
                info: { type: "object" },
              },
              required: ["type", "info"],
            },
            status: {
              type: "string",
              enum: ["Active", "Inactive", "Testing"],
              description: AUTOMATION_TRIGGER_DESCRIPTIONS.status,
            },
            title: {
              type: "string",
              description: AUTOMATION_TRIGGER_DESCRIPTIONS.title,
            },
            description: {
              type: "string",
              description: AUTOMATION_TRIGGER_DESCRIPTIONS.description,
            },
            tags: {
              type: "array",
              items: { type: "string" },
              description: AUTOMATION_TRIGGER_DESCRIPTIONS.tags,
            },
            enduserCondition: {
              type: "object",
              description: AUTOMATION_TRIGGER_DESCRIPTIONS.enduserCondition,
            },
            journeyId: {
              type: "string",
              description: AUTOMATION_TRIGGER_DESCRIPTIONS.journeyId,
            },
          },
          required: ["event", "action", "status", "title"],
        },
      },
      required: ["data"],
    },
  },
  {
    name: "automation_triggers_update_one",
    description: "Update an existing automation trigger by ID in Tellescope. Returns the updated automation trigger object.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "The unique ID of the automation trigger to update",
        },
        updates: {
          type: "object",
          description: "Automation trigger update data - all fields are optional",
          properties: {
            event: {
              type: "object",
              description: AUTOMATION_TRIGGER_DESCRIPTIONS.event,
              properties: {
                type: { type: "string" },
                info: { type: "object" },
              },
            },
            action: {
              type: "object",
              description: AUTOMATION_TRIGGER_DESCRIPTIONS.action,
              properties: {
                type: { type: "string" },
                info: { type: "object" },
              },
            },
            status: {
              type: "string",
              enum: ["Active", "Inactive", "Testing"],
              description: AUTOMATION_TRIGGER_DESCRIPTIONS.status,
            },
            title: {
              type: "string",
              description: AUTOMATION_TRIGGER_DESCRIPTIONS.title,
            },
            description: {
              type: "string",
              description: AUTOMATION_TRIGGER_DESCRIPTIONS.description,
            },
            tags: {
              type: "array",
              items: { type: "string" },
              description: AUTOMATION_TRIGGER_DESCRIPTIONS.tags,
            },
            enduserCondition: {
              type: "object",
              description: AUTOMATION_TRIGGER_DESCRIPTIONS.enduserCondition,
            },
            journeyId: {
              type: "string",
              description: AUTOMATION_TRIGGER_DESCRIPTIONS.journeyId,
            },
          },
        },
        options: {
          type: "object",
          description: "Update options",
          properties: {
            replaceObjectFields: {
              type: "boolean",
              description: `Controls merge vs. replace for objects/arrays. CRITICAL: Call explain_concept tool with concept='replaceObjectFields' BEFORE use to avoid data loss. Default (false) = merge behavior (safe). True = complete replacement (dangerous - deletes unmentioned data).`,
            },
          },
        },
      },
      required: ["id", "updates"],
    },
  },
];
