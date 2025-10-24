import { z } from "zod";
import { createCreateOneSchema, createUpdateOneSchema } from "./_utilities";

// CalendarEventTemplate field descriptions (reusable across create and update schemas)
export const CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS = {
  title: "The appointment type name (e.g., 'Initial Consultation', 'Follow-Up Visit')",
  durationInMinutes: "Default duration of appointments created from this template in minutes (e.g., 30, 60)",
  type: "Category or type identifier for grouping similar appointment types (e.g., 'consultation', 'therapy', 'procedure')",
  displayTitle: "User-facing title shown to patients when booking (defaults to title if not specified)",
  displayDescription: "User-facing description shown to patients when booking, explaining what to expect during the appointment",
  description: "Internal description for staff reference, not shown to patients",
  instructions: "Instructions shown to attendees before/after booking (e.g., preparation instructions, what to bring)",

  // Scheduling settings
  apiOnly: "If true, appointment can only be booked via API or by staff, not through self-scheduling UI (default: false)",
  bufferStartMinutes: "Buffer time in minutes before the appointment starts (for room setup, preparation)",
  bufferEndMinutes: "Buffer time in minutes after the appointment ends (for cleanup, notes)",
  enduserAttendeeLimit: "Maximum number of endusers (patients) allowed per appointment. Use for group appointments (e.g., 8 for group therapy)",

  // Video/telehealth settings
  enableVideoCall: "Enable video calling for this appointment type (default: false)",
  videoIntegration: "Video platform integration: 'Zoom' for Zoom integration, 'No Integration' for no video (default: 'No Integration')",
  generateZoomLinkWhenBooked: "Automatically generate a Zoom meeting link when appointment is booked (requires Zoom integration)",
  useUserURL: "Use the provider's personal meeting URL instead of generating a new one (for Zoom)",

  // Reminders - detailed documentation for complex type
  reminders: `Array of reminder configurations. Each reminder is triggered before the appointment starts and can send notifications via email, SMS, webhook, or trigger automation.

Reminder types and their exact structures:

1. enduser-notification - Send notification to patient
   {
     type: 'enduser-notification',
     msBeforeStartTime: number,  // Milliseconds before appointment (e.g., 86400000 = 24 hours)
     info: {
       templateId?: string,      // MessageTemplate ID to use for content
       channel?: 'Email' | 'SMS', // Notification channel
       useTemplateForSMS?: boolean // Use template content for SMS (default: false)
     },
     dontSendIfPassed?: boolean, // Skip if reminder time already passed (default: false)
     didRemind?: boolean,         // Internal tracking - whether reminder was sent
     dontSendIfJoined?: boolean  // Skip if patient already joined call (for video appointments)
   }

2. user-notification - Send notification to provider/staff
   {
     type: 'user-notification',
     msBeforeStartTime: number,
     info: {
       templateId?: string,
       channel?: 'Email' | 'SMS',
       useTemplateForSMS?: boolean
     },
     dontSendIfPassed?: boolean,
     didRemind?: boolean,
     dontSendIfJoined?: boolean
   }

3. add-to-journey - Add patient to automation journey
   {
     type: 'add-to-journey',
     msBeforeStartTime: number,
     info: {
       journeyId: string,         // Journey ID to add patient to
       firstAttendeeOnly?: boolean // Only add first attendee (for group appointments)
     },
     dontSendIfPassed?: boolean
   }

4. Remove From Journey - Remove patient from automation journey
   {
     type: 'Remove From Journey',
     msBeforeStartTime: number,
     info: {
       journeyId: string          // Journey ID to remove patient from
     },
     dontSendIfPassed?: boolean
   }

5. webhook - Trigger webhook notification
   {
     type: 'webhook',
     msBeforeStartTime: number,
     info: {},                    // Webhook configured at organization level
     dontSendIfPassed?: boolean
   }

6. create-ticket - Create task/ticket for staff
   {
     type: 'create-ticket',
     msBeforeStartTime: number,
     info: {
       title: string              // Title of the ticket to create
     },
     dontSendIfPassed?: boolean
   }

Common msBeforeStartTime values:
- 86400000 = 24 hours
- 43200000 = 12 hours
- 3600000 = 1 hour
- 900000 = 15 minutes`,

  confirmationEmailDisabled: "Disable automatic confirmation email when appointment is booked (default: false)",
  confirmationSMSDisabled: "Disable automatic confirmation SMS when appointment is booked (default: false)",

  // Portal/enduser settings
  publicRead: "Make template details visible to endusers after they book (not for public access before booking)",
  portalSettings: "Portal display configuration object: { hideUsers?: boolean } - controls what patients see in their portal",
  requiresEnduser: "Appointment must have a patient (enduser) attached - cannot be staff-only meeting (default: false)",
  requirePortalCancelReason: "Require patients to provide a reason when canceling from portal (default: false)",
  allowGroupReschedule: "Allow rescheduling even when there are multiple attendees (e.g., patient + caregiver)",
  preventRescheduleMinutesInAdvance: "Block rescheduling within X minutes before the appointment (e.g., 1440 for 24 hours)",
  preventCancelMinutesInAdvance: "Block cancellation within X minutes before the appointment (e.g., 1440 for 24 hours)",

  // Integrations - care plan automation
  productIds: "Array of Product IDs to link for payment processing (e.g., ['product-id-1', 'product-id-2'])",
  carePlanTasks: "Array of task IDs to automatically create and assign to patient after booking",
  carePlanForms: "Array of form IDs to automatically assign to patient after booking (e.g., pre-visit questionnaires)",
  carePlanContent: "Array of managed content record IDs to automatically share with patient after booking (e.g., educational materials)",
  carePlanFiles: "Array of file IDs to automatically share with patient after booking",

  // Visual customization
  color: "Calendar display color in hex format (e.g., '#4A90E2', '#50C878'). Helps staff visually identify appointment types.",
  image: "Template image URL or S3 key for visual branding in booking pages",

  // Organization
  tags: "Array of tags for categorizing, filtering, and organizing appointment types (e.g., ['consultation', 'new-patient', 'telehealth'])",
  archivedAt: "Archive timestamp as Date object, or empty string '' to unarchive. Archived templates are hidden but not deleted.",

  // External system integrations
  dontSyncToElation: "Skip syncing appointments of this type to Elation EHR (default: false)",
  dontSyncToCanvas: "Skip syncing appointments of this type to Canvas EHR (default: false)",
  sendIcsEmail: "Send calendar ICS file attachment via email for calendar import (default: false)",
  createAndBookAthenaSlot: "Automatically create and book slot in Athena EHR when appointment is booked (default: false)",

  // Canvas EHR specific
  canvasCoding: "Canvas FHIR appointment type coding: { system: string, code: string, display: string }. Maps appointment to Canvas appointment type.",
  canvasReasonCoding: "Canvas FHIR reason coding: { system: string, code: string, display: string }. Maps appointment reason to Canvas.",

  // Healthie specific
  matchToHealthieTemplate: "Automatically match and sync to corresponding Healthie appointment template (default: false)",
  dontAutoSyncPatientToHealthie: "Skip automatic patient sync to Healthie when booking this appointment type (default: false)",

  // Athena specific
  athenaDepartmentId: "Athena department ID for appointments of this type",
  generateAthenaTelehealthLink: "Generate Athena telehealth link when booking video appointments (default: false)",
  athenaTypeId: "Athena appointment type ID for searching available slots (default booking type)",
  athenaBookingTypeId: "Athena appointment type ID for booking (if different from search type)",

  // Healthie billing
  healthieInsuranceBillingEnabled: "Enable insurance billing in Healthie for appointments of this type (default: false)",

  // Advanced settings
  restrictedByState: "Restrict booking based on patient's state (for licensing compliance) (default: false)",
  enableSelfScheduling: "DEPRECATED - Use AppointmentBookingPage instead. Enable self-scheduling for this template.",
  replaceHostOnReschedule: "When enabled, replaces previous host(s) with the new host during reschedule (default: false)",
} as const;

