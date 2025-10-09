# MCP Interaction Guide

## Purpose

You interact directly with Tellescope resources via MCP (Model Context Protocol) tools. You can create, read, update, and explore resources in the user's Tellescope account in real-time.

## Session Initialization

**CRITICAL**: At the start of every MCP interaction session, you MUST check which organization/account the user is working with:

1. **Call `organizations_get_page` without parameters** (it will return the user's accessible organizations)
2. **Take the LAST organization in the returned list** - this is the active organization for the current API key
3. **Display the organization name to the user** in a friendly format:
   - "Working with organization: **[Organization Name]**"
   - If multiple organizations are returned, show: "You have access to X organizations. Active: **[Organization Name]**"

### Why This Matters

- Users may have multiple API keys for different Tellescope accounts
- The active organization determines which resources you'll be working with
- Showing this upfront prevents confusion and mistakes
- It confirms the API key is configured correctly

### Recommended Allowlist Pattern

To avoid requiring user approval for this initial check, users should add this to their VSCode Claude Code extension settings:

```
mcp__tellescope__organizations_get_page
```

See "Configuring Tool Allowlists" section below for instructions on how to add this.

## Important: MCP Filter Syntax

**MCP tools use native MongoDB operators with `$` prefix** (e.g., `$exists`, `$in`, `$gt`).

This is different from the SDK's `filter` parameter which uses `_` prefix (e.g., `_exists`, `_in`, `_gt`). When using MCP tools, always use the `$` syntax.

## Using the explain_concept Tool

**CRITICAL**: Before using advanced features like `replaceObjectFields`, `enduserConditions`, `mdbFilter`, or date range filtering, you MUST call the `explain_concept` tool to understand correct usage.

### Why Use This Tool?

1. **Avoid data loss**: `replaceObjectFields` can delete data if used incorrectly
2. **Understand syntax**: MongoDB operators use `$` prefix, not `_` prefix
3. **Learn best practices**: Each concept includes examples and common pitfalls
4. **Context efficiency**: Load detailed documentation only when needed

### Available Concepts

Use `list_concepts` to see all available concepts, then call `explain_concept` with the specific concept name:

```typescript
// First, list available concepts
list_concepts()

// Then, get detailed documentation for a specific concept
explain_concept({ concept: "replaceObjectFields" })
explain_concept({ concept: "enduserFiltering" })
explain_concept({ concept: "mdbFilter" })
explain_concept({ concept: "dateRangeFiltering" })
```

### When to Call explain_concept

**ALWAYS call BEFORE**:
- Using `options.replaceObjectFields` in any updateOne call
- Setting `enduserConditions` or `enduserCondition` in AutomationSteps/Triggers
- Using `mdbFilter` for complex queries
- Using `from`/`to` date range parameters

**Pattern**:
```
User: "Update the patient's custom field"
You:
1. Call explain_concept({ concept: "replaceObjectFields" })
2. Read and understand the merge vs replace behavior
3. Fetch existing resource
4. Perform update with correct options
```

## Core Capabilities

### Reading Resources
Use MCP tools to fetch and explore existing configuration:
- Get single resources by ID: `templates_get_one`, `forms_get_one`, `journeys_get_one`, etc.
- Get paginated lists: `templates_get_page`, `forms_get_page`, `automation_steps_get_page`, etc.
- Filter and search: Use `mdbFilter` parameters with MongoDB-style queries

### Creating Resources
Use MCP tools to create new resources directly:
- Create forms: `forms_create_one`, `form_fields_create_one`
- Create templates: `templates_create_one`
- Create journeys: `journeys_create_one`, `automation_steps_create_one`, `automation_triggers_create_one`
- Create calendar resources: `calendar_event_templates_create_one`, `appointment_locations_create_one`, `appointment_booking_pages_create_one`
- Create databases: `databases_create_one`, `database_records_create_one`

### Updating Resources
Use MCP tools to modify existing resources:
- Update forms: `forms_update_one`, `form_fields_update_one`
- Update templates: `templates_update_one`
- Update journeys: `journeys_update_one`, `automation_steps_update_one`, `automation_triggers_update_one`
- Update calendar: `calendar_event_templates_update_one`, `appointment_locations_update_one`, `appointment_booking_pages_update_one`
- Update databases: `databases_update_one`, `database_records_update_one`

**CRITICAL**: All `_update_one` tools support an `options` parameter with `replaceObjectFields` setting. You MUST call `explain_concept({ concept: "replaceObjectFields" })` BEFORE using this parameter to avoid accidental data loss.

### Exploring Account Configuration
- Read organization settings: `organizations_get_one`
- List users: `users_get_page`
- Explore forms and fields: Read forms, then read their fields
- Map journey workflows: Read journey, then fetch its automation steps
- Understand template usage: Search for templates by tags or channels

## Best Practices

### 1. Read Before Acting
Always fetch existing resources to understand current state before making changes:
```
User: "Update the welcome email"
You:
1. Call templates_get_page with mdbFilter: { title: 'welcome' }
2. Review existing template
3. Ask user what to change
4. Call templates_update_one with changes
```

### 2. Understand Dependencies
When exploring resources, follow the dependency chain:
```
Journey → AutomationSteps → Templates/Forms
Forms → FormFields
BookingPage → CalendarEventTemplates → AppointmentLocations
```

### 3. Use Filters Effectively
Use MongoDB-style filters to narrow results:
```typescript
// Find active journeys with specific tag
mdbFilter: { tags: 'onboarding', archivedAt: { $exists: false } }

// Find forms by type
mdbFilter: { type: 'enduserFacing' }

// Find templates for email channel
mdbFilter: { forChannels: 'Email' }
```

### 4. Handle Pagination
When listing resources, use `lastId` for pagination:
```
1. Call get_page with limit: 25
2. If more results exist, use lastId from last item
3. Call get_page again with lastId
```

### 5. Use Date Range Parameters for Time Filtering
For filtering by creation or update time, use dedicated parameters:
```typescript
// Get forms created in January 2024
forms_get_page({
  from: '2024-01-01',
  to: '2024-01-31T23:59:59Z'
})

// Get templates updated in the last 7 days
templates_get_page({
  fromUpdated: '2024-01-15',
  toUpdated: '2024-01-22'
})

// Get appointments by appointment date
calendar_events_get_page({
  from: '2024-02-01',
  to: '2024-02-29',
  fromToField: 'startTime'
})
```

### 6. Validate Before Creating
Check for existing resources to avoid duplicates:
```
1. Search for existing resource by title/name
2. If found, ask user if they want to update or create new
3. Proceed accordingly
```

## Common Workflows

### Workflow 1: Explore Existing Configuration
```
User: "What forms do I have?"
You:
1. Call forms_get_page
2. Present list of forms with titles and types
3. Offer to show details on specific forms
```

### Workflow 2: Update Existing Resource
```
User: "Add a field to my intake form"
You:
1. Call forms_get_page with mdbFilter: { title: { $regex: 'intake' } }
2. Present matching forms, confirm which one
3. Call form_fields_get_page with mdbFilter: { formId: 'selected-form-id' }
4. Show existing fields
5. Ask what field to add
6. Call form_fields_create_one with new field
7. Confirm success
```

### Workflow 3: Create New Resource
```
User: "Create a reminder email template"
You:
1. Ask for template details (subject, content, etc.)
2. Call templates_create_one
3. Return created template ID
4. Ask if they want to use it in any journeys
```

### Workflow 4: Map Complex Workflow
```
User: "Show me how my onboarding journey works"
You:
1. Call journeys_get_page with mdbFilter: { title: { $regex: 'onboarding' } }
2. Call automation_steps_get_page with mdbFilter: { journeyId: 'journey-id' }
3. For each step, fetch referenced resources:
   - If sendEmail action: fetch template
   - If sendForm action: fetch form
4. Present complete workflow map
```

### Workflow 5: Create Multi-Resource Setup
```
User: "Create a feedback form and email template"
You:
1. Create form: Call forms_create_one
2. Add fields: Call form_fields_create_one for each field
3. Create template: Call templates_create_one
4. Link them: Explain how to reference form in automation
```

## API Conventions

### Enduser Filtering Pattern

Many resources support filtering by enduser (patient) properties using `enduserCondition` or `enduserConditions` fields.

**When you need detailed documentation on this pattern**, call the explain_concept tool:
```
explain_concept({ concept: "enduserFiltering" })
```

This returns comprehensive documentation on:
- MongoDB-style query syntax
- Available operators ($and, $or, $gt, $exists, $in, etc.)
- Standard enduser fields (tags, fname, email, state, etc.)
- Custom field references
- Complete examples with best practices

**Quick reference** (for details, call explain_concept):
```typescript
// Example: Filter for VIP patients in California
enduserConditions: {
  "$and": [
    { "condition": { "tags": "vip" } },
    { "condition": { "state": "CA" } }
  ]
}
```

### Filter Query Pattern

When using `get_page` methods, you can filter results with MongoDB-style queries and date range parameters:

```typescript
// Existence check
mdbFilter: { fname: { $exists: true } }

// Array membership
mdbFilter: { tags: { $in: ['vip', 'premium'] } }

// Multiple conditions (implicit AND)
mdbFilter: {
  type: 'enduserFacing',
  archivedAt: { $exists: false }
}

// Date range filtering (use from/to parameters, NOT mdbFilter)
from: '2024-01-01T00:00:00Z',
to: '2024-12-31T23:59:59Z'
// By default filters by createdAt

// Date range on different field
from: '2024-01-01',
to: '2024-12-31',
fromToField: 'appointmentDate'

// Filter by updatedAt instead
fromUpdated: '2024-01-01',
toUpdated: '2024-12-31'
```

**Important**:
- MCP tools use native MongoDB `$` prefix operators (`$exists`, `$gt`, `$in`), NOT SDK-style `_` prefix operators
- For date range filtering, use dedicated `from`/`to` parameters instead of `mdbFilter` with `$gt`/`$lt`

## Understanding replaceObjectFields

The `options.replaceObjectFields` parameter controls how updates behave for **object fields** and **arrays**. This is **CRITICAL** to understand to avoid accidental data loss.

**Quick Summary**:
- **Default (false)**: Merge behavior - adds to existing data (safe)
- **True**: Replace behavior - complete replacement, deletes unmentioned data (dangerous)

**IMPORTANT**: Before using `replaceObjectFields`, you MUST call:
```
explain_concept({ concept: "replaceObjectFields" })
```

This will provide:
- Detailed merge vs. replace behavior explanation
- When to use each option
- Critical warnings about object subfield updates
- Real-world examples and decision tree
- Common pitfalls to avoid

**Never** use `replaceObjectFields: true` without first reading the complete documentation via `explain_concept`.

## Tool Organization

### Documentation Tools
- `list_concepts` - List all available API concepts with brief descriptions
- `explain_concept` - Get detailed documentation for a specific concept (replaceObjectFields, enduserFiltering, mdbFilter, dateRangeFiltering)

**CRITICAL**: Always call these tools BEFORE using advanced features to avoid errors and data loss.

### Resource Read Tools (Get One)
- `templates_get_one` - Fetch single template by ID
- `forms_get_one` - Fetch single form by ID
- `form_fields_get_one` - Fetch single form field by ID
- `journeys_get_one` - Fetch single journey by ID
- `automation_steps_get_one` - Fetch single automation step by ID
- `automation_triggers_get_one` - Fetch single automation trigger by ID
- `calendar_event_templates_get_one` - Fetch single appointment type by ID
- `appointment_locations_get_one` - Fetch single location by ID
- `appointment_booking_pages_get_one` - Fetch single booking page by ID
- `databases_get_one` - Fetch single database by ID
- `database_records_get_one` - Fetch single database record by ID
- `managed_content_records_get_one` - Fetch single content record by ID
- `products_get_one` - Fetch single product by ID
- `organizations_get_one` - Fetch organization settings by ID
- `users_get_one` - Fetch single user by ID

### Resource List Tools (Get Page)
- `templates_get_page` - List templates with pagination
- `forms_get_page` - List forms with pagination
- `form_fields_get_page` - List form fields with pagination
- `journeys_get_page` - List journeys with pagination
- `automation_steps_get_page` - List automation steps with pagination
- `automation_triggers_get_page` - List automation triggers with pagination
- `calendar_event_templates_get_page` - List appointment types with pagination
- `appointment_locations_get_page` - List locations with pagination
- `appointment_booking_pages_get_page` - List booking pages with pagination
- `databases_get_page` - List databases with pagination
- `database_records_get_page` - List database records with pagination
- `managed_content_records_get_page` - List content records with pagination
- `products_get_page` - List products with pagination
- `organizations_get_page` - List organizations with pagination
- `users_get_page` - List users with pagination

### Resource Create Tools
- `templates_create_one` - Create new message template
- `forms_create_one` - Create new form
- `form_fields_create_one` - Create new form field
- `journeys_create_one` - Create new journey
- `automation_steps_create_one` - Create new automation step
- `automation_triggers_create_one` - Create new automation trigger
- `calendar_event_templates_create_one` - Create new appointment type
- `appointment_locations_create_one` - Create new location
- `appointment_booking_pages_create_one` - Create new booking page
- `databases_create_one` - Create new database
- `database_records_create_one` - Create new database record

### Resource Update Tools
- `templates_update_one` - Update existing template
- `forms_update_one` - Update existing form
- `form_fields_update_one` - Update existing form field
- `journeys_update_one` - Update existing journey
- `automation_steps_update_one` - Update existing automation step
- `automation_triggers_update_one` - Update existing automation trigger
- `calendar_event_templates_update_one` - Update existing appointment type
- `appointment_locations_update_one` - Update existing location
- `appointment_booking_pages_update_one` - Update existing booking page
- `databases_update_one` - Update existing database
- `database_records_update_one` - Update existing database record

## Key Principles

### 1. Be Exploratory
Don't assume what exists - fetch and inspect resources to understand current configuration.

### 2. Be Conversational
Ask clarifying questions when updates are ambiguous. Show users their options.

### 3. Be Accurate
Always use exact IDs, exact field names, and exact values from the API responses.

### 4. Be Helpful
Explain what you're doing, what you found, and what the changes will do.

### 5. Be Thorough
When creating complex resources (forms, journeys, booking pages), ensure all required dependencies are created or referenced correctly.

## Resource Relationships

Understanding how resources relate helps you navigate the account:

### Forms & FormFields
- 1 Form → Many FormFields
- FormFields reference formId
- FormFields use previousFields to define ordering
- Every form needs exactly 1 field with `previousFields: [{ type: 'root', info: {} }]`

### Journeys & AutomationSteps & AutomationTriggers
- 1 Journey → Many AutomationSteps
- AutomationSteps define workflow logic
- AutomationTriggers can add/remove endusers from journeys
- Steps reference other steps via events (onJourneyStart, afterAction, etc.)
- Triggers can be global (no journeyId) or journey-specific (with journeyId)

### Templates
- Used in AutomationSteps (sendEmail, sendSMS actions)
- Used in CalendarEventTemplates (reminders)
- Referenced by templateId

### Calendar Resources
- AppointmentLocation (physical or virtual locations)
- CalendarEventTemplate (appointment types, reference locations)
- AppointmentBookingPage (public booking, references templates and locations)

### Databases & DatabaseRecords
- 1 Database → Many DatabaseRecords
- Database defines schema (fields)
- DatabaseRecords store data according to schema

## Common Pitfalls

### ❌ Assuming Resource Existence
Always fetch to confirm a resource exists before referencing it.

### ❌ Ignoring Dependencies
Creating a journey step that references a template that doesn't exist will fail.

### ❌ Using Wrong Filter Syntax
Use `$exists` not `_exists`. Use `$in` not `_in`.

### ❌ Forgetting Pagination
Large accounts may have hundreds of resources - use pagination to see all.

### ❌ Hardcoding IDs
Always use IDs returned from API calls, never guess or make up IDs.

### ❌ Skipping Validation
Before creating, check for duplicates. After creating, verify success.

## Example Interactions

### Example 1: List and Explain Forms
```
User: "What forms do I have?"

You:
1. Call forms_get_page
2. Response: "You have 3 forms:
   - Patient Intake Form (enduserFacing)
   - Health Assessment (enduserFacing)
   - Staff Note Template (note)

   Would you like to see the fields on any of these?"
```

### Example 2: Update a Template
```
User: "Change the welcome email subject to 'Welcome to Our Practice'"

You:
1. Call templates_get_page with mdbFilter: { title: { $regex: 'welcome' } } (or similar)
2. Find matching template
3. Call templates_update_one with id and updates: { subject: 'Welcome to Our Practice' }
4. Response: "Updated the 'Welcome Email' template subject line."
```

### Example 3: Create Form with Fields
```
User: "Create a simple contact form with name and email"

You:
1. Call forms_create_one with title: "Contact Form", type: "enduserFacing", version: "v2"
2. Capture formId
3. Call form_fields_create_one for name field with previousFields: [{ type: 'root', info: {} }]
4. Capture nameFieldId
5. Call form_fields_create_one for email field with previousFields: [{ type: 'after', info: { fieldId: nameFieldId } }]
6. Response: "Created 'Contact Form' with name and email fields."
```

### Example 4: Map Journey Workflow
```
User: "Show me how the onboarding journey works"

You:
1. Call journeys_get_page with mdbFilter: { title: { $regex: 'onboarding' } }
2. Call automation_steps_get_page with mdbFilter: { journeyId: 'journey-id' }
3. For each step:
   - If sendEmail: call templates_get_one
   - If sendForm: call forms_get_one
4. Response: "Onboarding Journey:
   Step 1: Send 'Welcome Email' (immediately)
   Step 2: Wait 24 hours
   Step 3: Send 'Health Assessment Form'
   Step 4a: If score > 10, send 'High Risk Email'
   Step 4b: Otherwise, send 'Standard Follow-Up'"
```

### Example 5: Add Field to Existing Form
```
User: "Add a phone number field to the intake form"

You:
1. Call forms_get_page with mdbFilter: { title: { $regex: 'intake' } }
2. Confirm: "I found 'Patient Intake Form'. Is this the one?"
3. User confirms
4. Call form_fields_get_page with mdbFilter: { formId: 'form-id' }
5. Find last field in sequence
6. Call form_fields_create_one with type: 'phone', previousFields: [{ type: 'after', info: { fieldId: 'last-field-id' } }]
7. Response: "Added phone field after the email field."
```

## Advanced Usage

### Conditional Logic in Forms
When creating form fields with conditional display, you may need to reference the enduser filtering pattern:
1. Call `explain_concept({ concept: 'enduserFiltering' })` for full documentation
2. Use `compoundLogic` previousField type
3. Set condition using MongoDB-style queries

### Multi-Step Automation Flows
When building journeys:
1. Start with `onJourneyStart` step
2. Chain steps with `afterAction` events
3. Use `delayInMS` for timing
4. Branch with conditions (enduserConditions)
5. Use triggers to add/remove endusers

### Complex Booking Pages
When setting up appointment booking:
1. Create locations first
2. Create reminder templates
3. Create calendar event templates (reference templates in reminders array)
4. Create booking page (reference locations and calendar templates)

## Quick Reference

### Configuring Tool Allowlists

To enable auto-approval of specific MCP tools (like `organizations_get_page` for session initialization), configure Claude Code permissions in your `settings.json` file.

#### Where to Configure

You can configure permissions at three levels:
- **User level**: `~/.claude/settings.json` (applies to all projects)
- **Project level**: `<project-root>/.claude/settings.json` (applies to this project only)
- **Enterprise level**: Managed by your organization

#### Configuration Format

Create or edit your `settings.json` file with a `permissions` object:

```json
{
  "permissions": {
    "allow": [
      "mcp__tellescope__organizations_get_page"
    ]
  }
}
```

**Recommended allowlist for Constellation users:**

```json
{
  "permissions": {
    "allow": [
      "mcp__tellescope__organizations_get_page"
    ]
  }
}
```

This prevents interrupting the workflow with approval prompts for the session initialization check.

#### Advanced Permission Configuration

You can also use `ask` and `deny` arrays for more granular control:

```json
{
  "permissions": {
    "allow": [
      "mcp__tellescope__organizations_get_page",
      "mcp__tellescope__forms_get_page",
      "mcp__tellescope__templates_get_page"
    ],
    "ask": [
      "mcp__tellescope__*_update_one",
      "mcp__tellescope__*_create_one"
    ],
    "deny": []
  }
}
```

**Note**: Permissions are evaluated in order: `deny` → `allow` → `ask`. More specific rules override broader ones.

### MongoDB Query Operators (mdbFilter uses $ prefix)
- `$exists: true/false` - Field exists
- `$gt: value` - Greater than
- `$gte: value` - Greater than or equal
- `$lt: value` - Less than
- `$lte: value` - Less than or equal
- `$eq: value` - Equals (usually omit, just use `field: value`)
- `$ne: value` - Not equals
- `$in: [values]` - In array
- `$nin: [values]` - Not in array

**Remember**: MCP `mdbFilter` uses `$` prefix (MongoDB native), NOT `_` prefix (SDK-style).

### Common Field Names
**Enduser (patient) standard fields:**
- `fname`, `lname` - Name
- `email`, `phone` - Contact
- `dateOfBirth`, `gender`, `state` - Demographics
- `tags` - Patient tags array
- `assignedTo` - Assigned provider user ID

**Custom fields:**
- Use exact name as defined in organization settings
- Case-sensitive
- Examples: "Insurance Provider", "Risk Level", "Preferred Language"

### Form Field Types
- `'string'` - Short text
- `'stringLong'` - Long text
- `'email'` - Email with validation
- `'phone'` - Phone number
- `'number'` - Numeric input
- `'date'` - Date picker
- `'multiple_choice'` - Radio/checkboxes
- `'Dropdown'` - Dropdown select
- Many more (see tool schemas)

### AutomationStep Action Types
- `'sendEmail'` - Send email template
- `'sendSMS'` - Send SMS template
- `'sendForm'` - Send form to enduser
- `'addEnduserTags'` - Add tags to patient
- `'removeEnduserTags'` - Remove tags from patient
- `'setEnduserFields'` - Update custom fields
- `'createTicket'` - Create task for staff
- `'addToJourney'` - Add to another journey
- `'removeFromJourney'` - Remove from journey
- Many more (see tool schemas)

### AutomationTrigger Event Types
- `'Field Equals'` - When enduser field changes
- `'Form Submitted'` - When form is submitted
- `'Form Started'` - When form is started (for abandoned cart)
- `'Tag Added'` - When tag is added to enduser
- `'Appointment Booked'` - When appointment is booked
- Many more (see tool schemas)
