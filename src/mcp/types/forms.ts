import { z } from "zod";
import { createCreateOneSchema, createUpdateOneSchema } from "./_utilities";

// ============================================================================
// Constants - Field Descriptions
// ============================================================================

export const FORM_DESCRIPTIONS = {
  title: "The internal title/name of the form for reference in the dashboard",
  gtmTag: "Google Tag Manager tag ID for tracking form interactions",
  ipAddressCustomField: "Name of custom field to store the submitter's IP address",
  archivedAt: "Timestamp when the form was archived. Empty string '' means not archived.",
  displayTitle: "Public-facing title shown to users in portal and timeline (if different from internal title)",
  description: "Optional description of the form's purpose",
  customSubject: "Custom subject line when sending this form via email",
  customGreeting: "Custom greeting text at the start of the form",
  customSignature: "Custom signature text at the end of the form",
  allowPublicURL: "Whether to generate a public URL that anyone can access without authentication",
  intakeEmailRequired: "Whether to require email in the intake fields (overrides intakePhone setting)",
  intakeEmailHidden: "Whether to hide the email field from intake fields",
  intakePhone: "Configure phone field in intake: 'required', 'optional', or 'hidden'",
  intakeDateOfBirth: "Configure date of birth field in intake: 'required', 'optional', or 'hidden'",
  intakeState: "Configure state field in intake: 'required', 'optional', or 'hidden'",
  intakeGender: "Configure gender field in intake: 'required', 'optional', or 'hidden'",
  intakeGenderIsSex: "Whether the gender field should be labeled as 'Sex' instead of 'Gender'",
  thanksMessage: "Plain text thank you message shown after form submission",
  htmlThanksMessage: "HTML thank you message shown after form submission (takes precedence over thanksMessage)",
  type: "Form type: 'note' for internal notes, 'enduserFacing' for patient-facing forms",
  scoring: "Array of scoring rules to calculate scores from form responses. Each rule maps a field/response to a point value.",
  realTimeScoring: "Whether to calculate and display scores in real-time as the user fills out the form",
  externalId: "External identifier for integration with other systems",
  ga4measurementId: "Google Analytics 4 measurement ID for tracking",
  backgroundColor: "Hex color code for the form background (e.g., '#FFFFFF')",
  productIds: "Array of product IDs associated with this form for purchase workflows",
  redirectToBookedAppointmentOnSubmit: "Whether to redirect to the booked appointment page after form submission",
  submitRedirectURL: "URL to redirect to after form submission",
  publicFormIdRedirect: "ID of another form to redirect to after this form is submitted",
  publicShowLanguage: "Whether to show language selector on public forms",
  publicShowDownload: "Whether to show download button on public forms",
  customization: "UI customization options for the public form including colors, labels, and layout",
  disabled: "Whether the form is disabled and cannot be submitted",
  disableAutomaticIntegrationPush: "Whether to disable automatic pushing of form data to integrated systems (Canvas, Elation, etc.)",
  customTypeIds: "Array of custom enduser type IDs that can access this form",
  lockResponsesOnSubmission: "Whether to lock form responses after submission, preventing edits",
  tags: "Array of tags for categorizing and filtering forms (e.g., ['intake', 'assessment', 'covid'])",
  language: "ISO language code for the form (e.g., 'en', 'es', 'fr')",
  isNonVisitElationNote: "Whether this form creates a non-visit note in Elation EHR",
  elationVisitNotePractitionerIds: "Array of Elation practitioner IDs for visit note creation",
  elationVisitNoteType: "Elation visit note type (e.g., 'Progress Note', 'SOAP Note')",
  elationSkipBlankResponses: "Whether to skip blank responses when syncing to Elation",
  canvasId: "Canvas FHIR questionnaire ID for EHR integration",
  canvasQuestionId: "Canvas FHIR question ID for EHR integration",
  syncToOLH: "Whether to sync form responses to OLH (Optimize Life Health) system",
  syncWithResponsesFromFormIds: "Array of form IDs whose responses should be synced with this form's responses",
  scoresSync: "Array of score mappings for syncing calculated scores to external systems",
  hideAfterUnsubmittedInMS: "Milliseconds after which unsubmitted forms are hidden from the user (for abandoned form cleanup)",
  hideFromCompose: "Whether to hide this form from the compose/send message interface",
  hideFromBulkSubmission: "Whether to hide this form from bulk submission workflows",
  enduserFieldsToAppendForSync: "Array of enduser field names to append to form data when syncing to external systems",
  allowPortalSubmission: "Whether endusers can submit this form through the patient portal",
  allowPortalSubmissionEnduserCondition: "MongoDB-style filter to restrict which endusers can submit via portal (e.g., { tags: 'premium' })",
  canvasNoteCoding: "FHIR coding for Canvas note categorization (system, code, display)",
  syncToCanvasAsDataImport: "Whether to sync this form to Canvas as a data import rather than a note",
  matchCareTeamTagsForCanvasPractitionerResolution: "Care team tags to match for resolving Canvas practitioner assignment",
  dontSyncToCanvasOnSubmission: "Whether to skip automatic Canvas sync on form submission",
  belugaVisitType: "Beluga EHR visit type for integration",
  showByUserTags: "Array of user tags - only users with these tags can see/send this form",
  version: "Form builder version: 'v1' for legacy form builder, 'v2' for new form builder. IMPORTANT: Always use 'v2' for new forms - it provides a better user experience with improved UI and features.",
} as const;

