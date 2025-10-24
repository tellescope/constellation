import { z } from "zod";
import { createUpdateOneSchema } from "./_utilities";

// ============================================================================
// Constants
// ============================================================================

/**
 * Field descriptions for Organization properties (updatable fields only)
 */
export const ORGANIZATION_DESCRIPTIONS = {
  inboxThreadsBuiltFrom: "Date from which inbox threads are built, or empty string '' to clear",
  inboxThreadsBuiltTo: "Date to which inbox threads are built, or empty string '' to clear",
  bedrockAIAllowed: "Whether Bedrock AI features are enabled for this organization",
  subdomains: "Array of subdomains associated with this organization",
  owner: "User ID of the organization owner",
  timezone: "Organization timezone (e.g., 'America/New_York', 'America/Los_Angeles')",
  roles: "Array of custom role names defined for this organization",
  skills: "Array of custom skill tags for providers",
  logoVersion: "Version number of the organization logo (increments on upload)",
  faviconVersion: "Version number of the organization favicon (increments on upload)",
  themeColor: "Primary theme color in hex format (e.g., '#4A90E2')",
  themeColorSecondary: "Secondary theme color in hex format",
  customPortalURL: "Custom domain for the patient portal (e.g., 'portal.example.com')",
  customPortalURLs: "Array of custom portal URLs for multi-portal setups",
  customProviderURL: "Custom domain for the provider dashboard",
  customTermsOfService: "URL to custom terms of service document",
  customPrivacyPolicy: "URL to custom privacy policy document",
  customPolicies: "Array of custom policy documents with title and URL. Structure: [{ title: string, url: string }]",
  customPoliciesVersion: "Version string for custom policies (used to track policy updates and require re-acceptance)",
  requireCustomTermsOnMagicLink: "Require users to accept custom terms when logging in via magic link",
  settings: `Organization-wide settings object with nested configuration sections:

{
  dashboard?: {
    view?: {
      blocks: Array<{
        type: 'Inbox' | 'Tickets' | 'Upcoming Events' | 'Team Chats' | 'To-Dos' | 'Database',
        info?: { databaseId?: string }
      }>
    }
  },
  endusers?: {
    disableMultipleChatRooms?: boolean,
    disableCalendarEventAutoAssignment?: boolean,
    builtinFields?: Array<{ field: string, label: string, required?: boolean, requireConfirmation?: boolean, hidden?: boolean }>,
    customFields?: Array<{ type: string, info: object, field: string, required?: boolean, hiddenFromProfile?: boolean, requireConfirmation?: boolean, tags?: string[] }>,
    disableAdhocFields?: boolean,
    autoReplyEnabled?: boolean,
    disableAutoreplyForCustomEntities?: boolean,
    tags?: string[],
    showFreeNote?: boolean,
    autoSaveFreeNote?: boolean,
    canDeleteFreeNote?: boolean,
    recordCalls?: boolean,
    recordCallAudioPlayback?: string,
    dontRecordCallsToPhone?: string[],
    transcribeCalls?: boolean,
    transcribeCallInboundPlayback?: string,
    showDeleteCallRecordingOnTimeline?: boolean,
    defaultPhoneNumber?: string,
    sendSMSOnZoomStart?: boolean,
    enableGroupMMS?: boolean,
    enableAccessTags?: boolean,
    flaggedFileText?: string,
    showBulkFormInput?: boolean,
    autofillSignature?: boolean,
    showFullVitalsTab?: boolean,
    canMoveCalls?: boolean,
    canMoveSMS?: boolean,
    inboxRepliesMarkRead?: boolean,
    alwaysShowInsurance?: boolean,
    defaultToOutboundConferenceCall?: boolean,
    sharedInboxReadStatus?: boolean,
    dontMarkReadForAssigned?: boolean,
    matchEmailAndNames?: boolean,
    hideNotesFromComposeForm?: boolean,
    showSalesforceId?: boolean,
    loopQueueCallSound?: boolean,
    showOrdersInSidebar?: boolean,
    showDiagnoses?: boolean,
    showDeviceOrders?: boolean,
    requireObservationInvalidationReason?: boolean,
    defaultHideFilesFromPortal?: boolean,
    hideUnorderedFullscriptMeds?: boolean,
    detailField?: string,
    showDownloadCallRecordings?: boolean,
    launchDosespotWebhookURL?: string,
    reverseTimeline?: boolean,
    delayedReadingIntervalInMS?: number,
    createChatRoomWithBlankUserIds?: boolean,
    showAlternateEmailsEditor?: boolean
  },
  tickets?: {
    defaultJourneyDueDateOffsetInMS?: number | '',
    disableSnooze?: boolean,
    showCommunications?: boolean,
    showJourneys?: boolean,
    requireDueDate?: boolean,
    allowArchival?: boolean,
    returnToTicketsList?: boolean,
    dontAddToCareTeamOnTicketAssignment?: boolean
  },
  calendar?: {
    dayStart?: { hour: number, minute: number },
    dayEnd?: { hour: number, minute: number },
    bookingStartOffset?: { month?: number, day?: number, hour?: number },
    bookingEndOffset?: { month?: number, day?: number, hour?: number },
    templateRequired?: boolean,
    locationRequired?: boolean,
    cancelReasons?: string[],
    copyRemindersByDefault?: boolean,
    showMakeRecurringOnProfile?: boolean
  },
  users?: {
    sessionDurationInHours?: number
  },
  integrations?: {
    vitalLabOrderPhysicianOptional?: boolean,
    athenaAppointmentSyncJITSeconds?: number
  },
  interface?: {
    dontPersistSearches?: boolean,
    showEndusersV2?: boolean,
    showInboxV2?: boolean,
    showDialerInTopbar?: boolean
  },
  timeTracking?: {
    enabled?: boolean
  }
}`,
  portalSettings: `Patient portal settings object with nested configuration sections:

{
  authentication?: {
    landingTitle?: string,
    landingLogo?: string,
    landingGraphic?: string,
    loginTitle?: string,
    loginDescription?: string,
    loginGraphic?: string,
    loginBottomHTML?: string,
    registerTitle?: string,
    registerDescription?: string,
    registerGraphic?: string,
    hideRegister?: boolean,
    dontPromptSetPassword?: boolean,
    requireOTP?: boolean
  },
  communication?: {
    allowEnduserInitiatedChat?: boolean,
    allowChatCareTeamSelection?: boolean,
    enduserInitiatedChatDefaultSubject?: string,
    sendEmailNotificationsToEnduser?: boolean,
    sendSMSNotificationsToEnduser?: boolean,
    showFloatingChatIcon?: boolean
  },
  orders?: {
    customOrderTrackingURL?: string
  },
  documents?: {
    hideMissingAnswers?: boolean,
    outstandingFormsTitle?: string,
    availableFormsTitle?: string
  },
  hideSettingsPage?: boolean
}`,
  enduserDisplayName: "Custom term for 'patient' or 'enduser' (e.g., 'Member', 'Client', 'Participant')",
  parentOrganizationId: "ID of parent organization (for sub-organizations)",
  hasCustomBusinessSubdomain: "Whether organization has a custom business subdomain configured",
  callForwardingNumber: "Phone number to forward calls to",
  customAutoreplyMessage: "Custom auto-reply message for incoming communications",
  externalCalendarEventPlaceholderTitle: "Title shown for external calendar events",
  externalCalendarEventPlaceholderDescription: "Description shown for external calendar events",
  customZoomEmailTemplate: "Custom email template for Zoom meeting invitations",
  customZoomEmailSubject: "Custom email subject for Zoom meeting invitations",
  customZoomSMSTemplate: "Custom SMS template for Zoom meeting notifications",
  customVoicemailText: "Custom voicemail greeting text",
  hasConnectedOpenAI: "Whether OpenAI integration is connected",
  hasConnectedHealthie: "Whether Healthie EHR integration is connected",
  hasConnectedElation: "Whether Elation EHR integration is connected",
  hasConnectedIterable: "Whether Iterable marketing integration is connected",
  hasConnectedZendesk: "Whether Zendesk support integration is connected",
  hasConnectedZus: "Whether Zus Health integration is connected",
  hasConnectedCanvas: "Whether Canvas FHIR EHR integration is connected",
  canvasURL: "Canvas EHR instance URL",
  hasConnectedCandid: "Whether Candid Health billing integration is connected",
  hasConnectedGoGoMeds: "Whether GoGoMeds pharmacy integration is connected",
  hasConnectedPagerDuty: "Whether PagerDuty alerting integration is connected",
  hasConnectedSmartMeter: "Whether SmartMeter integration is connected",
  hasConnectedAthena: "Whether Athena EHR integration is connected",
  hasConnectedActiveCampaign: "Whether ActiveCampaign marketing integration is connected",
  hasConnectedDocsumo: "Whether Docsumo document processing integration is connected",
  hasConnectedEmotii: "Whether Emotii emotional health integration is connected",
  hasConnectedDevelopHealth: "Whether Develop Health integration is connected",
  hasConnectedCustomerIO: "Whether Customer.io marketing integration is connected",
  hasConnectedSuperDial: "Whether SuperDial integration is connected",
  hasConnectedBeluga: "Whether Beluga EHR integration is connected",
  hasConnectedMetriport: "Whether Metriport medical record integration is connected",
  hasConnectedPaubox: "Whether Paubox secure email integration is connected",
  hasConfiguredZoom: "Whether Zoom video integration is configured",
  hasTicketQueues: "Whether ticket queue system is enabled",
  vitalTeamId: "Vital Health team ID for integration",
  altVitalTeamIds: "Array of alternate Vital team configurations. Structure: [{ teamId: string, label: string }]",
  zendeskSettings: "Zendesk-specific configuration settings. Structure: { priorityGroups?: string[], resolutionFieldId?: string, resolutionFieldOptions?: string[] }",
  replyToAllEmails: "Default reply-to email address for all outgoing emails",
  replyToEnduserTransactionalEmails: "Reply-to email address specifically for transactional patient emails",
  forwardAllIncomingEmailsTo: "Email address to forward all incoming emails to",
  numCustomTypes: "Number of custom enduser types defined",
  ticketThreadsEnabled: "Whether ticket threading is enabled (typically for Zendesk integration)",
  _groupChatsEnabled: "Internal flag for group chat feature enablement",
  allowCreateSuborganizations: "Allow this organization to create sub-organizations",
  allowCallerId: "Enable caller ID for outbound calls (requires BAA and manual enablement)",
  billingOrganizationName: "Legal name for billing purposes",
  billingOrganizationNPI: "National Provider Identifier (NPI) for billing",
  billingOrganizationTaxId: "Tax ID (EIN) for billing",
  billingOrganizationAddress: "Billing address object. Structure: { addressLineOne: string, addressLineTwo?: string, city: string, state: string, zipCode: string }",
  videoCallBackgroundImage: "URL or S3 key for custom video call background image",
  sendToVoicemailOOO: "Send calls to voicemail when out of office",
  forwardingOOONumber: "Phone number to forward calls to when out of office",
  onCallUserIds: "Array of user IDs who are on-call",
  outOfOfficeVoicemail: `Out of office voicemail playback configuration. Union type with two variants:

1. Say (text-to-speech):
   { type: 'Say', info: { script: string, url?: string } }

2. Play (audio file):
   { type: 'Play', info: { url: string, script?: string } }`,
  enduserProfileWebhooks: "Array of webhooks triggered on enduser profile changes. Structure: [{ url: string, secret?: string }]",
  showCommunity: "Show community features in patient portal",
  phoneLabels: "Array of phone number labels for display. Structure: [{ number: string, label: string }]",
  mfaxAccountId: "mFax account ID for fax integration",
  athenaFieldsSync: "Array of Athena field sync configurations",
  athenaSubscriptions: "Array of Athena webhook subscriptions",
  athenaDepartments: "Array of Athena department configurations. Structure: [{ id: string, timezone: string }]",
  fieldsToAdminNote: "Array of field names to sync to admin notes",
  canvasMessageSync: "Canvas message sync configuration. Structure: { id: string, questionId: string }",
  canvasSyncEmailConsent: "Whether to sync email consent to Canvas",
  canvasSyncPhoneConsent: "Whether to sync phone consent to Canvas",
  dosespotClinics: "Array of DoseSpot clinic configurations. Structure: [{ id: string, name: string }]",
  answersSyncToPortal: "Form answer sync to portal configuration. Structure: [{ id: string, questions: string[] }]",
  externalFormIdsToSync: "Array of external form IDs to sync",
  enforceMFA: "Require multi-factor authentication for all users",
  analyticsIframes: "Array of analytics dashboard iframes. Structure: [{ title: string, iframeURL: string }]",
  stripePublicKeys: "Array of Stripe publishable keys for payment processing",
  stripeKeyDetails: "Array of detailed Stripe key configurations",
  metriportIntegrationDetails: "Array of Metriport integration configurations",
  additionalIterableKeys: "Array of additional Iterable API keys",
  defaultDoseSpotPharmacies: "Array of default DoseSpot pharmacies. Structure: [{ id: string, name: string }]",
  groups: "Array of group names for organizational structure",
  observationInvalidationReasons: "Array of valid reasons for invalidating observations",
  chargebeeEnvironments: "Array of Chargebee environment names",
  customNotificationTypes: "Array of custom notification type names",
  hasConnectedMedplum: "Whether Medplum FHIR integration is connected",
  customPortalLoginEmailSubject: "Custom subject line for portal login emails",
  customPortalLoginEmailHTML: "Custom HTML content for portal login emails",
  customerIOFields: "Array of Customer.io field names to sync",
  customerIOIdField: "Customer.io field name to use as unique identifier",
  createEnduserForms: "Array of form IDs to automatically create for new endusers",
  creditCount: "Number of credits available for this organization",
  creditTrialStartedAt: "Date when credit trial started",
  hasIntegrations: "Array of integration names that are enabled",
  outOfOfficeHours: `Array of out-of-office time blocks. Each block has the structure:

{
  from: Date,        // Start time of out-of-office period (ISO string)
  to: Date,          // End time of out-of-office period (ISO string)
  autoreplyText: string  // Custom autoreply message for this time block
}`,
  incomingCallDisplayFields: "Array of field names to display on incoming calls",
  skipActivePatientBilling: "Skip billing for active patients",
} as const;

