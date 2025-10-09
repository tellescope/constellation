# Add MCP Type Command

**Command:** `/add-mcp-type`

**Purpose:** Generate create and update MCP tools for a new Tellescope model type following established best practices.

## Workflow

### Step 1: Gather Required Information

**CRITICAL:** You MUST confirm these details with the user BEFORE proceeding:

1. **Model Type Name** (e.g., `templates`, `journeys`, `automation_steps`)
   - What is the exact model name as it appears in the SDK? (e.g., `session.api.templates`)

2. **Reference Type Path** (e.g., `/Users/sebastiancoates/tellescope`)
   - What is a path to a project which includes the type definition?

3. **Type Interface Name** (e.g., `MessageTemplate`, `Journey`, `AutomationStep`)
   - What is the exact TypeScript interface name for this type?

**Example interaction:**

```
User: /add-mcp-type
Assistant: I'll help you add MCP create and update tools for a new model type. First, I need some information:

1. What is the model name as it appears in the SDK? (e.g., 'templates', 'journeys', 'automation_steps')
2. What is the full path to the TypeScript file containing the type definition?
3. What is the exact TypeScript interface name? (e.g., 'MessageTemplate', 'Journey')

User: templates, /Users/sebastiancoates/tellescope/packages/public/types-models/src/index.ts, MessageTemplate
```

**Do NOT proceed to Step 2 until you have confirmed all three pieces of information.**

---

### Step 2: Read and Analyze Type Definition

Once you have confirmed the model name, file path, and interface name:

1. **Read the reference file** at the provided path
2. **Locate the interface definition** for the specified type
3. **Identify all properties** including:
   - Required vs. optional fields
   - Field types (string, number, boolean, enums, arrays, objects, unions)
   - Enum values if applicable
   - Nested object structures
4. **Identify related enums or type aliases** used by the interface

**Example:**

```typescript
// Read from reference file
export interface MessageTemplate {
  id: string;
  organizationId: string;
  title: string;
  type: 'email' | 'sms' | 'chat';
  message?: string;
  subject?: string;
  htmlBody?: string;
  // ... etc
}
```

---

### Step 3: Create Type-Specific File

Create a new file in `src/mcp/types/` following the pattern of `form_fields.ts`:

**File naming:** Use snake_case matching the model name (e.g., `templates.ts`, `automation_steps.ts`)

**File location:** `/Users/sebastiancoates/constellation/src/mcp/types/<model_name>.ts`

---

### Step 4: Generate Constants Following Established Patterns

In the new type file, create constants following the `FORM_FIELD_DESCRIPTIONS` pattern established for FormFields:

**File structure:**

```typescript
import { z } from "zod";
import { createCreateOneSchema, createUpdateOneSchema } from "./_utilities";

// 1. Constants (descriptions, enums)
// 2. Helper function for JSON Schema properties
// 3. Zod schemas (create and update)
// 4. Export wrapped schemas for registry
// 5. Export tool definitions
```

#### 4.1: Create Descriptions Constant

```typescript
// Pattern: export const <MODEL_NAME>_DESCRIPTIONS
export const MESSAGE_TEMPLATE_DESCRIPTIONS = {
  title: "The title/name of the template for internal reference",
  type: "The channel type: 'email', 'sms', or 'chat'",
  message: "Plain text message content (used for SMS and chat)",
  subject: "Email subject line (only used when type is 'email')",
  htmlBody: "HTML email body (only used when type is 'email')",
  // ... all other fields with clear, concise descriptions
} as const;
```

**Guidelines for descriptions:**
- Be specific about the field's purpose and usage
- Include valid values for enums
- Note when fields are conditional (e.g., "only used when type is X")
- Explain relationships between fields (e.g., "references the ID from...")
- Use natural language, not code syntax

#### 4.2: Create Type Constants for Enums

