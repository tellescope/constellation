import { z } from "zod";
import { createCreateOneSchema, createUpdateOneSchema } from "./_utilities";

// ============================================================================
// Constants
// ============================================================================

/**
 * Field descriptions for AutomationStep properties
 */
export const AUTOMATION_STEP_DESCRIPTIONS = {
  journeyId: "The ID of the journey this step belongs to",
  events: `Array of trigger events for this step. CRITICAL: Every journey MUST have at least one step with event type 'onJourneyStart' - this is the entry point when an enduser is added to the journey.

Event types and their exact structures:

1. onJourneyStart - REQUIRED for journey entry point
   { type: 'onJourneyStart', info: {} }

2. afterAction - Sequential steps with optional delay
   { type: 'afterAction', info: {
     automationStepId: string,  // ID of previous step
     delayInMS: number,          // Delay in milliseconds (e.g., 86400000 = 1 day)
     delay: number,              // Display value (e.g., 1)
     unit: 'Seconds' | 'Minutes' | 'Hours' | 'Days',
     officeHoursOnly?: boolean,
     useEnduserTimezone?: boolean,
     skipIfDelayPassed?: boolean,
     dayOfMonthCondition?: {     // Run on specific day of month
       dayOfMonth: number,       // 1-31
       hour?: number,            // 0-23 (default: 9)
       minute?: number           // 0-59 (default: 0)
     }
   }}

3. formResponse - After form submission
   { type: 'formResponse', info: { automationStepId: string } }

4. formResponses - After multiple forms submitted
   { type: 'formResponses', info: { automationStepId: string } }

5. waitForTrigger - Wait for external trigger to fire
   { type: 'waitForTrigger', info: {
     automationStepId: string,
     triggerId: string
   }}

6. onError - Error handler for another step
   { type: 'onError', info: { automationStepId: string } }

7. ticketCompleted - After ticket is completed
   { type: 'ticketCompleted', info: {
     automationStepId: string,
     closedForReason?: string
   }}

8. onCallOutcome - After outbound call completes
   { type: 'onCallOutcome', info: {
     automationStepId: string,
     outcome: string
   }}

9. onAIDecision - After AI decision point
   { type: 'onAIDecision', info: {
     automationStepId: string,
     outcomes: string[]
   }}

10. formUnsubmitted - DEPRECATED (use 'formResponse' with conditions instead)
11. formsUnsubmitted - DEPRECATED`,

  action: `The action to perform when this step executes. Object with 'type', 'info', and optional 'continueOnError'.

Common action types and their exact structures:

COMMUNICATION ACTIONS:
1. sendEmail
   { type: 'sendEmail', info: {
     templateId: string,
     senderId: string,
     fromEmailOverride?: string,
     ccRelatedContactTypes?: string[],
     hiddenFromTimeline?: boolean
   }}

2. sendSMS
   { type: 'sendSMS', info: {
     templateId: string,
     senderId: string,
     hiddenFromTimeline?: boolean
   }}

3. sendChat
   { type: 'sendChat', info: {
     templateId?: string,
     message?: string,
     senderId?: string,
     includesCareTeam?: boolean
   }}

4. sendForm
   { type: 'sendForm', info: {
     formId: string,
     senderId: string,
     channel: 'Email' | 'SMS' | 'Chat'
   }}

ENDUSER MANAGEMENT:
5. setEnduserStatus
   { type: 'setEnduserStatus', info: { status: string } }

6. setEnduserFields
   { type: 'setEnduserFields', info: {
     fields: Array<{
       name: string,
       type: 'Custom Value' | 'Current Date' | 'Increment Number',
       value: string,
       increment?: number
     }>
   }}

7. addEnduserTags
   { type: 'addEnduserTags', info: {
     tags: string[],
     replaceExisting?: boolean
   }}

8. removeEnduserTags
   { type: 'removeEnduserTags', info: { tags: string[] } }

JOURNEY MANAGEMENT:
9. addToJourney
   { type: 'addToJourney', info: { journeyId: string } }

10. removeFromJourney
    { type: 'removeFromJourney', info: { journeyId: string } }

11. removeFromAllJourneys
    { type: 'removeFromAllJourneys', info: {} }

TASK CREATION:
12. createTicket
    { type: 'createTicket', info: {
      title: string,
      assignmentStrategy: { type: string, info: object },
      defaultAssignee: string,
      description?: string,
      dueDateOffsetInMS?: number,
      priority?: number,
      tags?: string[]
    }}

NOTIFICATIONS:
13. notifyTeam
    { type: 'notifyTeam', info: {
      templateId: string,
      forAssigned: boolean,
      roles?: string[],
      tags?: { qualifier: string, value: string[] }
    }}

14. sendWebhook
    { type: 'sendWebhook', info: {
      message: string,
      url?: string,
      secret?: string,
      method?: 'get' | 'patch' | 'post' | 'put' | 'delete',
      rawJSONBody?: string
    }}

CONTENT & CARE:
15. shareContent
    { type: 'shareContent', info: { managedContentRecordIds: string[] } }

16. createCarePlan
    { type: 'createCarePlan', info: {
      title: string,
      highlightedEnduserFields?: string[]
    }}

ADVANCED:
17. aiDecision
    { type: 'aiDecision', info: {
      prompt: string,
      options: string[],
      model?: string
    }}

18. outboundCall
    { type: 'outboundCall', info: {
      type: string,
      template?: string
    }}

Plus 30+ more action types including: pushFormsToPortal, completeTickets, changeContactType, cancelFutureAppointments, assignCareTeam, removeCareTeam, stripeChargeCardOnFile, and various third-party integrations (Zendesk, Iterable, Healthie, Canvas, Athena, Elation, ActiveCampaign, CustomerIO, PagerDuty, etc.)`,

  enduserConditions: "Optional MongoDB-style filter to restrict which endusers this step applies to. Uses SDK-style operators (_exists, _in, _gt, etc., NOT $ prefix). Can filter on enduser fields, custom fields, tags, journey state. Example: { 'Risk Level': 'High', tags: { _in: ['vip'] } } or compound: { $and: [{ condition: { tags: 'vip' } }] }. Note: Use $and/$or for compound logic, but use _ prefix for comparison operators.",
  conditions: "Legacy automation conditions (deprecated - use enduserConditions instead). Array of condition objects for backward compatibility.",
  continueOnError: "Whether to continue the journey if this step fails (default: false = stop on error). When true, allows afterAction steps to run even if this step errors. Note: In many action type definitions, continueOnError appears inside the action object itself.",
  flowchartUI: "UI positioning data for flowchart display. Object with x and y coordinates: { x: number, y: number }. Used by the Journey Editor interface.",
  tags: "Array of tags for categorizing and filtering automation steps (e.g., ['reminder', '24h', 'high-priority'])",
} as const;