// ============================================================================
// Helper Function
// ============================================================================

/**
 * Builds JSON Schema properties for Organization updatable fields
 */
export const buildOrganizationUpdateProperties = () => ({
  inboxThreadsBuiltFrom: {
    type: "string" as const,
    description: ORGANIZATION_DESCRIPTIONS.inboxThreadsBuiltFrom,
  },
  inboxThreadsBuiltTo: {
    type: "string" as const,
    description: ORGANIZATION_DESCRIPTIONS.inboxThreadsBuiltTo,
  },
  bedrockAIAllowed: {
    type: "boolean" as const,
    description: ORGANIZATION_DESCRIPTIONS.bedrockAIAllowed,
  },
  subdomains: {
    type: "array" as const,
    items: { type: "string" as const },
    description: ORGANIZATION_DESCRIPTIONS.subdomains,
  },
  owner: {
    type: "string" as const,
    description: ORGANIZATION_DESCRIPTIONS.owner,
  },
  timezone: {
    type: "string" as const,
    description: ORGANIZATION_DESCRIPTIONS.timezone,
  },
  roles: {
    type: "array" as const,
    items: { type: "string" as const },
    description: ORGANIZATION_DESCRIPTIONS.roles,
  },
  skills: {
    type: "array" as const,
    items: { type: "string" as const },
    description: ORGANIZATION_DESCRIPTIONS.skills,
  },
  logoVersion: {
    type: "number" as const,
    description: ORGANIZATION_DESCRIPTIONS.logoVersion,
  },
  faviconVersion: {
    type: "number" as const,
    description: ORGANIZATION_DESCRIPTIONS.faviconVersion,
  },
  themeColor: {
    type: "string" as const,
    description: ORGANIZATION_DESCRIPTIONS.themeColor,
  },
  themeColorSecondary: {
    type: "string" as const,
    description: ORGANIZATION_DESCRIPTIONS.themeColorSecondary,
  },
  customPortalURL: {
    type: "string" as const,
    description: ORGANIZATION_DESCRIPTIONS.customPortalURL,
  },
  customPortalURLs: {
    type: "array" as const,
    items: { type: "string" as const },
    description: ORGANIZATION_DESCRIPTIONS.customPortalURLs,
  },
  customProviderURL: {
    type: "string" as const,
    description: ORGANIZATION_DESCRIPTIONS.customProviderURL,
  },
  customTermsOfService: {
    type: "string" as const,
    description: ORGANIZATION_DESCRIPTIONS.customTermsOfService,
  },
  customPrivacyPolicy: {
    type: "string" as const,
    description: ORGANIZATION_DESCRIPTIONS.customPrivacyPolicy,
  },
  customPolicies: {
    type: "array" as const,
    items: {
      type: "object" as const,
      properties: {
        title: { type: "string" as const },
        url: { type: "string" as const },
      },
      required: ["title" as const, "url" as const],
    },
    description: ORGANIZATION_DESCRIPTIONS.customPolicies,
  },
  customPoliciesVersion: {
    type: "string" as const,
    description: ORGANIZATION_DESCRIPTIONS.customPoliciesVersion,
  },
  requireCustomTermsOnMagicLink: {
    type: "boolean" as const,
    description: ORGANIZATION_DESCRIPTIONS.requireCustomTermsOnMagicLink,
  },
  settings: {
    type: "object" as const,
    description: ORGANIZATION_DESCRIPTIONS.settings,
  },
  portalSettings: {
    type: "object" as const,
    description: ORGANIZATION_DESCRIPTIONS.portalSettings,
  },
  enduserDisplayName: {
    type: "string" as const,
    description: ORGANIZATION_DESCRIPTIONS.enduserDisplayName,
  },
  parentOrganizationId: {
    type: "string" as const,
    description: ORGANIZATION_DESCRIPTIONS.parentOrganizationId,
  },
  hasCustomBusinessSubdomain: {
    type: "boolean" as const,
    description: ORGANIZATION_DESCRIPTIONS.hasCustomBusinessSubdomain,
  },
  callForwardingNumber: {
    type: "string" as const,
    description: ORGANIZATION_DESCRIPTIONS.callForwardingNumber,
  },
  customAutoreplyMessage: {
    type: "string" as const,
    description: ORGANIZATION_DESCRIPTIONS.customAutoreplyMessage,
  },
  externalCalendarEventPlaceholderTitle: {
    type: "string" as const,
    description: ORGANIZATION_DESCRIPTIONS.externalCalendarEventPlaceholderTitle,
  },
  externalCalendarEventPlaceholderDescription: {
    type: "string" as const,
    description: ORGANIZATION_DESCRIPTIONS.externalCalendarEventPlaceholderDescription,
  },
  customZoomEmailTemplate: {
    type: "string" as const,
    description: ORGANIZATION_DESCRIPTIONS.customZoomEmailTemplate,
  },
  customZoomEmailSubject: {
    type: "string" as const,
    description: ORGANIZATION_DESCRIPTIONS.customZoomEmailSubject,
  },
  customZoomSMSTemplate: {
    type: "string" as const,
    description: ORGANIZATION_DESCRIPTIONS.customZoomSMSTemplate,
  },
  customVoicemailText: {
    type: "string" as const,
    description: ORGANIZATION_DESCRIPTIONS.customVoicemailText,
  },
  hasConnectedOpenAI: {
    type: "boolean" as const,
    description: ORGANIZATION_DESCRIPTIONS.hasConnectedOpenAI,
  },
  hasConnectedHealthie: {
    type: "boolean" as const,
    description: ORGANIZATION_DESCRIPTIONS.hasConnectedHealthie,
  },
  hasConnectedElation: {
    type: "boolean" as const,
    description: ORGANIZATION_DESCRIPTIONS.hasConnectedElation,
  },
  hasConnectedIterable: {
    type: "boolean" as const,
    description: ORGANIZATION_DESCRIPTIONS.hasConnectedIterable,
  },
  hasConnectedZendesk: {
    type: "boolean" as const,
    description: ORGANIZATION_DESCRIPTIONS.hasConnectedZendesk,
  },
  hasConnectedZus: {
    type: "boolean" as const,
    description: ORGANIZATION_DESCRIPTIONS.hasConnectedZus,
  },
  hasConnectedCanvas: {
    type: "boolean" as const,
    description: ORGANIZATION_DESCRIPTIONS.hasConnectedCanvas,
  },
  canvasURL: {
    type: "string" as const,
    description: ORGANIZATION_DESCRIPTIONS.canvasURL,
  },
  hasConnectedCandid: {
    type: "boolean" as const,
    description: ORGANIZATION_DESCRIPTIONS.hasConnectedCandid,
  },
  hasConnectedGoGoMeds: {
    type: "boolean" as const,
    description: ORGANIZATION_DESCRIPTIONS.hasConnectedGoGoMeds,
  },
  hasConnectedPagerDuty: {
    type: "boolean" as const,
    description: ORGANIZATION_DESCRIPTIONS.hasConnectedPagerDuty,
  },
  hasConnectedSmartMeter: {
    type: "boolean" as const,
    description: ORGANIZATION_DESCRIPTIONS.hasConnectedSmartMeter,
  },
  hasConnectedAthena: {
    type: "boolean" as const,
    description: ORGANIZATION_DESCRIPTIONS.hasConnectedAthena,
  },
  hasConnectedActiveCampaign: {
    type: "boolean" as const,
    description: ORGANIZATION_DESCRIPTIONS.hasConnectedActiveCampaign,
  },
  hasConnectedDocsumo: {
    type: "boolean" as const,
    description: ORGANIZATION_DESCRIPTIONS.hasConnectedDocsumo,
  },
  hasConnectedEmotii: {
    type: "boolean" as const,
    description: ORGANIZATION_DESCRIPTIONS.hasConnectedEmotii,
  },
  hasConnectedDevelopHealth: {
    type: "boolean" as const,
    description: ORGANIZATION_DESCRIPTIONS.hasConnectedDevelopHealth,
  },
  hasConnectedCustomerIO: {
    type: "boolean" as const,
    description: ORGANIZATION_DESCRIPTIONS.hasConnectedCustomerIO,
  },
  hasConnectedSuperDial: {
    type: "boolean" as const,
    description: ORGANIZATION_DESCRIPTIONS.hasConnectedSuperDial,
  },
  hasConnectedBeluga: {
    type: "boolean" as const,
    description: ORGANIZATION_DESCRIPTIONS.hasConnectedBeluga,
  },
  hasConnectedMetriport: {
    type: "boolean" as const,
    description: ORGANIZATION_DESCRIPTIONS.hasConnectedMetriport,
  },
  hasConnectedPaubox: {
    type: "boolean" as const,
    description: ORGANIZATION_DESCRIPTIONS.hasConnectedPaubox,
  },
  hasConfiguredZoom: {
    type: "boolean" as const,
    description: ORGANIZATION_DESCRIPTIONS.hasConfiguredZoom,
  },
  hasTicketQueues: {
    type: "boolean" as const,
    description: ORGANIZATION_DESCRIPTIONS.hasTicketQueues,
  },
  vitalTeamId: {
    type: "string" as const,
    description: ORGANIZATION_DESCRIPTIONS.vitalTeamId,
  },
  altVitalTeamIds: {
    type: "array" as const,
    items: {
      type: "object" as const,
      properties: {
        teamId: { type: "string" as const },
        label: { type: "string" as const },
      },
      required: ["teamId" as const, "label" as const],
    },
    description: ORGANIZATION_DESCRIPTIONS.altVitalTeamIds,
  },
  zendeskSettings: {
    type: "object" as const,
    description: ORGANIZATION_DESCRIPTIONS.zendeskSettings,
  },
  replyToAllEmails: {
    type: "string" as const,
    description: ORGANIZATION_DESCRIPTIONS.replyToAllEmails,
  },
  replyToEnduserTransactionalEmails: {
    type: "string" as const,
    description: ORGANIZATION_DESCRIPTIONS.replyToEnduserTransactionalEmails,
  },
  forwardAllIncomingEmailsTo: {
    type: "string" as const,
    description: ORGANIZATION_DESCRIPTIONS.forwardAllIncomingEmailsTo,
  },
  numCustomTypes: {
    type: "number" as const,
    description: ORGANIZATION_DESCRIPTIONS.numCustomTypes,
  },
  ticketThreadsEnabled: {
    type: "boolean" as const,
    description: ORGANIZATION_DESCRIPTIONS.ticketThreadsEnabled,
  },
  _groupChatsEnabled: {
    type: "boolean" as const,
    description: ORGANIZATION_DESCRIPTIONS._groupChatsEnabled,
  },
  allowCreateSuborganizations: {
    type: "boolean" as const,
    description: ORGANIZATION_DESCRIPTIONS.allowCreateSuborganizations,
  },
  allowCallerId: {
    type: "boolean" as const,
    description: ORGANIZATION_DESCRIPTIONS.allowCallerId,
  },
  billingOrganizationName: {
    type: "string" as const,
    description: ORGANIZATION_DESCRIPTIONS.billingOrganizationName,
  },
  billingOrganizationNPI: {
    type: "string" as const,
    description: ORGANIZATION_DESCRIPTIONS.billingOrganizationNPI,
  },
  billingOrganizationTaxId: {
    type: "string" as const,
    description: ORGANIZATION_DESCRIPTIONS.billingOrganizationTaxId,
  },
  billingOrganizationAddress: {
    type: "object" as const,
    description: ORGANIZATION_DESCRIPTIONS.billingOrganizationAddress,
  },
  videoCallBackgroundImage: {
    type: "string" as const,
    description: ORGANIZATION_DESCRIPTIONS.videoCallBackgroundImage,
  },
  sendToVoicemailOOO: {
    type: "boolean" as const,
    description: ORGANIZATION_DESCRIPTIONS.sendToVoicemailOOO,
  },
  forwardingOOONumber: {
    type: "string" as const,
    description: ORGANIZATION_DESCRIPTIONS.forwardingOOONumber,
  },
  onCallUserIds: {
    type: "array" as const,
    items: { type: "string" as const },
    description: ORGANIZATION_DESCRIPTIONS.onCallUserIds,
  },
  outOfOfficeVoicemail: {
    type: "object" as const,
    description: ORGANIZATION_DESCRIPTIONS.outOfOfficeVoicemail,
  },
  enduserProfileWebhooks: {
    type: "array" as const,
    items: { type: "object" as const },
    description: ORGANIZATION_DESCRIPTIONS.enduserProfileWebhooks,
  },
  showCommunity: {
    type: "boolean" as const,
    description: ORGANIZATION_DESCRIPTIONS.showCommunity,
  },
  phoneLabels: {
    type: "array" as const,
    items: {
      type: "object" as const,
      properties: {
        number: { type: "string" as const },
        label: { type: "string" as const },
      },
      required: ["number" as const, "label" as const],
    },
    description: ORGANIZATION_DESCRIPTIONS.phoneLabels,
  },
  mfaxAccountId: {
    type: "string" as const,
    description: ORGANIZATION_DESCRIPTIONS.mfaxAccountId,
  },
  athenaFieldsSync: {
    type: "array" as const,
    items: { type: "object" as const },
    description: ORGANIZATION_DESCRIPTIONS.athenaFieldsSync,
  },
  athenaSubscriptions: {
    type: "array" as const,
    items: { type: "object" as const },
    description: ORGANIZATION_DESCRIPTIONS.athenaSubscriptions,
  },
  athenaDepartments: {
    type: "array" as const,
    items: {
      type: "object" as const,
      properties: {
        id: { type: "string" as const },
        timezone: { type: "string" as const },
      },
      required: ["id" as const, "timezone" as const],
    },
    description: ORGANIZATION_DESCRIPTIONS.athenaDepartments,
  },
  fieldsToAdminNote: {
    type: "array" as const,
    items: { type: "string" as const },
    description: ORGANIZATION_DESCRIPTIONS.fieldsToAdminNote,
  },
  canvasMessageSync: {
    type: "object" as const,
    description: ORGANIZATION_DESCRIPTIONS.canvasMessageSync,
  },
  canvasSyncEmailConsent: {
    type: "boolean" as const,
    description: ORGANIZATION_DESCRIPTIONS.canvasSyncEmailConsent,
  },
  canvasSyncPhoneConsent: {
    type: "boolean" as const,
    description: ORGANIZATION_DESCRIPTIONS.canvasSyncPhoneConsent,
  },
  dosespotClinics: {
    type: "array" as const,
    items: {
      type: "object" as const,
      properties: {
        id: { type: "string" as const },
        name: { type: "string" as const },
      },
      required: ["id" as const, "name" as const],
    },
    description: ORGANIZATION_DESCRIPTIONS.dosespotClinics,
  },
  answersSyncToPortal: {
    type: "array" as const,
    items: {
      type: "object" as const,
      properties: {
        id: { type: "string" as const },
        questions: {
          type: "array" as const,
          items: { type: "string" as const },
        },
      },
      required: ["id" as const, "questions" as const],
    },
    description: ORGANIZATION_DESCRIPTIONS.answersSyncToPortal,
  },
  externalFormIdsToSync: {
    type: "array" as const,
    items: { type: "string" as const },
    description: ORGANIZATION_DESCRIPTIONS.externalFormIdsToSync,
  },
  enforceMFA: {
    type: "boolean" as const,
    description: ORGANIZATION_DESCRIPTIONS.enforceMFA,
  },
  analyticsIframes: {
    type: "array" as const,
    items: {
      type: "object" as const,
      properties: {
        title: { type: "string" as const },
        iframeURL: { type: "string" as const },
      },
      required: ["title" as const, "iframeURL" as const],
    },
    description: ORGANIZATION_DESCRIPTIONS.analyticsIframes,
  },
  stripePublicKeys: {
    type: "array" as const,
    items: { type: "string" as const },
    description: ORGANIZATION_DESCRIPTIONS.stripePublicKeys,
  },
  stripeKeyDetails: {
    type: "array" as const,
    items: { type: "object" as const },
    description: ORGANIZATION_DESCRIPTIONS.stripeKeyDetails,
  },
  metriportIntegrationDetails: {
    type: "array" as const,
    items: { type: "object" as const },
    description: ORGANIZATION_DESCRIPTIONS.metriportIntegrationDetails,
  },
  additionalIterableKeys: {
    type: "array" as const,
    items: { type: "string" as const },
    description: ORGANIZATION_DESCRIPTIONS.additionalIterableKeys,
  },
  defaultDoseSpotPharmacies: {
    type: "array" as const,
    items: {
      type: "object" as const,
      properties: {
        id: { type: "string" as const },
        name: { type: "string" as const },
      },
      required: ["id" as const, "name" as const],
    },
    description: ORGANIZATION_DESCRIPTIONS.defaultDoseSpotPharmacies,
  },
  groups: {
    type: "array" as const,
    items: { type: "string" as const },
    description: ORGANIZATION_DESCRIPTIONS.groups,
  },
  observationInvalidationReasons: {
    type: "array" as const,
    items: { type: "string" as const },
    description: ORGANIZATION_DESCRIPTIONS.observationInvalidationReasons,
  },
  chargebeeEnvironments: {
    type: "array" as const,
    items: { type: "string" as const },
    description: ORGANIZATION_DESCRIPTIONS.chargebeeEnvironments,
  },
  customNotificationTypes: {
    type: "array" as const,
    items: { type: "string" as const },
    description: ORGANIZATION_DESCRIPTIONS.customNotificationTypes,
  },
  hasConnectedMedplum: {
    type: "boolean" as const,
    description: ORGANIZATION_DESCRIPTIONS.hasConnectedMedplum,
  },
  customPortalLoginEmailSubject: {
    type: "string" as const,
    description: ORGANIZATION_DESCRIPTIONS.customPortalLoginEmailSubject,
  },
  customPortalLoginEmailHTML: {
    type: "string" as const,
    description: ORGANIZATION_DESCRIPTIONS.customPortalLoginEmailHTML,
  },
  customerIOFields: {
    type: "array" as const,
    items: { type: "string" as const },
    description: ORGANIZATION_DESCRIPTIONS.customerIOFields,
  },
  customerIOIdField: {
    type: "string" as const,
    description: ORGANIZATION_DESCRIPTIONS.customerIOIdField,
  },
  createEnduserForms: {
    type: "array" as const,
    items: { type: "string" as const },
    description: ORGANIZATION_DESCRIPTIONS.createEnduserForms,
  },
  creditCount: {
    type: "number" as const,
    description: ORGANIZATION_DESCRIPTIONS.creditCount,
  },
  creditTrialStartedAt: {
    type: "string" as const,
    description: ORGANIZATION_DESCRIPTIONS.creditTrialStartedAt,
  },
  hasIntegrations: {
    type: "array" as const,
    items: { type: "string" as const },
    description: ORGANIZATION_DESCRIPTIONS.hasIntegrations,
  },
  outOfOfficeHours: {
    type: "array" as const,
    items: { type: "object" as const },
    description: ORGANIZATION_DESCRIPTIONS.outOfOfficeHours,
  },
  incomingCallDisplayFields: {
    type: "array" as const,
    items: { type: "string" as const },
    description: ORGANIZATION_DESCRIPTIONS.incomingCallDisplayFields,
  },
  skipActivePatientBilling: {
    type: "boolean" as const,
    description: ORGANIZATION_DESCRIPTIONS.skipActivePatientBilling,
  },
});