```typescript
// Pattern: export const <MODEL_NAME>_<FIELD_NAME>_TYPES or <MODEL_NAME>_TYPES if single enum
export const MESSAGE_TEMPLATE_TYPES = ['email', 'sms', 'chat'] as const;
```

**When to create:**
- For any union literal types (e.g., `'email' | 'sms' | 'chat'`)
- For enums with multiple values
- Store as `as const` arrays for type safety

#### 4.3: Create Nested Object Type Constants (if applicable)

```typescript
// Pattern: export const <PARENT_TYPE>_<NESTED_FIELD>_<SUB_FIELD>_TYPES
// Example: If template has { reminders: Array<{ type: 'email' | 'sms' }> }
export const MESSAGE_TEMPLATE_REMINDER_TYPES = ['email', 'sms'] as const;
```

---

### Step 5: Generate Helper Function

Create a helper function following the `buildFormFieldProperties()` pattern:

```typescript
// Pattern: export const build<ModelName>Properties(isUpdate = false)
export const buildMessageTemplateProperties = (isUpdate = false) => ({
  title: {
    type: "string" as const,
    description: MESSAGE_TEMPLATE_DESCRIPTIONS.title
  },
  type: {
    type: "string" as const,
    enum: MESSAGE_TEMPLATE_TYPES,
    description: MESSAGE_TEMPLATE_DESCRIPTIONS.type
  },
  message: {
    type: "string" as const,
    description: MESSAGE_TEMPLATE_DESCRIPTIONS.message
  },
  subject: {
    type: "string" as const,
    description: MESSAGE_TEMPLATE_DESCRIPTIONS.subject
  },
  htmlBody: {
    type: "string" as const,
    description: MESSAGE_TEMPLATE_DESCRIPTIONS.htmlBody
  },
  // ... all other fields
});
```

**Guidelines:**
- Use `type: "string" as const` for proper TypeScript inference
- Use `enum: CONSTANT_ARRAY` for union literal types
- Use `type: "object" as const` for nested objects
- Use `type: "array" as const` with `items` property for arrays
- Include all fields from the interface
- Don't include read-only fields like `id`, `organizationId`, `createdAt`, `updatedAt`

**Common JSON Schema types mapping:**
- `string` → `type: "string" as const`
- `number` → `type: "number" as const`
- `boolean` → `type: "boolean" as const`
- `string[]` → `type: "array" as const, items: { type: "string" as const }`
- `{ foo: string }` → `type: "object" as const, properties: { foo: { type: "string" as const } }`
- `'a' | 'b'` → `type: "string" as const, enum: ['a', 'b']`

---

### Step 6: Generate Zod Schemas

Create Zod validation schemas using the constants (not exported - internal to the file):

```typescript
// Create schema using constants (internal)
const messageTemplateDataSchema = z.object({
  title: z.string().describe(MESSAGE_TEMPLATE_DESCRIPTIONS.title),
  type: z.enum(MESSAGE_TEMPLATE_TYPES).describe(MESSAGE_TEMPLATE_DESCRIPTIONS.type),
  message: z.string().optional().describe(MESSAGE_TEMPLATE_DESCRIPTIONS.message),
  subject: z.string().optional().describe(MESSAGE_TEMPLATE_DESCRIPTIONS.subject),
  htmlBody: z.string().optional().describe(MESSAGE_TEMPLATE_DESCRIPTIONS.htmlBody),
  // ... all other fields
});

const messageTemplateUpdatesSchema = messageTemplateDataSchema.partial();
```

**Guidelines:**
- Use `.describe()` to reference description constants
- Use `z.string()`, `z.number()`, `z.boolean()` for primitives
- Use `z.enum()` for union literal types with the constant array
- Use `.optional()` for optional fields
- Use `z.array()` for arrays
- Use `z.object()` for nested objects
- Create update schema with `.partial()` on the create schema
- Don't include read-only fields like `id`, `organizationId`, `createdAt`, `updatedAt` in create/update schemas