// ============================================================================
// Helper Function
// ============================================================================

/**
 * Builds JSON Schema properties for AutomationStep fields
 * @param isUpdate - Whether this is for an update operation (all fields optional)
 */
export const buildAutomationStepProperties = (isUpdate = false) => ({
  journeyId: {
    type: "string" as const,
    description: AUTOMATION_STEP_DESCRIPTIONS.journeyId,
  },
  events: {
    type: "array" as const,
    items: { type: "object" as const },
    description: AUTOMATION_STEP_DESCRIPTIONS.events,
  },
  action: {
    type: "object" as const,
    description: AUTOMATION_STEP_DESCRIPTIONS.action,
  },
  enduserConditions: {
    type: "object" as const,
    description: AUTOMATION_STEP_DESCRIPTIONS.enduserConditions,
  },
  conditions: {
    type: "array" as const,
    items: { type: "object" as const },
    description: AUTOMATION_STEP_DESCRIPTIONS.conditions,
  },
  continueOnError: {
    type: "boolean" as const,
    description: AUTOMATION_STEP_DESCRIPTIONS.continueOnError,
  },
  flowchartUI: {
    type: "object" as const,
    description: AUTOMATION_STEP_DESCRIPTIONS.flowchartUI,
  },
  tags: {
    type: "array" as const,
    items: { type: "string" as const },
    description: AUTOMATION_STEP_DESCRIPTIONS.tags,
  },
});

// ============================================================================
// Zod Schemas (Internal)
// ============================================================================

/**
 * Zod schema for AutomationStep creation
 */
const automationStepDataSchema = z.object({
  journeyId: z.string().describe(AUTOMATION_STEP_DESCRIPTIONS.journeyId),
  events: z.array(z.record(z.any())).describe(AUTOMATION_STEP_DESCRIPTIONS.events),
  action: z.record(z.any()).describe(AUTOMATION_STEP_DESCRIPTIONS.action),
  enduserConditions: z.record(z.any()).optional().describe(AUTOMATION_STEP_DESCRIPTIONS.enduserConditions),
  conditions: z.array(z.record(z.any())).optional().describe(AUTOMATION_STEP_DESCRIPTIONS.conditions),
  continueOnError: z.boolean().optional().describe(AUTOMATION_STEP_DESCRIPTIONS.continueOnError),
  flowchartUI: z.object({
    x: z.number(),
    y: z.number(),
  }).optional().describe(AUTOMATION_STEP_DESCRIPTIONS.flowchartUI),
  tags: z.array(z.string()).optional().describe(AUTOMATION_STEP_DESCRIPTIONS.tags),
});

/**
 * Zod schema for AutomationStep updates (all fields optional except id)
 */
const automationStepUpdatesSchema = automationStepDataSchema.partial();

// ============================================================================
// Exported Schemas for Registry
// ============================================================================

export const automationStepSchemas = {
  create: createCreateOneSchema(automationStepDataSchema),
  update: createUpdateOneSchema(automationStepUpdatesSchema),
};

// ============================================================================
// Tool Definitions
// ============================================================================

export const automationStepTools = [
  {
    name: "automation_steps_create_one",
    description: "Create a new automation step in Tellescope. Returns the created automation step object with its ID. CRITICAL: Every journey MUST have at least one step with event type 'onJourneyStart' to serve as the entry point.",
    inputSchema: {
      type: "object",
      properties: {
        data: {
          type: "object",
          description: "Automation step creation data",
          properties: buildAutomationStepProperties(false),
          required: ["journeyId", "events", "action"],
        },
      },
      required: ["data"],
    },
  },
  {
    name: "automation_steps_update_one",
    description: "Update an existing automation step by ID in Tellescope. Returns the updated automation step object.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "The unique ID of the automation step to update",
        },
        updates: {
          type: "object",
          description: "Automation step update data - all fields are optional",
          properties: buildAutomationStepProperties(true),
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