// VideoIntegrationType enum
export const VIDEO_INTEGRATION_TYPES = ['Zoom', 'No Integration'] as const;

// CalendarEventReminderType enum
export const CALENDAR_EVENT_REMINDER_TYPES = [
  'webhook',
  'add-to-journey',
  'Remove From Journey',
  'user-notification',
  'enduser-notification',
  'create-ticket',
] as const;

// Notification channel types
export const NOTIFICATION_CHANNEL_TYPES = ['Email', 'SMS'] as const;

/**
 * Helper to build JSON Schema properties object from constants
 * @param isUpdate - Whether this is for an update schema (affects required fields)
 * @returns JSON Schema properties object
 */
export const buildCalendarEventTemplateProperties = (isUpdate = false) => ({
  title: {
    type: "string" as const,
    description: CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.title,
  },
  durationInMinutes: {
    type: "number" as const,
    description: CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.durationInMinutes,
  },
  type: {
    type: "string" as const,
    description: CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.type,
  },
  displayTitle: {
    type: "string" as const,
    description: CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.displayTitle,
  },
  displayDescription: {
    type: "string" as const,
    description: CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.displayDescription,
  },
  description: {
    type: "string" as const,
    description: CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.description,
  },
  instructions: {
    type: "string" as const,
    description: CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.instructions,
  },
  apiOnly: {
    type: "boolean" as const,
    description: CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.apiOnly,
  },
  bufferStartMinutes: {
    type: "number" as const,
    description: CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.bufferStartMinutes,
  },
  bufferEndMinutes: {
    type: "number" as const,
    description: CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.bufferEndMinutes,
  },
  enduserAttendeeLimit: {
    type: "number" as const,
    description: CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.enduserAttendeeLimit,
  },
  enableVideoCall: {
    type: "boolean" as const,
    description: CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.enableVideoCall,
  },
  videoIntegration: {
    type: "string" as const,
    enum: VIDEO_INTEGRATION_TYPES,
    description: CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.videoIntegration,
  },
  generateZoomLinkWhenBooked: {
    type: "boolean" as const,
    description: CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.generateZoomLinkWhenBooked,
  },
  useUserURL: {
    type: "boolean" as const,
    description: CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.useUserURL,
  },
  reminders: {
    type: "array" as const,
    description: CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.reminders,
    items: {
      type: "object" as const,
      // CalendarEventReminder is a union type - accept object with type, info, msBeforeStartTime
    },
  },
  confirmationEmailDisabled: {
    type: "boolean" as const,
    description: CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.confirmationEmailDisabled,
  },
  confirmationSMSDisabled: {
    type: "boolean" as const,
    description: CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.confirmationSMSDisabled,
  },
  publicRead: {
    type: "boolean" as const,
    description: CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.publicRead,
  },
  portalSettings: {
    type: "object" as const,
    description: CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.portalSettings,
  },
  requiresEnduser: {
    type: "boolean" as const,
    description: CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.requiresEnduser,
  },
  requirePortalCancelReason: {
    type: "boolean" as const,
    description: CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.requirePortalCancelReason,
  },
  allowGroupReschedule: {
    type: "boolean" as const,
    description: CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.allowGroupReschedule,
  },
  preventRescheduleMinutesInAdvance: {
    type: "number" as const,
    description: CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.preventRescheduleMinutesInAdvance,
  },
  preventCancelMinutesInAdvance: {
    type: "number" as const,
    description: CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.preventCancelMinutesInAdvance,
  },
  productIds: {
    type: "array" as const,
    description: CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.productIds,
    items: {
      type: "string" as const,
    },
  },
  carePlanTasks: {
    type: "array" as const,
    description: CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.carePlanTasks,
    items: {
      type: "string" as const,
    },
  },
  carePlanForms: {
    type: "array" as const,
    description: CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.carePlanForms,
    items: {
      type: "string" as const,
    },
  },
  carePlanContent: {
    type: "array" as const,
    description: CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.carePlanContent,
    items: {
      type: "string" as const,
    },
  },
  carePlanFiles: {
    type: "array" as const,
    description: CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.carePlanFiles,
    items: {
      type: "string" as const,
    },
  },
  color: {
    type: "string" as const,
    description: CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.color,
  },
  image: {
    type: "string" as const,
    description: CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.image,
  },
  tags: {
    type: "array" as const,
    description: CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.tags,
    items: {
      type: "string" as const,
    },
  },
  archivedAt: {
    type: "string" as const,
    description: CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.archivedAt,
  },
  dontSyncToElation: {
    type: "boolean" as const,
    description: CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.dontSyncToElation,
  },
  dontSyncToCanvas: {
    type: "boolean" as const,
    description: CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.dontSyncToCanvas,
  },
  sendIcsEmail: {
    type: "boolean" as const,
    description: CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.sendIcsEmail,
  },
  createAndBookAthenaSlot: {
    type: "boolean" as const,
    description: CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.createAndBookAthenaSlot,
  },
  canvasCoding: {
    type: "object" as const,
    description: CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.canvasCoding,
    properties: {
      system: { type: "string" as const },
      code: { type: "string" as const },
      display: { type: "string" as const },
    },
  },
  canvasReasonCoding: {
    type: "object" as const,
    description: CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.canvasReasonCoding,
    properties: {
      system: { type: "string" as const },
      code: { type: "string" as const },
      display: { type: "string" as const },
    },
  },
  matchToHealthieTemplate: {
    type: "boolean" as const,
    description: CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.matchToHealthieTemplate,
  },
  dontAutoSyncPatientToHealthie: {
    type: "boolean" as const,
    description: CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.dontAutoSyncPatientToHealthie,
  },
  athenaDepartmentId: {
    type: "string" as const,
    description: CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.athenaDepartmentId,
  },
  generateAthenaTelehealthLink: {
    type: "boolean" as const,
    description: CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.generateAthenaTelehealthLink,
  },
  athenaTypeId: {
    type: "string" as const,
    description: CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.athenaTypeId,
  },
  athenaBookingTypeId: {
    type: "string" as const,
    description: CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.athenaBookingTypeId,
  },
  healthieInsuranceBillingEnabled: {
    type: "boolean" as const,
    description: CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.healthieInsuranceBillingEnabled,
  },
  restrictedByState: {
    type: "boolean" as const,
    description: CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.restrictedByState,
  },
  enableSelfScheduling: {
    type: "boolean" as const,
    description: CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.enableSelfScheduling,
  },
  replaceHostOnReschedule: {
    type: "boolean" as const,
    description: CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.replaceHostOnReschedule,
  },
});