**Common Zod type mapping:**
- `string` → `z.string()`
- `number` → `z.number()`
- `boolean` → `z.boolean()`
- `string[]` → `z.array(z.string())`
- `{ foo: string }` → `z.object({ foo: z.string() })`
- `'a' | 'b'` → `z.enum(['a', 'b'])` with constant
- `string | null` → `z.string().nullable()`
- `string | undefined` → `z.string().optional()`
- `string | null | undefined` → `z.string().nullable().optional()`

---

### Step 7: Export Wrapped Schemas and Tools

At the end of the type file, export the schemas wrapped with the utility functions and the tool definitions:

```typescript
// Export wrapped schemas for registry
export const messageTemplateSchemas = {
  create: createCreateOneSchema(messageTemplateDataSchema),
  update: createUpdateOneSchema(messageTemplateUpdatesSchema),
};

// Export tool definitions
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
        required: ["title", "type"], // List required fields
      },
    },
    required: ["data"],
  },
  },
  {
    name: "templates_update_one",
    description: "Update an existing message template in Tellescope by ID. Returns the updated template object.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "The unique ID of the message template to update",
        },
        updates: {
          type: "object",
          description: "Message template fields to update (partial)",
          properties: buildMessageTemplateProperties(true),
        },
      },
      required: ["id", "updates"],
    },
  },
];
```

**Guidelines:**
- Tool names follow pattern: `<model_name>_create_one`, `<model_name>_update_one`
- Use `buildXProperties(false)` for create, `buildXProperties(true)` for update
- Create tool wraps data in `{ data: { ... } }`
- Update tool takes `{ id: string, updates: { ... } }`
- List `required` fields based on the actual type definition
- Use clear descriptions for each tool

**Required fields:**
- Check the TypeScript interface for required (non-optional) fields
- Exclude read-only fields like `id`, `organizationId`
- Example: If interface has `title: string` (required) and `subject?: string` (optional), only `title` goes in required array

---

### Step 8: Update Main MCP Server File

Now update `/Users/sebastiancoates/constellation/src/mcp/index.ts` to import and use the new type:

#### 8.1: Add Import

At the top of `index.ts`, add the import:

```typescript
import { messageTemplateSchemas, messageTemplateTools } from "./types/templates";
```

#### 8.2: Add Tools to Tools Array

In the `ListToolsRequestSchema` handler, add the tools using spread operator:

```typescript
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    // ... existing tools ...
    ...formFieldTools,
    ...messageTemplateTools, // Add this line
    // ... more tools ...
  ],
}));
```

#### 8.3: Add Schema Registry Entry

In the `modelSchemas` registry, add the new entry:

```typescript
const modelSchemas: Record<string, {
  create?: z.ZodType<any>;
  update?: z.ZodType<any>;
}> = {
  form_fields: formFieldSchemas,
  templates: messageTemplateSchemas, // Add this line
  // Add more models here as they're implemented
};
```

---

### Step 9: Verify and Test

1. **Run TypeScript compiler:**
   ```bash
   npx tsc --noEmit
   ```

2. **Fix any type errors**

3. **Verify the implementation:**
   - Constants are properly defined with `as const`
   - Helper function returns proper JSON Schema structure
   - Zod schemas use constants for descriptions
   - JSON Schema tools use helper function
   - Registry entry is added
   - No duplication of descriptions

---

## Best Practices Checklist

Before completing, verify:

- [ ] Constants defined for all descriptions (`<MODEL>_DESCRIPTIONS`)
- [ ] Constants defined for all enums (`<MODEL>_<FIELD>_TYPES`)
- [ ] Helper function created (`build<ModelName>Properties(isUpdate)`)
- [ ] Zod schemas use constants (`.describe(CONSTANT.field)`)
- [ ] JSON Schema tools use helper (`buildXProperties(false/true)`)
- [ ] Schema registry entry added
- [ ] No duplicated description strings
- [ ] All fields from interface included (except read-only)
- [ ] Required fields correctly identified
- [ ] TypeScript build passes (`npx tsc --noEmit`)
- [ ] Clear, concise field descriptions
- [ ] Proper type mappings (Zod and JSON Schema)

