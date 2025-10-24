import { z } from "zod";
import { createCreateOneSchema, createUpdateOneSchema } from "./_utilities";

// AppointmentBookingPage field descriptions (reusable across create and update schemas)
export const APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS = {
  title: "The title/name of the booking page shown to patients during the booking process",
  locationIds: "Array of AppointmentLocation IDs that patients can book appointments at. These locations will be available for selection during booking (e.g., ['location-id-1', 'location-id-2'])",
  calendarEventTemplateIds: "Array of CalendarEventTemplate IDs (appointment types) available for booking on this page (e.g., ['template-id-1', 'template-id-2'])",

  // Availability window
  startDate: "Earliest date patients can book appointments (Date object). If not set, booking is available immediately.",
  endDate: "Latest date patients can book appointments (Date object). If not set, booking is available indefinitely.",
  hoursBeforeBookingAllowed: "Minimum hours in advance required before an appointment can be booked (e.g., 24 for 24-hour advance notice). Use empty string '' for no restriction.",

  // Visual customization
  primaryColor: "Primary brand color in hex format (e.g., '#4A90E2'). Used for buttons, headers, and primary UI elements.",
  secondaryColor: "Secondary brand color in hex format (e.g., '#50C878'). Used for accents and secondary UI elements.",
  backgroundColor: "Background color in hex format (e.g., '#FFFFFF'). Applied to the booking page background.",
  fontFamily: "Font family name (e.g., 'Roboto', 'Open Sans', 'Lato'). Must be a web-safe font or loaded via fontURL.",
  fontFace: "CSS @font-face rule for custom fonts. Defines font-family, src, font-weight, etc.",
  fontURL: "URL to load custom font CSS file (e.g., Google Fonts URL: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700')",

  // Terms and legal
  terms: `Array of terms and legal links shown during booking. Each term has a title and link.

Structure:
[
  {
    title: string,  // Link text (e.g., "Privacy Policy", "Terms of Service")
    link: string    // URL to the document (e.g., "https://example.com/privacy")
  }
]

Example:
[
  { title: "Privacy Policy", link: "https://example.com/privacy" },
  { title: "Cancellation Policy", link: "https://example.com/cancellation" }
]`,

  topLogo: "URL or S3 key for logo image displayed at the top of the booking page",

  // Intake page customization
  intakeTitle: "Custom title for the intake/information collection step (default: 'Tell us about yourself')",
  intakeDescription: "Custom description text shown on the intake step, explaining what information is needed and why",

  // Thank you page customization
  thankYouRedirectURL: "URL to redirect to after booking completion (e.g., 'https://example.com/booking-confirmed'). If not set, shows default thank you page.",
  thankYouTitle: "Custom title for the thank you page after booking (default: 'Thank you for booking!')",
  thankYouDescription: "Custom message shown on thank you page after booking (e.g., 'We'll send you a confirmation email shortly.')",
  thankYouHeaderImageURL: "URL or S3 key for header image on thank you page",
  thankYouMainImageURL: "URL or S3 key for main/featured image on thank you page",

  // Analytics
  ga4measurementId: "Google Analytics 4 measurement ID for tracking bookings (e.g., 'G-XXXXXXXXXX')",
  gtmTag: "Google Tag Manager container ID for advanced tracking (e.g., 'GTM-XXXXXXX')",

  // Visibility and access control
  hiddenFromPortal: "Hide this booking page from the patient portal (default: false). Useful for staff-only or special-purpose booking pages.",
  limitedToCareTeam: "Restrict booking to patients who have an assigned care team member (default: false)",
  limitedByState: "Restrict booking based on patient's state matching provider's licensed states (default: false)",
  limitedByTagsPortal: "Array of patient tags required to access this booking page (e.g., ['vip', 'premium']). Patient must have at least one matching tag.",

  // Booking behavior
  requireLocationSelection: "Require patients to select a location even if only one location is available (default: false)",
  collectReason: "Whether to collect appointment reason from patient: 'Do Not Collect' (skip), 'Optional' (allow but don't require), 'Required' (must provide reason)",

  // Template-specific restrictions
  restrictionsByTemplate: `Array of booking restrictions applied per appointment template. Allows fine-grained control over who can book specific appointment types.

Structure:
[
  {
    templateId: string,  // CalendarEventTemplate ID to apply restrictions to
    restrictions: {
      state?: boolean,           // Restrict by patient's state (licensing compliance)
      careTeam?: boolean,        // Restrict to patients with assigned care team
      tagsPortal?: string[],     // Patient tags required (e.g., ['new-patient', 'established'])
      hoursBefore?: number | '', // Min hours in advance for this template
      hoursAfter?: number | '',  // Max hours in future for this template
      shouldOpenJoinLink?: boolean // Auto-open video link when booking telehealth
    }
  }
]

Example:
[
  {
    templateId: 'initial-consult-id',
    restrictions: {
      state: true,
      hoursBefore: 48,
      tagsPortal: ['new-patient']
    }
  },
  {
    templateId: 'follow-up-id',
    restrictions: {
      careTeam: true,
      hoursBefore: 24
    }
  }
]`,

  // Multi-booking settings
  publicMulti: "Allow multiple patients to book the same appointment slot simultaneously (for group appointments/events). Default: false",
  publicUserTags: "Array of user (provider) tags. Only providers with these tags will show available slots (e.g., ['therapist', 'new-patient-provider'])",
  publicUserFilterTags: "Array of user tags for additional filtering. Narrows down available providers beyond publicUserTags.",

  // UI customization
  appointmentSlotsMaxHeight: "Maximum height in pixels for the appointment slots display area (enables scrolling for long lists). Example: 400",
  calendarTitleText: "Custom text for the calendar heading (default: 'Pick a date and time for your visit'). Use empty string '' to hide the heading.",
  emailFieldBehavior: "Email field requirement level: 'required' (must provide), 'optional' (can provide), 'hidden' (don't show email field)",

  // Related contacts
  includeRelatedContactTypes: "Array of related contact types to include in booking (e.g., ['Parent', 'Guardian', 'Emergency Contact']). Allows booking on behalf of family members.",

  // Archival
  archivedAt: "Archive timestamp as Date object, or empty string '' to unarchive. Archived booking pages are hidden but not deleted.",

  // Advanced settings
  dontRestrictRescheduleToOriginalHost: "Allow rescheduling with any available provider, not just the original appointment host (default: false)",
} as const;

