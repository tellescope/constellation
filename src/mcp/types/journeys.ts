import { z } from "zod";
import { createCreateOneSchema, createUpdateOneSchema } from "./_utilities";

// ============================================================================
// Constants
// ============================================================================

/**
 * Field descriptions for Journey properties
 */
export const JOURNEY_DESCRIPTIONS = {
  title: "The title/name of the journey for internal reference",
  description: "Optional description providing context about the journey's purpose and workflow",
  onIncomingEnduserCommunication: "Action to take when enduser sends a communication while in this journey. 'Remove' removes them from the journey, empty string '' does nothing.",
  tags: "Array of tags for categorizing and filtering journeys (e.g., ['onboarding', 'high-priority'])",
  archivedAt: "Timestamp when the journey was archived. Empty string '' means not archived.",
} as const;

/**
 * Valid actions for incoming enduser communication
 */
export const JOURNEY_COMMUNICATION_ACTIONS = ["Remove", ""] as const;

// ============================================================================
// Helper Function
// ============================================================================

/**
 * Builds JSON Schema properties for Journey fields
 * @param isUpdate - Whether this is for an update operation (all fields optional)
 */
export const buildJourneyProperties = (isUpdate = false) => ({
  title: {
    type: "string" as const,
    description: JOURNEY_DESCRIPTIONS.title,
  },
  description: {
    type: "string" as const,
    description: JOURNEY_DESCRIPTIONS.description,
  },
  onIncomingEnduserCommunication: {
    type: "string" as const,
    enum: JOURNEY_COMMUNICATION_ACTIONS,
    description: JOURNEY_DESCRIPTIONS.onIncomingEnduserCommunication,
  },
  tags: {
    type: "array" as const,
    items: { type: "string" as const },
    description: JOURNEY_DESCRIPTIONS.tags,
  },
  archivedAt: {
    type: "string" as const,
    description: JOURNEY_DESCRIPTIONS.archivedAt,
  },
});

// ============================================================================
// Zod Schemas (Internal)
// ============================================================================

/**
 * Zod schema for Journey creation
 */
const journeyDataSchema = z.object({
  title: z.string().describe(JOURNEY_DESCRIPTIONS.title),
  description: z.string().optional().describe(JOURNEY_DESCRIPTIONS.description),
  onIncomingEnduserCommunication: z.enum(JOURNEY_COMMUNICATION_ACTIONS).optional().describe(JOURNEY_DESCRIPTIONS.onIncomingEnduserCommunication),
  tags: z.array(z.string()).optional().describe(JOURNEY_DESCRIPTIONS.tags),
  archivedAt: z.string().optional().describe(JOURNEY_DESCRIPTIONS.archivedAt),
});

/**
 * Zod schema for Journey updates (all fields optional)
 */
const journeyUpdatesSchema = journeyDataSchema.partial();

// ============================================================================
// Exported Schemas for Registry
// ============================================================================

export const journeySchemas = {
  create: createCreateOneSchema(journeyDataSchema),
  update: createUpdateOneSchema(journeyUpdatesSchema),
};

// ============================================================================
// Tool Definitions
// ============================================================================

export const journeyTools = [
  {
    name: "journeys_create_one",
    description: "Create a new journey (workflow) in Tellescope. Returns the created journey object with its ID.",
    inputSchema: {
      type: "object",
      properties: {
        data: {
          type: "object",
          description: "Journey creation data",
          properties: buildJourneyProperties(false),
          required: ["title"],
        },
      },
      required: ["data"],
    },
  },
  {
    name: "journeys_update_one",
    description: "Update an existing journey by ID in Tellescope. Returns the updated journey object.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "The unique ID of the journey to update",
        },
        updates: {
          type: "object",
          description: "Journey update data - all fields are optional",
          properties: buildJourneyProperties(true),
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