// ============================================================================
// Constants - Enum Values
// ============================================================================

export const FORM_TYPES = ['note', 'enduserFacing'] as const;
export const FORM_INTAKE_FIELD_SETTINGS = ['required', 'optional', 'hidden'] as const;
export const FORM_VERSIONS = ['v1', 'v2'] as const;
export const LIST_QUERY_QUALIFIERS = ['All Of', 'One Of'] as const;

// ============================================================================
// Helper Function - JSON Schema Properties
// ============================================================================

export const buildFormProperties = (isUpdate = false) => ({
  title: {
    type: "string" as const,
    description: FORM_DESCRIPTIONS.title,
  },
  gtmTag: {
    type: "string" as const,
    description: FORM_DESCRIPTIONS.gtmTag,
  },
  ipAddressCustomField: {
    type: "string" as const,
    description: FORM_DESCRIPTIONS.ipAddressCustomField,
  },
  archivedAt: {
    type: "string" as const,
    description: FORM_DESCRIPTIONS.archivedAt,
  },
  displayTitle: {
    type: "string" as const,
    description: FORM_DESCRIPTIONS.displayTitle,
  },
  description: {
    type: "string" as const,
    description: FORM_DESCRIPTIONS.description,
  },
  customSubject: {
    type: "string" as const,
    description: FORM_DESCRIPTIONS.customSubject,
  },
  customGreeting: {
    type: "string" as const,
    description: FORM_DESCRIPTIONS.customGreeting,
  },
  customSignature: {
    type: "string" as const,
    description: FORM_DESCRIPTIONS.customSignature,
  },
  allowPublicURL: {
    type: "boolean" as const,
    description: FORM_DESCRIPTIONS.allowPublicURL,
  },
  intakeEmailRequired: {
    type: "boolean" as const,
    description: FORM_DESCRIPTIONS.intakeEmailRequired,
  },
  intakeEmailHidden: {
    type: "boolean" as const,
    description: FORM_DESCRIPTIONS.intakeEmailHidden,
  },
  intakePhone: {
    type: "string" as const,
    enum: FORM_INTAKE_FIELD_SETTINGS,
    description: FORM_DESCRIPTIONS.intakePhone,
  },
  intakeDateOfBirth: {
    type: "string" as const,
    enum: FORM_INTAKE_FIELD_SETTINGS,
    description: FORM_DESCRIPTIONS.intakeDateOfBirth,
  },
  intakeState: {
    type: "string" as const,
    enum: FORM_INTAKE_FIELD_SETTINGS,
    description: FORM_DESCRIPTIONS.intakeState,
  },
  intakeGender: {
    type: "string" as const,
    enum: FORM_INTAKE_FIELD_SETTINGS,
    description: FORM_DESCRIPTIONS.intakeGender,
  },
  intakeGenderIsSex: {
    type: "boolean" as const,
    description: FORM_DESCRIPTIONS.intakeGenderIsSex,
  },
  thanksMessage: {
    type: "string" as const,
    description: FORM_DESCRIPTIONS.thanksMessage,
  },
  htmlThanksMessage: {
    type: "string" as const,
    description: FORM_DESCRIPTIONS.htmlThanksMessage,
  },
  type: {
    type: "string" as const,
    enum: FORM_TYPES,
    description: FORM_DESCRIPTIONS.type,
  },
  scoring: {
    type: "array" as const,
    items: {
      type: "object" as const,
      properties: {
        title: {
          type: "string" as const,
          description: "Name of this scoring rule (e.g., 'Depression Score')",
        },
        fieldId: {
          type: "string" as const,
          description: "ID of the form field to score",
        },
        response: {
          type: "string" as const,
          description: "Optional specific response value to match (if omitted, rule applies to any response)",
        },
        score: {
          description: "Score value: use empty string '' to use the numerical value of the response, or a number for explicit value",
        },
      },
      required: ["title", "fieldId", "score"],
    },
    description: FORM_DESCRIPTIONS.scoring,
  },
  realTimeScoring: {
    type: "boolean" as const,
    description: FORM_DESCRIPTIONS.realTimeScoring,
  },
  externalId: {
    type: "string" as const,
    description: FORM_DESCRIPTIONS.externalId,
  },
  ga4measurementId: {
    type: "string" as const,
    description: FORM_DESCRIPTIONS.ga4measurementId,
  },
  backgroundColor: {
    type: "string" as const,
    description: FORM_DESCRIPTIONS.backgroundColor,
  },
  productIds: {
    type: "array" as const,
    items: { type: "string" as const },
    description: FORM_DESCRIPTIONS.productIds,
  },
  redirectToBookedAppointmentOnSubmit: {
    type: "boolean" as const,
    description: FORM_DESCRIPTIONS.redirectToBookedAppointmentOnSubmit,
  },
  submitRedirectURL: {
    type: "string" as const,
    description: FORM_DESCRIPTIONS.submitRedirectURL,
  },
  publicFormIdRedirect: {
    type: "string" as const,
    description: FORM_DESCRIPTIONS.publicFormIdRedirect,
  },
  publicShowLanguage: {
    type: "boolean" as const,
    description: FORM_DESCRIPTIONS.publicShowLanguage,
  },
  publicShowDownload: {
    type: "boolean" as const,
    description: FORM_DESCRIPTIONS.publicShowDownload,
  },
  customization: {
    type: "object" as const,
    properties: {
      publicFormHTMLDescription: {
        type: "string" as const,
        description: "HTML description shown at the top of public forms",
      },
      publicFormSubmitHTMLDescription: {
        type: "string" as const,
        description: "HTML description shown on the submit confirmation page",
      },
      logoHeight: {
        type: "number" as const,
        description: "Logo height in pixels",
      },
      publicLabelPrefix: {
        type: "string" as const,
        description: "Prefix to add to all public form field labels",
      },
      publicFnameLabel: {
        type: "string" as const,
        description: "Custom label for first name field",
      },
      publicLnameLabel: {
        type: "string" as const,
        description: "Custom label for last name field",
      },
      publicEmailLabel: {
        type: "string" as const,
        description: "Custom label for email field",
      },
      publicPhoneLabel: {
        type: "string" as const,
        description: "Custom label for phone field",
      },
      publicStateLabel: {
        type: "string" as const,
        description: "Custom label for state field",
      },
      publicDateOfBirthLabel: {
        type: "string" as const,
        description: "Custom label for date of birth field",
      },
      publicGenderLabel: {
        type: "string" as const,
        description: "Custom label for gender field",
      },
      hideProgressBar: {
        type: "boolean" as const,
        description: "Hide the progress bar on multi-page forms",
      },
      showRestartAtEnd: {
        type: "boolean" as const,
        description: "Show a 'restart' button at the end of the form",
      },
      hideLogo: {
        type: "boolean" as const,
        description: "Hide the organization logo on public forms",
      },
      multiPagePublicQuestions: {
        type: "boolean" as const,
        description: "Display public form questions one per page instead of all at once",
      },
      hideBg: {
        type: "boolean" as const,
        description: "Hide the background image/color on public forms",
      },
      portalShowThanksAfterSubmission: {
        type: "boolean" as const,
        description: "Show thank you message in patient portal after submission",
      },
      maxWidth: {
        type: "number" as const,
        description: "Maximum form width in pixels",
      },
      primaryColor: {
        type: "string" as const,
        description: "Custom primary/accent color for buttons, progress bar, etc. (hex code)",
      },
    },
    description: FORM_DESCRIPTIONS.customization,
  },
  disabled: {
    type: "boolean" as const,
    description: FORM_DESCRIPTIONS.disabled,
  },
  disableAutomaticIntegrationPush: {
    type: "boolean" as const,
    description: FORM_DESCRIPTIONS.disableAutomaticIntegrationPush,
  },
  customTypeIds: {
    type: "array" as const,
    items: { type: "string" as const },
    description: FORM_DESCRIPTIONS.customTypeIds,
  },
  lockResponsesOnSubmission: {
    type: "boolean" as const,
    description: FORM_DESCRIPTIONS.lockResponsesOnSubmission,
  },
  tags: {
    type: "array" as const,
    items: { type: "string" as const },
    description: FORM_DESCRIPTIONS.tags,
  },
  language: {
    type: "string" as const,
    description: FORM_DESCRIPTIONS.language,
  },
  isNonVisitElationNote: {
    type: "boolean" as const,
    description: FORM_DESCRIPTIONS.isNonVisitElationNote,
  },
  elationVisitNotePractitionerIds: {
    type: "array" as const,
    items: { type: "string" as const },
    description: FORM_DESCRIPTIONS.elationVisitNotePractitionerIds,
  },
  elationVisitNoteType: {
    type: "string" as const,
    description: FORM_DESCRIPTIONS.elationVisitNoteType,
  },
  elationSkipBlankResponses: {
    type: "boolean" as const,
    description: FORM_DESCRIPTIONS.elationSkipBlankResponses,
  },
  canvasId: {
    type: "string" as const,
    description: FORM_DESCRIPTIONS.canvasId,
  },
  canvasQuestionId: {
    type: "string" as const,
    description: FORM_DESCRIPTIONS.canvasQuestionId,
  },
  syncToOLH: {
    type: "boolean" as const,
    description: FORM_DESCRIPTIONS.syncToOLH,
  },
  syncWithResponsesFromFormIds: {
    type: "array" as const,
    items: { type: "string" as const },
    description: FORM_DESCRIPTIONS.syncWithResponsesFromFormIds,
  },
  scoresSync: {
    type: "array" as const,
    items: {
      type: "object" as const,
      properties: {
        score: {
          type: "string" as const,
          description: "Name of the score from the scoring rules",
        },
        externalId: {
          type: "string" as const,
          description: "External system identifier for this score",
        },
      },
      required: ["score", "externalId"],
    },
    description: FORM_DESCRIPTIONS.scoresSync,
  },
  hideAfterUnsubmittedInMS: {
    type: "number" as const,
    description: FORM_DESCRIPTIONS.hideAfterUnsubmittedInMS,
  },
  hideFromCompose: {
    type: "boolean" as const,
    description: FORM_DESCRIPTIONS.hideFromCompose,
  },
  hideFromBulkSubmission: {
    type: "boolean" as const,
    description: FORM_DESCRIPTIONS.hideFromBulkSubmission,
  },
  enduserFieldsToAppendForSync: {
    type: "array" as const,
    items: { type: "string" as const },
    description: FORM_DESCRIPTIONS.enduserFieldsToAppendForSync,
  },
  allowPortalSubmission: {
    type: "boolean" as const,
    description: FORM_DESCRIPTIONS.allowPortalSubmission,
  },
  allowPortalSubmissionEnduserCondition: {
    type: "object" as const,
    description: FORM_DESCRIPTIONS.allowPortalSubmissionEnduserCondition,
  },
  canvasNoteCoding: {
    type: "object" as const,
    properties: {
      system: {
        type: "string" as const,
        description: "FHIR coding system (e.g., 'http://loinc.org')",
      },
      code: {
        type: "string" as const,
        description: "FHIR code",
      },
      display: {
        type: "string" as const,
        description: "Human-readable display name",
      },
    },
    description: FORM_DESCRIPTIONS.canvasNoteCoding,
  },
  syncToCanvasAsDataImport: {
    type: "boolean" as const,
    description: FORM_DESCRIPTIONS.syncToCanvasAsDataImport,
  },
  matchCareTeamTagsForCanvasPractitionerResolution: {
    type: "object" as const,
    properties: {
      qualifier: {
        type: "string" as const,
        enum: LIST_QUERY_QUALIFIERS,
        description: "Match qualifier: 'All Of' requires all tags, 'One Of' requires at least one tag",
      },
      values: {
        type: "array" as const,
        items: { type: "string" as const },
        description: "Array of care team tags to match",
      },
    },
    required: ["qualifier", "values"],
    description: FORM_DESCRIPTIONS.matchCareTeamTagsForCanvasPractitionerResolution,
  },
  dontSyncToCanvasOnSubmission: {
    type: "boolean" as const,
    description: FORM_DESCRIPTIONS.dontSyncToCanvasOnSubmission,
  },
  belugaVisitType: {
    type: "string" as const,
    description: FORM_DESCRIPTIONS.belugaVisitType,
  },
  showByUserTags: {
    type: "array" as const,
    items: { type: "string" as const },
    description: FORM_DESCRIPTIONS.showByUserTags,
  },
  version: {
    type: "string" as const,
    enum: FORM_VERSIONS,
    description: FORM_DESCRIPTIONS.version,
  },
});