---

## File Organization

**New modular structure:**

1. **Type-specific files:** `/Users/sebastiancoates/constellation/src/mcp/types/<model_name>.ts`
   - Each model type gets its own file
   - Contains: constants, helper function, Zod schemas, wrapped schemas export, tool definitions export

2. **Utilities:** `/Users/sebastiancoates/constellation/src/mcp/types/_utilities.ts`
   - Shared factory functions: `createCreateOneSchema`, `createUpdateOneSchema`
   - Already implemented - no changes needed

3. **Main server:** `/Users/sebastiancoates/constellation/src/mcp/index.ts`
   - Imports type definitions from type files
   - Spreads tool arrays into tools list
   - Registers schemas in `modelSchemas` registry
   - Generic handlers already implemented - work for any model type

**Benefits:**
- Each type is self-contained in its own file
- Main server file stays clean and minimal
- Easy to add new types without touching existing code
- Clear separation of concerns

---

## Example Complete Implementation

See the FormField implementation in `/Users/sebastiancoates/constellation/src/mcp/types/form_fields.ts` for a complete reference:

**In `form_fields.ts`:**
- `FORM_FIELD_DESCRIPTIONS` - exported constant
- `FORM_FIELD_TYPES` - exported constant
- `PREVIOUS_FIELD_TYPES` - exported constant
- `buildFormFieldProperties()` - exported helper function
- `formFieldDataSchema` - internal Zod schema
- `formFieldUpdatesSchema` - internal Zod schema
- `formFieldSchemas` - exported wrapped schemas for registry
- `formFieldTools` - exported tool definitions array

**In `index.ts`:**
- Import: `import { formFieldSchemas, formFieldTools } from "./types/form_fields"`
- Tools: `...formFieldTools` in tools array
- Registry: `form_fields: formFieldSchemas`

---

## Common Patterns by Field Type

### String Enums / Union Literals

**TypeScript:**
```typescript
type: 'email' | 'sms' | 'chat'
```

**Constant:**
```typescript
const MESSAGE_TEMPLATE_TYPES = ['email', 'sms', 'chat'] as const;
```

**Zod:**
```typescript
type: z.enum(MESSAGE_TEMPLATE_TYPES).describe(DESCRIPTIONS.type)
```

**JSON Schema (via helper):**
```typescript
type: { type: "string" as const, enum: MESSAGE_TEMPLATE_TYPES, description: DESCRIPTIONS.type }
```

### Optional Fields

**TypeScript:**
```typescript
subject?: string
```

**Zod:**
```typescript
subject: z.string().optional().describe(DESCRIPTIONS.subject)
```

**JSON Schema (via helper):**
```typescript
subject: { type: "string" as const, description: DESCRIPTIONS.subject }
// Not marked as required in the tool's required array
```

### Arrays

**TypeScript:**
```typescript
tags?: string[]
```

**Zod:**
```typescript
tags: z.array(z.string()).optional().describe(DESCRIPTIONS.tags)
```

**JSON Schema (via helper):**
```typescript
tags: {
  type: "array" as const,
  items: { type: "string" as const },
  description: DESCRIPTIONS.tags
}
```

### Nested Objects

**TypeScript:**
```typescript
reminders?: Array<{ type: 'email' | 'sms'; offsetMs: number; }>
```

**Constants:**
```typescript
const REMINDER_TYPES = ['email', 'sms'] as const;
```

**Zod:**
```typescript
reminders: z.array(
  z.object({
    type: z.enum(REMINDER_TYPES),
    offsetMs: z.number(),
  })
).optional().describe(DESCRIPTIONS.reminders)
```

