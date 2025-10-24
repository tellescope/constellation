import { z } from "zod";
import { createCreateOneSchema, createUpdateOneSchema } from "./_utilities";

// ============================================================================
// Constants - Single source of truth for descriptions and enums
// ============================================================================

export const MESSAGE_TEMPLATE_DESCRIPTIONS = {
  title: "The title/name of the template for internal reference",
  subject: "Email subject line. Supports template variables like {{enduser.fname}}, {{organization.name}}, {{sender.fname}}, etc.",
  message: "Plain text message content. Used as the plain text version for emails and the primary content for SMS/chat. Supports template variables.",
  html: "HTML email body for rich formatting. Should be mobile-optimized with inline CSS. Supports template variables. Use modern HTML5 structure with responsive design.",
  type: "Template type: 'enduser' (default, for patient-facing messages), 'Reply' (quick reply templates for staff), or 'team' (internal team messages)",
  mode: "Template editing mode: 'html' (raw HTML editing) or 'richtext' (WYSIWYG rich text editor). Determines how the template is edited in the UI.",
  isMarketing: "Whether this template is used for marketing communications (affects compliance and unsubscribe requirements)",
  forChannels: "Array of channel names this template is available for. Restricts where the template can be used (e.g., ['Email'], ['SMS'], ['Chat']).",
  forRoles: "Array of role names that can use this template. Restricts template visibility by user role (e.g., ['Provider', 'Care Coordinator']).",
  forEntityTypes: "Array of entity types this template applies to. Used for filtering templates by context (e.g., ['Enduser', 'Ticket']).",
  hideFromCompose: "Whether to hide this template from the compose UI. Useful for automated-only templates that shouldn't be manually selected.",
  tags: "Array of tags for categorizing and filtering templates (e.g., ['onboarding', 'appointment-reminder', '24h'])",
  archivedAt: "Timestamp when the template was archived. Set to empty string '' to unarchive. Archived templates are hidden from active use but preserved for historical reference.",
  mmsAttachmentURLs: "Array of attachment URLs for MMS messages. Used when sending multimedia messages via SMS/MMS channel.",
} as const;

export const MESSAGE_TEMPLATE_TYPES = ['enduser', 'Reply', 'team'] as const;
export const MESSAGE_TEMPLATE_MODES = ['html', 'richtext'] as const;

// ============================================================================
// Helper Function - Builds JSON Schema properties for create/update
// ============================================================================

export const buildMessageTemplateProperties = (isUpdate = false) => ({
  title: {
    type: "string" as const,
    description: MESSAGE_TEMPLATE_DESCRIPTIONS.title
  },
  subject: {
    type: "string" as const,
    description: MESSAGE_TEMPLATE_DESCRIPTIONS.subject
  },
  message: {
    type: "string" as const,
    description: MESSAGE_TEMPLATE_DESCRIPTIONS.message
  },
  html: {
    type: "string" as const,
    description: MESSAGE_TEMPLATE_DESCRIPTIONS.html
  },
  type: {
    type: "string" as const,
    enum: MESSAGE_TEMPLATE_TYPES,
    description: MESSAGE_TEMPLATE_DESCRIPTIONS.type
  },
  mode: {
    type: "string" as const,
    enum: MESSAGE_TEMPLATE_MODES,
    description: MESSAGE_TEMPLATE_DESCRIPTIONS.mode
  },
  isMarketing: {
    type: "boolean" as const,
    description: MESSAGE_TEMPLATE_DESCRIPTIONS.isMarketing
  },
  forChannels: {
    type: "array" as const,
    items: { type: "string" as const },
    description: MESSAGE_TEMPLATE_DESCRIPTIONS.forChannels
  },
  forRoles: {
    type: "array" as const,
    items: { type: "string" as const },
    description: MESSAGE_TEMPLATE_DESCRIPTIONS.forRoles
  },
  forEntityTypes: {
    type: "array" as const,
    items: { type: "string" as const },
    description: MESSAGE_TEMPLATE_DESCRIPTIONS.forEntityTypes
  },
  hideFromCompose: {
    type: "boolean" as const,
    description: MESSAGE_TEMPLATE_DESCRIPTIONS.hideFromCompose
  },
  tags: {
    type: "array" as const,
    items: { type: "string" as const },
    description: MESSAGE_TEMPLATE_DESCRIPTIONS.tags
  },
  archivedAt: {
    type: "string" as const,
    description: MESSAGE_TEMPLATE_DESCRIPTIONS.archivedAt
  },
  mmsAttachmentURLs: {
    type: "array" as const,
    items: { type: "string" as const },
    description: MESSAGE_TEMPLATE_DESCRIPTIONS.mmsAttachmentURLs
  },
});

