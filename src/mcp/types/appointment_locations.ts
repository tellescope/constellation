import { z } from "zod";
import { createCreateOneSchema, createUpdateOneSchema } from "./_utilities";

// ============================================================================
// Constants
// ============================================================================

export const APPOINTMENT_LOCATION_DESCRIPTIONS = {
  title: "The name of the appointment location (e.g., 'Main Office', 'Telehealth', 'Downtown Clinic')",
  address: "Street address of the physical location",
  city: "City where the location is situated",
  state: "State where the location is situated (2-letter code recommended, e.g., 'CA', 'NY')",
  zipCode: "ZIP code or postal code for the location",
  phone: "Contact phone number for the location",
  timezone: "IANA timezone identifier for the location (e.g., 'America/New_York', 'America/Los_Angeles'). Critical for accurate appointment scheduling across time zones.",
  canvasLocationId: "Canvas EHR location ID for integration/sync purposes",
  healthieContactType: "Healthie contact type identifier for integration",
  healthieLocationId: "Healthie location ID for integration/sync purposes",
  healthieUseZoom: "Whether to use Zoom for appointments at this Healthie-integrated location",
  instructions: "Detailed instructions for patients (e.g., parking info, check-in process, entrance details, virtual meeting link instructions)",
  tags: "Array of tags for categorizing and filtering locations (e.g., ['physical', 'primary-office'], ['virtual', 'telehealth'])",
} as const;

// ============================================================================
// Helper Function
// ============================================================================

export const buildAppointmentLocationProperties = (isUpdate = false) => ({
  title: {
    type: "string" as const,
    description: APPOINTMENT_LOCATION_DESCRIPTIONS.title,
  },
  address: {
    type: "string" as const,
    description: APPOINTMENT_LOCATION_DESCRIPTIONS.address,
  },
  city: {
    type: "string" as const,
    description: APPOINTMENT_LOCATION_DESCRIPTIONS.city,
  },
  state: {
    type: "string" as const,
    description: APPOINTMENT_LOCATION_DESCRIPTIONS.state,
  },
  zipCode: {
    type: "string" as const,
    description: APPOINTMENT_LOCATION_DESCRIPTIONS.zipCode,
  },
  phone: {
    type: "string" as const,
    description: APPOINTMENT_LOCATION_DESCRIPTIONS.phone,
  },
  timezone: {
    type: "string" as const,
    description: APPOINTMENT_LOCATION_DESCRIPTIONS.timezone,
  },
  canvasLocationId: {
    type: "string" as const,
    description: APPOINTMENT_LOCATION_DESCRIPTIONS.canvasLocationId,
  },
  healthieContactType: {
    type: "string" as const,
    description: APPOINTMENT_LOCATION_DESCRIPTIONS.healthieContactType,
  },
  healthieLocationId: {
    type: "string" as const,
    description: APPOINTMENT_LOCATION_DESCRIPTIONS.healthieLocationId,
  },
  healthieUseZoom: {
    type: "boolean" as const,
    description: APPOINTMENT_LOCATION_DESCRIPTIONS.healthieUseZoom,
  },
  instructions: {
    type: "string" as const,
    description: APPOINTMENT_LOCATION_DESCRIPTIONS.instructions,
  },
  tags: {
    type: "array" as const,
    items: {
      type: "string" as const,
    },
    description: APPOINTMENT_LOCATION_DESCRIPTIONS.tags,
  },
});

// ============================================================================
// Zod Schemas (Internal)
// ============================================================================

const appointmentLocationDataSchema = z.object({
  title: z.string().describe(APPOINTMENT_LOCATION_DESCRIPTIONS.title),
  address: z.string().optional().describe(APPOINTMENT_LOCATION_DESCRIPTIONS.address),
  city: z.string().optional().describe(APPOINTMENT_LOCATION_DESCRIPTIONS.city),
  state: z.string().optional().describe(APPOINTMENT_LOCATION_DESCRIPTIONS.state),
  zipCode: z.string().optional().describe(APPOINTMENT_LOCATION_DESCRIPTIONS.zipCode),
  phone: z.string().optional().describe(APPOINTMENT_LOCATION_DESCRIPTIONS.phone),
  timezone: z.string().optional().describe(APPOINTMENT_LOCATION_DESCRIPTIONS.timezone),
  canvasLocationId: z.string().optional().describe(APPOINTMENT_LOCATION_DESCRIPTIONS.canvasLocationId),
  healthieContactType: z.string().optional().describe(APPOINTMENT_LOCATION_DESCRIPTIONS.healthieContactType),
  healthieLocationId: z.string().optional().describe(APPOINTMENT_LOCATION_DESCRIPTIONS.healthieLocationId),
  healthieUseZoom: z.boolean().optional().describe(APPOINTMENT_LOCATION_DESCRIPTIONS.healthieUseZoom),
  instructions: z.string().optional().describe(APPOINTMENT_LOCATION_DESCRIPTIONS.instructions),
  tags: z.array(z.string()).optional().describe(APPOINTMENT_LOCATION_DESCRIPTIONS.tags),
});

const appointmentLocationUpdatesSchema = appointmentLocationDataSchema.partial();

// ============================================================================
// Wrapped Schemas for Registry
// ============================================================================

export const appointmentLocationSchemas = {
  create: createCreateOneSchema(appointmentLocationDataSchema),
  update: createUpdateOneSchema(appointmentLocationUpdatesSchema),
};

// ============================================================================
// Tool Definitions
// ============================================================================

export const appointmentLocationTools = [
  {
    name: "appointment_locations_create_one",
    description: "Create a new appointment location in Tellescope. Returns the created location object with its ID. Locations can be physical offices or virtual/telehealth locations.",
    inputSchema: {
      type: "object",
      properties: {
        data: {
          type: "object",
          description: "Appointment location creation data",
          properties: buildAppointmentLocationProperties(false),
          required: ["title"],
        },
      },
      required: ["data"],
    },
  },
  {
    name: "appointment_locations_update_one",
    description: "Update an existing appointment location by ID in Tellescope. Returns the updated location object.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "The unique ID of the appointment location to update",
        },
        updates: {
          type: "object",
          description: "Appointment location update data - all fields are optional",
          properties: buildAppointmentLocationProperties(true),
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