// CollectReason enum
export const COLLECT_REASON_OPTIONS = ['Do Not Collect', 'Optional', 'Required'] as const;

// EmailFieldBehavior enum
export const EMAIL_FIELD_BEHAVIOR_OPTIONS = ['required', 'optional', 'hidden'] as const;

/**
 * Helper to build JSON Schema properties object from constants
 * @param isUpdate - Whether this is for an update schema (affects required fields)
 * @returns JSON Schema properties object
 */
export const buildAppointmentBookingPageProperties = (isUpdate = false) => ({
  title: {
    type: "string" as const,
    description: APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.title,
  },
  locationIds: {
    type: "array" as const,
    description: APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.locationIds,
    items: {
      type: "string" as const,
    },
  },
  calendarEventTemplateIds: {
    type: "array" as const,
    description: APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.calendarEventTemplateIds,
    items: {
      type: "string" as const,
    },
  },
  startDate: {
    type: "string" as const,
    description: APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.startDate,
  },
  endDate: {
    type: "string" as const,
    description: APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.endDate,
  },
  hoursBeforeBookingAllowed: {
    description: APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.hoursBeforeBookingAllowed,
    // Union type: number | '' - accept either
  },
  primaryColor: {
    type: "string" as const,
    description: APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.primaryColor,
  },
  secondaryColor: {
    type: "string" as const,
    description: APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.secondaryColor,
  },
  backgroundColor: {
    type: "string" as const,
    description: APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.backgroundColor,
  },
  fontFamily: {
    type: "string" as const,
    description: APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.fontFamily,
  },
  fontFace: {
    type: "string" as const,
    description: APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.fontFace,
  },
  fontURL: {
    type: "string" as const,
    description: APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.fontURL,
  },
  terms: {
    type: "array" as const,
    description: APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.terms,
    items: {
      type: "object" as const,
      properties: {
        title: { type: "string" as const },
        link: { type: "string" as const },
      },
      required: ["title", "link"],
    },
  },
  topLogo: {
    type: "string" as const,
    description: APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.topLogo,
  },
  intakeTitle: {
    type: "string" as const,
    description: APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.intakeTitle,
  },
  intakeDescription: {
    type: "string" as const,
    description: APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.intakeDescription,
  },
  thankYouRedirectURL: {
    type: "string" as const,
    description: APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.thankYouRedirectURL,
  },
  thankYouTitle: {
    type: "string" as const,
    description: APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.thankYouTitle,
  },
  thankYouDescription: {
    type: "string" as const,
    description: APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.thankYouDescription,
  },
  thankYouHeaderImageURL: {
    type: "string" as const,
    description: APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.thankYouHeaderImageURL,
  },
  thankYouMainImageURL: {
    type: "string" as const,
    description: APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.thankYouMainImageURL,
  },
  ga4measurementId: {
    type: "string" as const,
    description: APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.ga4measurementId,
  },
  gtmTag: {
    type: "string" as const,
    description: APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.gtmTag,
  },
  hiddenFromPortal: {
    type: "boolean" as const,
    description: APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.hiddenFromPortal,
  },
  limitedToCareTeam: {
    type: "boolean" as const,
    description: APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.limitedToCareTeam,
  },
  limitedByState: {
    type: "boolean" as const,
    description: APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.limitedByState,
  },
  limitedByTagsPortal: {
    type: "array" as const,
    description: APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.limitedByTagsPortal,
    items: {
      type: "string" as const,
    },
  },
  requireLocationSelection: {
    type: "boolean" as const,
    description: APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.requireLocationSelection,
  },
  collectReason: {
    type: "string" as const,
    enum: COLLECT_REASON_OPTIONS,
    description: APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.collectReason,
  },
  restrictionsByTemplate: {
    type: "array" as const,
    description: APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.restrictionsByTemplate,
    items: {
      type: "object" as const,
      properties: {
        templateId: { type: "string" as const },
        restrictions: {
          type: "object" as const,
          properties: {
            state: { type: "boolean" as const },
            careTeam: { type: "boolean" as const },
            tagsPortal: {
              type: "array" as const,
              items: { type: "string" as const },
            },
            hoursBefore: {}, // number | ''
            hoursAfter: {}, // number | ''
            shouldOpenJoinLink: { type: "boolean" as const },
          },
        },
      },
      required: ["templateId", "restrictions"],
    },
  },
  publicMulti: {
    type: "boolean" as const,
    description: APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.publicMulti,
  },
  publicUserTags: {
    type: "array" as const,
    description: APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.publicUserTags,
    items: {
      type: "string" as const,
    },
  },
  publicUserFilterTags: {
    type: "array" as const,
    description: APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.publicUserFilterTags,
    items: {
      type: "string" as const,
    },
  },
  appointmentSlotsMaxHeight: {
    type: "number" as const,
    description: APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.appointmentSlotsMaxHeight,
  },
  calendarTitleText: {
    type: "string" as const,
    description: APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.calendarTitleText,
  },
  emailFieldBehavior: {
    type: "string" as const,
    enum: EMAIL_FIELD_BEHAVIOR_OPTIONS,
    description: APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.emailFieldBehavior,
  },
  includeRelatedContactTypes: {
    type: "array" as const,
    description: APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.includeRelatedContactTypes,
    items: {
      type: "string" as const,
    },
  },
  archivedAt: {
    type: "string" as const,
    description: APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.archivedAt,
  },
  dontRestrictRescheduleToOriginalHost: {
    type: "boolean" as const,
    description: APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.dontRestrictRescheduleToOriginalHost,
  },
});