// ============================================================================
// Zod Schemas - Validation schemas using constants (internal to file)
// ============================================================================

const messageTemplateDataSchema = z.object({
  title: z.string().describe(MESSAGE_TEMPLATE_DESCRIPTIONS.title),
  subject: z.string().describe(MESSAGE_TEMPLATE_DESCRIPTIONS.subject),
  message: z.string().describe(MESSAGE_TEMPLATE_DESCRIPTIONS.message),
  html: z.string().optional().describe(MESSAGE_TEMPLATE_DESCRIPTIONS.html),
  type: z.enum(MESSAGE_TEMPLATE_TYPES).optional().describe(MESSAGE_TEMPLATE_DESCRIPTIONS.type),
  mode: z.enum(MESSAGE_TEMPLATE_MODES).optional().describe(MESSAGE_TEMPLATE_DESCRIPTIONS.mode),
  isMarketing: z.boolean().optional().describe(MESSAGE_TEMPLATE_DESCRIPTIONS.isMarketing),
  forChannels: z.array(z.string()).optional().describe(MESSAGE_TEMPLATE_DESCRIPTIONS.forChannels),
  forRoles: z.array(z.string()).optional().describe(MESSAGE_TEMPLATE_DESCRIPTIONS.forRoles),
  forEntityTypes: z.array(z.string()).optional().describe(MESSAGE_TEMPLATE_DESCRIPTIONS.forEntityTypes),
  hideFromCompose: z.boolean().optional().describe(MESSAGE_TEMPLATE_DESCRIPTIONS.hideFromCompose),
  tags: z.array(z.string()).optional().describe(MESSAGE_TEMPLATE_DESCRIPTIONS.tags),
  archivedAt: z.union([z.date(), z.literal('')]).optional().describe(MESSAGE_TEMPLATE_DESCRIPTIONS.archivedAt),
  mmsAttachmentURLs: z.array(z.string()).optional().describe(MESSAGE_TEMPLATE_DESCRIPTIONS.mmsAttachmentURLs),
});

const messageTemplateUpdatesSchema = messageTemplateDataSchema.partial();

// ============================================================================
// Exports - Wrapped schemas for registry and tool definitions
// ============================================================================

export const messageTemplateSchemas = {
  create: createCreateOneSchema(messageTemplateDataSchema),
  update: createUpdateOneSchema(messageTemplateUpdatesSchema),
};

export const messageTemplateTools = [
  {
    name: "templates_create_one",
    description: "Create a new message template in Tellescope. Returns the created template object with its ID.",
    inputSchema: {
      type: "object",
      properties: {
        data: {
          type: "object",
          description: "Message template creation data",
          properties: buildMessageTemplateProperties(false),
          required: ["title", "subject", "message"],
        },
      },
      required: ["data"],
    },
  },
  {
    name: "templates_update_one",
    description: "Update an existing message template by ID in Tellescope. Returns the updated template object.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "The unique ID of the message template to update",
        },
        updates: {
          type: "object",
          description: "Message template update data - all fields are optional",
          properties: buildMessageTemplateProperties(true),
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