// ============================================================================
// Zod Schemas (Internal)
// ============================================================================

const organizationUpdatesSchema = z.object({
  inboxThreadsBuiltFrom: z.string().optional().describe(ORGANIZATION_DESCRIPTIONS.inboxThreadsBuiltFrom),
  inboxThreadsBuiltTo: z.string().optional().describe(ORGANIZATION_DESCRIPTIONS.inboxThreadsBuiltTo),
  bedrockAIAllowed: z.boolean().optional().describe(ORGANIZATION_DESCRIPTIONS.bedrockAIAllowed),
  subdomains: z.array(z.string()).optional().describe(ORGANIZATION_DESCRIPTIONS.subdomains),
  owner: z.string().optional().describe(ORGANIZATION_DESCRIPTIONS.owner),
  timezone: z.string().optional().describe(ORGANIZATION_DESCRIPTIONS.timezone),
  roles: z.array(z.string()).optional().describe(ORGANIZATION_DESCRIPTIONS.roles),
  skills: z.array(z.string()).optional().describe(ORGANIZATION_DESCRIPTIONS.skills),
  logoVersion: z.number().optional().describe(ORGANIZATION_DESCRIPTIONS.logoVersion),
  faviconVersion: z.number().optional().describe(ORGANIZATION_DESCRIPTIONS.faviconVersion),
  themeColor: z.string().optional().describe(ORGANIZATION_DESCRIPTIONS.themeColor),
  themeColorSecondary: z.string().optional().describe(ORGANIZATION_DESCRIPTIONS.themeColorSecondary),
  customPortalURL: z.string().optional().describe(ORGANIZATION_DESCRIPTIONS.customPortalURL),
  customPortalURLs: z.array(z.string()).optional().describe(ORGANIZATION_DESCRIPTIONS.customPortalURLs),
  customProviderURL: z.string().optional().describe(ORGANIZATION_DESCRIPTIONS.customProviderURL),
  customTermsOfService: z.string().optional().describe(ORGANIZATION_DESCRIPTIONS.customTermsOfService),
  customPrivacyPolicy: z.string().optional().describe(ORGANIZATION_DESCRIPTIONS.customPrivacyPolicy),
  customPolicies: z.array(z.object({ title: z.string(), url: z.string() })).optional().describe(ORGANIZATION_DESCRIPTIONS.customPolicies),
  customPoliciesVersion: z.string().optional().describe(ORGANIZATION_DESCRIPTIONS.customPoliciesVersion),
  requireCustomTermsOnMagicLink: z.boolean().optional().describe(ORGANIZATION_DESCRIPTIONS.requireCustomTermsOnMagicLink),
  settings: z.record(z.any()).optional().describe(ORGANIZATION_DESCRIPTIONS.settings),
  portalSettings: z.record(z.any()).optional().describe(ORGANIZATION_DESCRIPTIONS.portalSettings),
  enduserDisplayName: z.string().optional().describe(ORGANIZATION_DESCRIPTIONS.enduserDisplayName),
  parentOrganizationId: z.string().optional().describe(ORGANIZATION_DESCRIPTIONS.parentOrganizationId),
  hasCustomBusinessSubdomain: z.boolean().optional().describe(ORGANIZATION_DESCRIPTIONS.hasCustomBusinessSubdomain),
  callForwardingNumber: z.string().optional().describe(ORGANIZATION_DESCRIPTIONS.callForwardingNumber),
  customAutoreplyMessage: z.string().optional().describe(ORGANIZATION_DESCRIPTIONS.customAutoreplyMessage),
  externalCalendarEventPlaceholderTitle: z.string().optional().describe(ORGANIZATION_DESCRIPTIONS.externalCalendarEventPlaceholderTitle),
  externalCalendarEventPlaceholderDescription: z.string().optional().describe(ORGANIZATION_DESCRIPTIONS.externalCalendarEventPlaceholderDescription),
  customZoomEmailTemplate: z.string().optional().describe(ORGANIZATION_DESCRIPTIONS.customZoomEmailTemplate),
  customZoomEmailSubject: z.string().optional().describe(ORGANIZATION_DESCRIPTIONS.customZoomEmailSubject),
  customZoomSMSTemplate: z.string().optional().describe(ORGANIZATION_DESCRIPTIONS.customZoomSMSTemplate),
  customVoicemailText: z.string().optional().describe(ORGANIZATION_DESCRIPTIONS.customVoicemailText),
  hasConnectedOpenAI: z.boolean().optional().describe(ORGANIZATION_DESCRIPTIONS.hasConnectedOpenAI),
  hasConnectedHealthie: z.boolean().optional().describe(ORGANIZATION_DESCRIPTIONS.hasConnectedHealthie),
  hasConnectedElation: z.boolean().optional().describe(ORGANIZATION_DESCRIPTIONS.hasConnectedElation),
  hasConnectedIterable: z.boolean().optional().describe(ORGANIZATION_DESCRIPTIONS.hasConnectedIterable),
  hasConnectedZendesk: z.boolean().optional().describe(ORGANIZATION_DESCRIPTIONS.hasConnectedZendesk),
  hasConnectedZus: z.boolean().optional().describe(ORGANIZATION_DESCRIPTIONS.hasConnectedZus),
  hasConnectedCanvas: z.boolean().optional().describe(ORGANIZATION_DESCRIPTIONS.hasConnectedCanvas),
  canvasURL: z.string().optional().describe(ORGANIZATION_DESCRIPTIONS.canvasURL),
  hasConnectedCandid: z.boolean().optional().describe(ORGANIZATION_DESCRIPTIONS.hasConnectedCandid),
  hasConnectedGoGoMeds: z.boolean().optional().describe(ORGANIZATION_DESCRIPTIONS.hasConnectedGoGoMeds),
  hasConnectedPagerDuty: z.boolean().optional().describe(ORGANIZATION_DESCRIPTIONS.hasConnectedPagerDuty),
  hasConnectedSmartMeter: z.boolean().optional().describe(ORGANIZATION_DESCRIPTIONS.hasConnectedSmartMeter),
  hasConnectedAthena: z.boolean().optional().describe(ORGANIZATION_DESCRIPTIONS.hasConnectedAthena),
  hasConnectedActiveCampaign: z.boolean().optional().describe(ORGANIZATION_DESCRIPTIONS.hasConnectedActiveCampaign),
  hasConnectedDocsumo: z.boolean().optional().describe(ORGANIZATION_DESCRIPTIONS.hasConnectedDocsumo),
  hasConnectedEmotii: z.boolean().optional().describe(ORGANIZATION_DESCRIPTIONS.hasConnectedEmotii),
  hasConnectedDevelopHealth: z.boolean().optional().describe(ORGANIZATION_DESCRIPTIONS.hasConnectedDevelopHealth),
  hasConnectedCustomerIO: z.boolean().optional().describe(ORGANIZATION_DESCRIPTIONS.hasConnectedCustomerIO),
  hasConnectedSuperDial: z.boolean().optional().describe(ORGANIZATION_DESCRIPTIONS.hasConnectedSuperDial),
  hasConnectedBeluga: z.boolean().optional().describe(ORGANIZATION_DESCRIPTIONS.hasConnectedBeluga),
  hasConnectedMetriport: z.boolean().optional().describe(ORGANIZATION_DESCRIPTIONS.hasConnectedMetriport),
  hasConnectedPaubox: z.boolean().optional().describe(ORGANIZATION_DESCRIPTIONS.hasConnectedPaubox),
  hasConfiguredZoom: z.boolean().optional().describe(ORGANIZATION_DESCRIPTIONS.hasConfiguredZoom),
  hasTicketQueues: z.boolean().optional().describe(ORGANIZATION_DESCRIPTIONS.hasTicketQueues),
  vitalTeamId: z.string().optional().describe(ORGANIZATION_DESCRIPTIONS.vitalTeamId),
  altVitalTeamIds: z.array(z.object({ teamId: z.string(), label: z.string() })).optional().describe(ORGANIZATION_DESCRIPTIONS.altVitalTeamIds),
  zendeskSettings: z.record(z.any()).optional().describe(ORGANIZATION_DESCRIPTIONS.zendeskSettings),
  replyToAllEmails: z.string().optional().describe(ORGANIZATION_DESCRIPTIONS.replyToAllEmails),
  replyToEnduserTransactionalEmails: z.string().optional().describe(ORGANIZATION_DESCRIPTIONS.replyToEnduserTransactionalEmails),
  forwardAllIncomingEmailsTo: z.string().optional().describe(ORGANIZATION_DESCRIPTIONS.forwardAllIncomingEmailsTo),
  numCustomTypes: z.number().optional().describe(ORGANIZATION_DESCRIPTIONS.numCustomTypes),
  ticketThreadsEnabled: z.boolean().optional().describe(ORGANIZATION_DESCRIPTIONS.ticketThreadsEnabled),
  _groupChatsEnabled: z.boolean().optional().describe(ORGANIZATION_DESCRIPTIONS._groupChatsEnabled),
  allowCreateSuborganizations: z.boolean().optional().describe(ORGANIZATION_DESCRIPTIONS.allowCreateSuborganizations),
  allowCallerId: z.boolean().optional().describe(ORGANIZATION_DESCRIPTIONS.allowCallerId),
  billingOrganizationName: z.string().optional().describe(ORGANIZATION_DESCRIPTIONS.billingOrganizationName),
  billingOrganizationNPI: z.string().optional().describe(ORGANIZATION_DESCRIPTIONS.billingOrganizationNPI),
  billingOrganizationTaxId: z.string().optional().describe(ORGANIZATION_DESCRIPTIONS.billingOrganizationTaxId),
  billingOrganizationAddress: z.record(z.any()).optional().describe(ORGANIZATION_DESCRIPTIONS.billingOrganizationAddress),
  videoCallBackgroundImage: z.string().optional().describe(ORGANIZATION_DESCRIPTIONS.videoCallBackgroundImage),
  sendToVoicemailOOO: z.boolean().optional().describe(ORGANIZATION_DESCRIPTIONS.sendToVoicemailOOO),
  forwardingOOONumber: z.string().optional().describe(ORGANIZATION_DESCRIPTIONS.forwardingOOONumber),
  onCallUserIds: z.array(z.string()).optional().describe(ORGANIZATION_DESCRIPTIONS.onCallUserIds),
  outOfOfficeVoicemail: z.record(z.any()).optional().describe(ORGANIZATION_DESCRIPTIONS.outOfOfficeVoicemail),
  enduserProfileWebhooks: z.array(z.record(z.any())).optional().describe(ORGANIZATION_DESCRIPTIONS.enduserProfileWebhooks),
  showCommunity: z.boolean().optional().describe(ORGANIZATION_DESCRIPTIONS.showCommunity),
  phoneLabels: z.array(z.object({ number: z.string(), label: z.string() })).optional().describe(ORGANIZATION_DESCRIPTIONS.phoneLabels),
  mfaxAccountId: z.string().optional().describe(ORGANIZATION_DESCRIPTIONS.mfaxAccountId),
  athenaFieldsSync: z.array(z.record(z.any())).optional().describe(ORGANIZATION_DESCRIPTIONS.athenaFieldsSync),
  athenaSubscriptions: z.array(z.record(z.any())).optional().describe(ORGANIZATION_DESCRIPTIONS.athenaSubscriptions),
  athenaDepartments: z.array(z.object({ id: z.string(), timezone: z.string() })).optional().describe(ORGANIZATION_DESCRIPTIONS.athenaDepartments),
  fieldsToAdminNote: z.array(z.string()).optional().describe(ORGANIZATION_DESCRIPTIONS.fieldsToAdminNote),
  canvasMessageSync: z.record(z.any()).optional().describe(ORGANIZATION_DESCRIPTIONS.canvasMessageSync),
  canvasSyncEmailConsent: z.boolean().optional().describe(ORGANIZATION_DESCRIPTIONS.canvasSyncEmailConsent),
  canvasSyncPhoneConsent: z.boolean().optional().describe(ORGANIZATION_DESCRIPTIONS.canvasSyncPhoneConsent),
  dosespotClinics: z.array(z.object({ id: z.string(), name: z.string() })).optional().describe(ORGANIZATION_DESCRIPTIONS.dosespotClinics),
  answersSyncToPortal: z.array(z.object({ id: z.string(), questions: z.array(z.string()) })).optional().describe(ORGANIZATION_DESCRIPTIONS.answersSyncToPortal),
  externalFormIdsToSync: z.array(z.string()).optional().describe(ORGANIZATION_DESCRIPTIONS.externalFormIdsToSync),
  enforceMFA: z.boolean().optional().describe(ORGANIZATION_DESCRIPTIONS.enforceMFA),
  analyticsIframes: z.array(z.object({ title: z.string(), iframeURL: z.string() })).optional().describe(ORGANIZATION_DESCRIPTIONS.analyticsIframes),
  stripePublicKeys: z.array(z.string()).optional().describe(ORGANIZATION_DESCRIPTIONS.stripePublicKeys),
  stripeKeyDetails: z.array(z.record(z.any())).optional().describe(ORGANIZATION_DESCRIPTIONS.stripeKeyDetails),
  metriportIntegrationDetails: z.array(z.record(z.any())).optional().describe(ORGANIZATION_DESCRIPTIONS.metriportIntegrationDetails),
  additionalIterableKeys: z.array(z.string()).optional().describe(ORGANIZATION_DESCRIPTIONS.additionalIterableKeys),
  defaultDoseSpotPharmacies: z.array(z.object({ id: z.string(), name: z.string() })).optional().describe(ORGANIZATION_DESCRIPTIONS.defaultDoseSpotPharmacies),
  groups: z.array(z.string()).optional().describe(ORGANIZATION_DESCRIPTIONS.groups),
  observationInvalidationReasons: z.array(z.string()).optional().describe(ORGANIZATION_DESCRIPTIONS.observationInvalidationReasons),
  chargebeeEnvironments: z.array(z.string()).optional().describe(ORGANIZATION_DESCRIPTIONS.chargebeeEnvironments),
  customNotificationTypes: z.array(z.string()).optional().describe(ORGANIZATION_DESCRIPTIONS.customNotificationTypes),
  hasConnectedMedplum: z.boolean().optional().describe(ORGANIZATION_DESCRIPTIONS.hasConnectedMedplum),
  customPortalLoginEmailSubject: z.string().optional().describe(ORGANIZATION_DESCRIPTIONS.customPortalLoginEmailSubject),
  customPortalLoginEmailHTML: z.string().optional().describe(ORGANIZATION_DESCRIPTIONS.customPortalLoginEmailHTML),
  customerIOFields: z.array(z.string()).optional().describe(ORGANIZATION_DESCRIPTIONS.customerIOFields),
  customerIOIdField: z.string().optional().describe(ORGANIZATION_DESCRIPTIONS.customerIOIdField),
  createEnduserForms: z.array(z.string()).optional().describe(ORGANIZATION_DESCRIPTIONS.createEnduserForms),
  creditCount: z.number().optional().describe(ORGANIZATION_DESCRIPTIONS.creditCount),
  creditTrialStartedAt: z.string().optional().describe(ORGANIZATION_DESCRIPTIONS.creditTrialStartedAt),
  hasIntegrations: z.array(z.string()).optional().describe(ORGANIZATION_DESCRIPTIONS.hasIntegrations),
  outOfOfficeHours: z.array(z.record(z.any())).optional().describe(ORGANIZATION_DESCRIPTIONS.outOfOfficeHours),
  incomingCallDisplayFields: z.array(z.string()).optional().describe(ORGANIZATION_DESCRIPTIONS.incomingCallDisplayFields),
  skipActivePatientBilling: z.boolean().optional().describe(ORGANIZATION_DESCRIPTIONS.skipActivePatientBilling),
});

// ============================================================================
// Exported Schemas for Registry
// ============================================================================

export const organizationSchemas = {
  update: createUpdateOneSchema(organizationUpdatesSchema),
};

// ============================================================================
// Tool Definitions
// ============================================================================

export const organizationTools = [
  {
    name: "organizations_update_one",
    description: "Update an existing organization by ID in Tellescope. Returns the updated organization object.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "The unique ID of the organization to update",
        },
        updates: {
          type: "object",
          description: "Organization update data - all fields are optional",
          properties: buildOrganizationUpdateProperties(),
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