**JSON Schema (via helper):**
```typescript
reminders: {
  type: "array" as const,
  description: DESCRIPTIONS.reminders,
  items: {
    type: "object" as const,
    properties: {
      type: { type: "string" as const, enum: REMINDER_TYPES },
      offsetMs: { type: "number" as const },
    },
    required: ["type", "offsetMs"],
  },
}
```

### Union Types (Non-Literal)

**TypeScript:**
```typescript
value: string | number
```

**Zod:**
```typescript
value: z.union([z.string(), z.number()]).describe(DESCRIPTIONS.value)
```

**JSON Schema (via helper):**
```typescript
value: {
  description: DESCRIPTIONS.value,
  // JSON Schema doesn't have clean union support, document in description
  // Or use oneOf: [{ type: "string" }, { type: "number" }]
}
```

### Records/Dictionaries

**TypeScript:**
```typescript
customFields?: Record<string, any>
```

**Zod:**
```typescript
customFields: z.record(z.any()).optional().describe(DESCRIPTIONS.customFields)
```

**JSON Schema (via helper):**
```typescript
customFields: {
  type: "object" as const,
  description: DESCRIPTIONS.customFields,
  additionalProperties: true,
}
```

---

## Error Prevention

### Common Mistakes to Avoid

❌ **Duplicating description strings:**
```typescript
// BAD
const schema = z.object({
  title: z.string().describe("The title of the template"),
});
// ... later ...
properties: {
  title: { type: "string", description: "The title of the template" }
}
```

✅ **Use constants:**
```typescript
// GOOD
const DESCRIPTIONS = {
  title: "The title of the template",
} as const;

const schema = z.object({
  title: z.string().describe(DESCRIPTIONS.title),
});

properties: {
  title: { type: "string", description: DESCRIPTIONS.title }
}
```

---

❌ **Forgetting `as const` on constants:**
```typescript
// BAD - loses literal types
const TYPES = ['email', 'sms'];
```

✅ **Always use `as const`:**
```typescript
// GOOD - preserves literal types
const TYPES = ['email', 'sms'] as const;
```

---

❌ **Including read-only fields in create/update schemas:**
```typescript
// BAD
const schema = z.object({
  id: z.string(), // ❌ read-only
  organizationId: z.string(), // ❌ read-only
  createdAt: z.string(), // ❌ read-only
  title: z.string(),
});
```

✅ **Exclude read-only fields:**
```typescript
// GOOD
const schema = z.object({
  title: z.string(),
  // id, organizationId, createdAt are set by server
});
```

---

❌ **Missing required fields in tool definition:**
```typescript
// BAD - title is required but not listed
properties: {
  data: {
    type: "object",
    properties: buildProps(false),
    required: [], // ❌ title should be here
  }
}
```

✅ **List all required fields:**
```typescript
// GOOD
properties: {
  data: {
    type: "object",
    properties: buildProps(false),
    required: ["title", "type"], // ✅
  }
}
```

---

❌ **Not using helper function in tools:**
```typescript
// BAD - duplicates property definitions
{
  name: "templates_create_one",
  inputSchema: {
    properties: {
      data: {
        properties: {
          title: { type: "string", description: "..." }, // ❌ duplicated
          type: { type: "string", description: "..." },  // ❌ duplicated
        }
      }
    }
  }
}
```

✅ **Use helper function:**
```typescript
// GOOD - reuses buildMessageTemplateProperties
{
  name: "templates_create_one",
  inputSchema: {
    properties: {
      data: {
        properties: buildMessageTemplateProperties(false), // ✅
      }
    }
  }
}
```

---

## Summary

This command helps you generate MCP write tools following the established DRY patterns:

1. **Confirm** model name, file path, and interface name FIRST
2. **Read** the type definition from the reference file
3. **Create** description constants and enum constants
4. **Build** helper function for JSON Schema properties
5. **Generate** Zod schemas using constants
6. **Define** JSON Schema tools using helper
7. **Register** schemas in the registry
8. **Verify** TypeScript build passes

Follow the patterns established for FormFields, and you'll have a consistent, maintainable implementation with zero duplication.