// ============================================================================
// Zod Schemas (Internal)
// ============================================================================

const formDataSchema = z.object({
  title: z.string().describe(FORM_DESCRIPTIONS.title),
  gtmTag: z.string().optional().describe(FORM_DESCRIPTIONS.gtmTag),
  ipAddressCustomField: z.string().describe(FORM_DESCRIPTIONS.ipAddressCustomField),
  archivedAt: z.string().optional().describe(FORM_DESCRIPTIONS.archivedAt),
  displayTitle: z.string().optional().describe(FORM_DESCRIPTIONS.displayTitle),
  description: z.string().optional().describe(FORM_DESCRIPTIONS.description),
  customSubject: z.string().optional().describe(FORM_DESCRIPTIONS.customSubject),
  customGreeting: z.string().optional().describe(FORM_DESCRIPTIONS.customGreeting),
  customSignature: z.string().optional().describe(FORM_DESCRIPTIONS.customSignature),
  allowPublicURL: z.boolean().optional().describe(FORM_DESCRIPTIONS.allowPublicURL),
  intakeEmailRequired: z.boolean().optional().describe(FORM_DESCRIPTIONS.intakeEmailRequired),
  intakeEmailHidden: z.boolean().optional().describe(FORM_DESCRIPTIONS.intakeEmailHidden),
  intakePhone: z.enum(FORM_INTAKE_FIELD_SETTINGS).optional().describe(FORM_DESCRIPTIONS.intakePhone),
  intakeDateOfBirth: z.enum(FORM_INTAKE_FIELD_SETTINGS).optional().describe(FORM_DESCRIPTIONS.intakeDateOfBirth),
  intakeState: z.enum(FORM_INTAKE_FIELD_SETTINGS).optional().describe(FORM_DESCRIPTIONS.intakeState),
  intakeGender: z.enum(FORM_INTAKE_FIELD_SETTINGS).optional().describe(FORM_DESCRIPTIONS.intakeGender),
  intakeGenderIsSex: z.boolean().optional().describe(FORM_DESCRIPTIONS.intakeGenderIsSex),
  thanksMessage: z.string().optional().describe(FORM_DESCRIPTIONS.thanksMessage),
  htmlThanksMessage: z.string().optional().describe(FORM_DESCRIPTIONS.htmlThanksMessage),
  type: z.enum(FORM_TYPES).optional().describe(FORM_DESCRIPTIONS.type),
  scoring: z.array(
    z.object({
      title: z.string(),
      fieldId: z.string(),
      response: z.string().optional(),
      score: z.union([z.string(), z.number()]),
    })
  ).optional().describe(FORM_DESCRIPTIONS.scoring),
  realTimeScoring: z.boolean().optional().describe(FORM_DESCRIPTIONS.realTimeScoring),
  externalId: z.string().optional().describe(FORM_DESCRIPTIONS.externalId),
  ga4measurementId: z.string().optional().describe(FORM_DESCRIPTIONS.ga4measurementId),
  backgroundColor: z.string().optional().describe(FORM_DESCRIPTIONS.backgroundColor),
  productIds: z.array(z.string()).optional().describe(FORM_DESCRIPTIONS.productIds),
  redirectToBookedAppointmentOnSubmit: z.boolean().optional().describe(FORM_DESCRIPTIONS.redirectToBookedAppointmentOnSubmit),
  submitRedirectURL: z.string().optional().describe(FORM_DESCRIPTIONS.submitRedirectURL),
  publicFormIdRedirect: z.string().optional().describe(FORM_DESCRIPTIONS.publicFormIdRedirect),
  publicShowLanguage: z.boolean().optional().describe(FORM_DESCRIPTIONS.publicShowLanguage),
  publicShowDownload: z.boolean().optional().describe(FORM_DESCRIPTIONS.publicShowDownload),
  customization: z.object({
    publicFormHTMLDescription: z.string().optional(),
    publicFormSubmitHTMLDescription: z.string().optional(),
    logoHeight: z.number().optional(),
    publicLabelPrefix: z.string().optional(),
    publicFnameLabel: z.string().optional(),
    publicLnameLabel: z.string().optional(),
    publicEmailLabel: z.string().optional(),
    publicPhoneLabel: z.string().optional(),
    publicStateLabel: z.string().optional(),
    publicDateOfBirthLabel: z.string().optional(),
    publicGenderLabel: z.string().optional(),
    hideProgressBar: z.boolean().optional(),
    showRestartAtEnd: z.boolean().optional(),
    hideLogo: z.boolean().optional(),
    multiPagePublicQuestions: z.boolean().optional(),
    hideBg: z.boolean().optional(),
    portalShowThanksAfterSubmission: z.boolean().optional(),
    maxWidth: z.number().optional(),
    primaryColor: z.string().optional(),
  }).optional().describe(FORM_DESCRIPTIONS.customization),
  disabled: z.boolean().optional().describe(FORM_DESCRIPTIONS.disabled),
  disableAutomaticIntegrationPush: z.boolean().optional().describe(FORM_DESCRIPTIONS.disableAutomaticIntegrationPush),
  customTypeIds: z.array(z.string()).optional().describe(FORM_DESCRIPTIONS.customTypeIds),
  lockResponsesOnSubmission: z.boolean().optional().describe(FORM_DESCRIPTIONS.lockResponsesOnSubmission),
  tags: z.array(z.string()).optional().describe(FORM_DESCRIPTIONS.tags),
  language: z.string().optional().describe(FORM_DESCRIPTIONS.language),
  isNonVisitElationNote: z.boolean().optional().describe(FORM_DESCRIPTIONS.isNonVisitElationNote),
  elationVisitNotePractitionerIds: z.array(z.string()).optional().describe(FORM_DESCRIPTIONS.elationVisitNotePractitionerIds),
  elationVisitNoteType: z.string().optional().describe(FORM_DESCRIPTIONS.elationVisitNoteType),
  elationSkipBlankResponses: z.boolean().optional().describe(FORM_DESCRIPTIONS.elationSkipBlankResponses),
  canvasId: z.string().optional().describe(FORM_DESCRIPTIONS.canvasId),
  canvasQuestionId: z.string().optional().describe(FORM_DESCRIPTIONS.canvasQuestionId),
  syncToOLH: z.boolean().optional().describe(FORM_DESCRIPTIONS.syncToOLH),
  syncWithResponsesFromFormIds: z.array(z.string()).optional().describe(FORM_DESCRIPTIONS.syncWithResponsesFromFormIds),
  scoresSync: z.array(
    z.object({
      score: z.string(),
      externalId: z.string(),
    })
  ).optional().describe(FORM_DESCRIPTIONS.scoresSync),
  hideAfterUnsubmittedInMS: z.number().optional().describe(FORM_DESCRIPTIONS.hideAfterUnsubmittedInMS),
  hideFromCompose: z.boolean().optional().describe(FORM_DESCRIPTIONS.hideFromCompose),
  hideFromBulkSubmission: z.boolean().optional().describe(FORM_DESCRIPTIONS.hideFromBulkSubmission),
  enduserFieldsToAppendForSync: z.array(z.string()).optional().describe(FORM_DESCRIPTIONS.enduserFieldsToAppendForSync),
  allowPortalSubmission: z.boolean().optional().describe(FORM_DESCRIPTIONS.allowPortalSubmission),
  allowPortalSubmissionEnduserCondition: z.record(z.any()).optional().describe(FORM_DESCRIPTIONS.allowPortalSubmissionEnduserCondition),
  canvasNoteCoding: z.object({
    system: z.string(),
    code: z.string(),
    display: z.string(),
  }).partial().optional().describe(FORM_DESCRIPTIONS.canvasNoteCoding),
  syncToCanvasAsDataImport: z.boolean().optional().describe(FORM_DESCRIPTIONS.syncToCanvasAsDataImport),
  matchCareTeamTagsForCanvasPractitionerResolution: z.object({
    qualifier: z.enum(LIST_QUERY_QUALIFIERS),
    values: z.array(z.string()),
  }).optional().describe(FORM_DESCRIPTIONS.matchCareTeamTagsForCanvasPractitionerResolution),
  dontSyncToCanvasOnSubmission: z.boolean().optional().describe(FORM_DESCRIPTIONS.dontSyncToCanvasOnSubmission),
  belugaVisitType: z.string().optional().describe(FORM_DESCRIPTIONS.belugaVisitType),
  showByUserTags: z.array(z.string()).optional().describe(FORM_DESCRIPTIONS.showByUserTags),
  version: z.enum(FORM_VERSIONS).optional().describe(FORM_DESCRIPTIONS.version),
});

const formUpdatesSchema = formDataSchema.partial();

// ============================================================================
// Exported Schemas for Registry
// ============================================================================

export const formSchemas = {
  create: createCreateOneSchema(formDataSchema),
  update: createUpdateOneSchema(formUpdatesSchema),
};

// ============================================================================
// Tool Definitions
// ============================================================================

export const formTools = [
  {
    name: "forms_create_one",
    description: "Create a new form in Tellescope. Returns the created form object with its ID. Note: You must create FormFields separately using form_fields_create_one to add questions to this form.",
    inputSchema: {
      type: "object",
      properties: {
        data: {
          type: "object",
          description: "Form creation data",
          properties: buildFormProperties(false),
          required: ["title", "ipAddressCustomField"],
        },
      },
      required: ["data"],
    },
  },
  {
    name: "forms_update_one",
    description: "Update an existing form by ID in Tellescope. Returns the updated form object.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "The unique ID of the form to update",
        },
        updates: {
          type: "object",
          description: "Form fields to update (partial)",
          properties: buildFormProperties(true),
        },
      },
      required: ["id", "updates"],
    },
  },
];