// CalendarEventTemplate Zod schemas (internal - not exported)
const calendarEventTemplateDataSchema = z.object({
  title: z.string().describe(CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.title),
  durationInMinutes: z.number().describe(CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.durationInMinutes),
  type: z.string().optional().describe(CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.type),
  displayTitle: z.string().optional().describe(CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.displayTitle),
  displayDescription: z.string().optional().describe(CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.displayDescription),
  description: z.string().optional().describe(CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.description),
  instructions: z.string().optional().describe(CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.instructions),
  apiOnly: z.boolean().optional().describe(CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.apiOnly),
  bufferStartMinutes: z.number().optional().describe(CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.bufferStartMinutes),
  bufferEndMinutes: z.number().optional().describe(CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.bufferEndMinutes),
  enduserAttendeeLimit: z.number().optional().describe(CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.enduserAttendeeLimit),
  enableVideoCall: z.boolean().optional().describe(CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.enableVideoCall),
  videoIntegration: z.enum(VIDEO_INTEGRATION_TYPES).optional().describe(CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.videoIntegration),
  generateZoomLinkWhenBooked: z.boolean().optional().describe(CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.generateZoomLinkWhenBooked),
  useUserURL: z.boolean().optional().describe(CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.useUserURL),
  reminders: z.array(z.record(z.any())).optional().describe(CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.reminders),
  confirmationEmailDisabled: z.boolean().optional().describe(CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.confirmationEmailDisabled),
  confirmationSMSDisabled: z.boolean().optional().describe(CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.confirmationSMSDisabled),
  publicRead: z.boolean().optional().describe(CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.publicRead),
  portalSettings: z.record(z.any()).optional().describe(CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.portalSettings),
  requiresEnduser: z.boolean().optional().describe(CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.requiresEnduser),
  requirePortalCancelReason: z.boolean().optional().describe(CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.requirePortalCancelReason),
  allowGroupReschedule: z.boolean().optional().describe(CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.allowGroupReschedule),
  preventRescheduleMinutesInAdvance: z.number().optional().describe(CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.preventRescheduleMinutesInAdvance),
  preventCancelMinutesInAdvance: z.number().optional().describe(CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.preventCancelMinutesInAdvance),
  productIds: z.array(z.string()).optional().describe(CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.productIds),
  carePlanTasks: z.array(z.string()).optional().describe(CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.carePlanTasks),
  carePlanForms: z.array(z.string()).optional().describe(CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.carePlanForms),
  carePlanContent: z.array(z.string()).optional().describe(CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.carePlanContent),
  carePlanFiles: z.array(z.string()).optional().describe(CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.carePlanFiles),
  color: z.string().optional().describe(CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.color),
  image: z.string().optional().describe(CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.image),
  tags: z.array(z.string()).optional().describe(CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.tags),
  archivedAt: z.union([z.date(), z.literal('')]).optional().describe(CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.archivedAt),
  dontSyncToElation: z.boolean().optional().describe(CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.dontSyncToElation),
  dontSyncToCanvas: z.boolean().optional().describe(CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.dontSyncToCanvas),
  sendIcsEmail: z.boolean().optional().describe(CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.sendIcsEmail),
  createAndBookAthenaSlot: z.boolean().optional().describe(CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.createAndBookAthenaSlot),
  canvasCoding: z.object({
    system: z.string(),
    code: z.string(),
    display: z.string(),
  }).optional().describe(CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.canvasCoding),
  canvasReasonCoding: z.object({
    system: z.string(),
    code: z.string(),
    display: z.string(),
  }).optional().describe(CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.canvasReasonCoding),
  matchToHealthieTemplate: z.boolean().optional().describe(CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.matchToHealthieTemplate),
  dontAutoSyncPatientToHealthie: z.boolean().optional().describe(CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.dontAutoSyncPatientToHealthie),
  athenaDepartmentId: z.string().optional().describe(CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.athenaDepartmentId),
  generateAthenaTelehealthLink: z.boolean().optional().describe(CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.generateAthenaTelehealthLink),
  athenaTypeId: z.string().optional().describe(CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.athenaTypeId),
  athenaBookingTypeId: z.string().optional().describe(CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.athenaBookingTypeId),
  healthieInsuranceBillingEnabled: z.boolean().optional().describe(CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.healthieInsuranceBillingEnabled),
  restrictedByState: z.boolean().optional().describe(CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.restrictedByState),
  enableSelfScheduling: z.boolean().optional().describe(CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.enableSelfScheduling),
  replaceHostOnReschedule: z.boolean().optional().describe(CALENDAR_EVENT_TEMPLATE_DESCRIPTIONS.replaceHostOnReschedule),
});

const calendarEventTemplateUpdatesSchema = calendarEventTemplateDataSchema.partial();

// Export wrapped schemas for registry
export const calendarEventTemplateSchemas = {
  create: createCreateOneSchema(calendarEventTemplateDataSchema),
  update: createUpdateOneSchema(calendarEventTemplateUpdatesSchema),
};

// Export tool definitions
export const calendarEventTemplateTools = [
  {
    name: "calendar_event_templates_create_one",
    description: "Create a new calendar event template (appointment type) in Tellescope. Returns the created template object with its ID.",
    inputSchema: {
      type: "object",
      properties: {
        data: {
          type: "object",
          description: "Calendar event template creation data",
          properties: buildCalendarEventTemplateProperties(false),
          required: ["title", "durationInMinutes"],
        },
      },
      required: ["data"],
    },
  },
  {
    name: "calendar_event_templates_update_one",
    description: "Update an existing calendar event template by ID in Tellescope. Returns the updated template object.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "The unique ID of the calendar event template to update",
        },
        updates: {
          type: "object",
          description: "Calendar event template update data - all fields are optional",
          properties: buildCalendarEventTemplateProperties(true),
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