// AppointmentBookingPage Zod schemas (internal - not exported)
const appointmentBookingPageDataSchema = z.object({
  title: z.string().describe(APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.title),
  locationIds: z.array(z.string()).describe(APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.locationIds),
  calendarEventTemplateIds: z.array(z.string()).describe(APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.calendarEventTemplateIds),
  startDate: z.date().optional().describe(APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.startDate),
  endDate: z.date().optional().describe(APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.endDate),
  hoursBeforeBookingAllowed: z.union([z.number(), z.literal('')]).optional().describe(APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.hoursBeforeBookingAllowed),
  primaryColor: z.string().optional().describe(APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.primaryColor),
  secondaryColor: z.string().optional().describe(APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.secondaryColor),
  backgroundColor: z.string().optional().describe(APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.backgroundColor),
  fontFamily: z.string().optional().describe(APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.fontFamily),
  fontFace: z.string().optional().describe(APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.fontFace),
  fontURL: z.string().optional().describe(APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.fontURL),
  terms: z.array(z.object({
    title: z.string(),
    link: z.string(),
  })).optional().describe(APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.terms),
  topLogo: z.string().optional().describe(APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.topLogo),
  intakeTitle: z.string().optional().describe(APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.intakeTitle),
  intakeDescription: z.string().optional().describe(APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.intakeDescription),
  thankYouRedirectURL: z.string().optional().describe(APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.thankYouRedirectURL),
  thankYouTitle: z.string().optional().describe(APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.thankYouTitle),
  thankYouDescription: z.string().optional().describe(APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.thankYouDescription),
  thankYouHeaderImageURL: z.string().optional().describe(APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.thankYouHeaderImageURL),
  thankYouMainImageURL: z.string().optional().describe(APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.thankYouMainImageURL),
  ga4measurementId: z.string().optional().describe(APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.ga4measurementId),
  gtmTag: z.string().optional().describe(APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.gtmTag),
  hiddenFromPortal: z.boolean().optional().describe(APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.hiddenFromPortal),
  limitedToCareTeam: z.boolean().optional().describe(APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.limitedToCareTeam),
  limitedByState: z.boolean().optional().describe(APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.limitedByState),
  limitedByTagsPortal: z.array(z.string()).optional().describe(APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.limitedByTagsPortal),
  requireLocationSelection: z.boolean().optional().describe(APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.requireLocationSelection),
  collectReason: z.enum(COLLECT_REASON_OPTIONS).optional().describe(APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.collectReason),
  restrictionsByTemplate: z.array(z.object({
    templateId: z.string(),
    restrictions: z.object({
      state: z.boolean().optional(),
      careTeam: z.boolean().optional(),
      tagsPortal: z.array(z.string()).optional(),
      hoursBefore: z.union([z.number(), z.literal('')]).optional(),
      hoursAfter: z.union([z.number(), z.literal('')]).optional(),
      shouldOpenJoinLink: z.boolean().optional(),
    }),
  })).optional().describe(APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.restrictionsByTemplate),
  publicMulti: z.boolean().optional().describe(APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.publicMulti),
  publicUserTags: z.array(z.string()).optional().describe(APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.publicUserTags),
  publicUserFilterTags: z.array(z.string()).optional().describe(APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.publicUserFilterTags),
  appointmentSlotsMaxHeight: z.number().optional().describe(APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.appointmentSlotsMaxHeight),
  calendarTitleText: z.string().optional().describe(APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.calendarTitleText),
  emailFieldBehavior: z.enum(EMAIL_FIELD_BEHAVIOR_OPTIONS).optional().describe(APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.emailFieldBehavior),
  includeRelatedContactTypes: z.array(z.string()).optional().describe(APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.includeRelatedContactTypes),
  archivedAt: z.union([z.date(), z.literal('')]).optional().describe(APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.archivedAt),
  dontRestrictRescheduleToOriginalHost: z.boolean().optional().describe(APPOINTMENT_BOOKING_PAGE_DESCRIPTIONS.dontRestrictRescheduleToOriginalHost),
});

const appointmentBookingPageUpdatesSchema = appointmentBookingPageDataSchema.partial();

// Export wrapped schemas for registry
export const appointmentBookingPageSchemas = {
  create: createCreateOneSchema(appointmentBookingPageDataSchema),
  update: createUpdateOneSchema(appointmentBookingPageUpdatesSchema),
};

// Export tool definitions
export const appointmentBookingPageTools = [
  {
    name: "appointment_booking_pages_create_one",
    description: "Create a new appointment booking page in Tellescope. Returns the created booking page object with its ID.",
    inputSchema: {
      type: "object",
      properties: {
        data: {
          type: "object",
          description: "Appointment booking page creation data",
          properties: buildAppointmentBookingPageProperties(false),
          required: ["title", "locationIds", "calendarEventTemplateIds"],
        },
      },
      required: ["data"],
    },
  },
  {
    name: "appointment_booking_pages_update_one",
    description: "Update an existing appointment booking page by ID in Tellescope. Returns the updated booking page object.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "The unique ID of the appointment booking page to update",
        },
        updates: {
          type: "object",
          description: "Appointment booking page update data - all fields are optional",
          properties: buildAppointmentBookingPageProperties(true),
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
