# MCP Convention Documentation Pattern

## Problem Statement

Complex API patterns like `enduserCondition` are reused across many resource types (FormFields, AutomationSteps, AutomationTriggers, etc.). These patterns have intricate structures that are difficult to document inline in field descriptions without making them overwhelming.

### The Challenge

The `condition` field in FormField's `compoundLogic` previousField type uses MongoDB-style query syntax:

```typescript
{
  "compoundLogic": {
    "fieldId": "previous_field_id",
    "priority": 1,
    "label": "Show for VIP members",
    "condition": {
      "$and": [
        {
          "condition": {
            "tags": "vip",
            "state": { "$in": ["CA", "NY"] }
          }
        }
      ]
    }
  }
}
```

How do we help AI tools understand this structure without:
1. Duplicating documentation across every resource that uses it?
2. Making field descriptions too long and cluttered?
3. Losing the details that make the pattern actually useful?

## Solution: Convention Documentation Tool

We've implemented a **dedicated MCP tool** that serves reusable API convention documentation on-demand.

### Architecture

1. **Comprehensive Documentation File**: [docs/mcp-conventions.md](../docs/mcp-conventions.md)
   - Detailed explanation of the pattern
   - Structure and syntax
   - Multiple examples
   - Common pitfalls
   - Best practices

2. **MCP Tool to Retrieve Documentation**: `get_api_conventions`
   ```typescript
   {
     name: "get_api_conventions",
     description: "Get documentation about reusable API patterns and conventions...",
     inputSchema: {
       type: "object",
       properties: {
         topic: {
           type: "string",
           enum: ["enduser-conditions", "all"],
           description: "Specific convention topic or 'all' for complete documentation",
         },
       },
     },
   }
   ```

3. **References in Field Descriptions**
   - Field descriptions are kept concise
   - They reference the convention tool for details
   - Example:
     ```typescript
     "The 'condition' field uses the enduserCondition pattern - use get_api_conventions tool for detailed documentation."
     ```

### Implementation

The handler reads the markdown file and returns it directly:

```typescript
// In CallToolRequestSchema handler
if (toolName === "get_api_conventions") {
  const fs = await import("fs/promises");
  const path = await import("path");

  const conventionsPath = path.join(__dirname, "../../docs/mcp-conventions.md");
  const content = await fs.readFile(conventionsPath, "utf-8");

  return {
    content: [{ type: "text", text: content }],
  };
}
```

## Benefits

### 1. **DRY (Don't Repeat Yourself)**
- Single source of truth for pattern documentation
- Used by FormFields, AutomationSteps, AutomationTriggers, etc.
- Update once, available everywhere

### 2. **On-Demand Loading**
- AI tools only fetch documentation when needed
- Doesn't clutter every API call with full docs
- Reduces token usage when not needed

### 3. **Rich, Detailed Documentation**
- Can include extensive examples
- Multiple use cases
- Best practices and common pitfalls
- References to MongoDB operators
- Not constrained by field description character limits

### 4. **Discoverable**
- Tool appears in MCP tool list
- Clear description tells AI when to use it
- Field descriptions hint at when to consult it

### 5. **Maintainable**
- Markdown format is easy to edit
- Can be version controlled
- Can include code examples with syntax highlighting
- Can link to external resources

## Usage Pattern

### For AI Tools (like Claude Code)

1. **Initial Field Creation**: AI sees field description mentioning `enduserCondition` pattern
2. **Fetch Documentation**: AI calls `get_api_conventions` tool
3. **Understand Structure**: AI reads comprehensive documentation with examples
4. **Generate Code**: AI uses learned pattern to create correct structure
5. **Reuse Knowledge**: Pattern knowledge applies to all resources using it

### Example Workflow

```
User: "Create a form field that only shows for VIP patients in California"

Claude Code:
1. Sees previousFields supports 'compoundLogic' type
2. Reads description: "use get_api_conventions tool for condition structure details"
3. Calls get_api_conventions tool
4. Receives full documentation about enduserCondition pattern
5. Learns structure: { "$and": [{ "condition": { ... } }] }
6. Generates correct code:

await session.api.form_fields.createOne({
  // ... other fields
  previousFields: [{
    type: "compoundLogic",
    info: {
      fieldId: "previous_field_id",
      priority: 1,
      label: "VIP patients in California",
      condition: {
        "$and": [
          { "condition": { "tags": "vip" } },
          { "condition": { "state": "CA" } }
        ]
      }
    }
  }]
});
```

## Extensibility

### Adding New Conventions

As the API grows, new reusable patterns can be added:

1. **Document the Pattern**
   - Add new section to `mcp-conventions.md`
   - Include structure, examples, best practices

2. **Update Tool Enum** (optional)
   ```typescript
   enum: ["enduser-conditions", "filter-queries", "webhook-payloads", "all"]
   ```

3. **Reference in Field Descriptions**
   - Keep descriptions concise
   - Point to `get_api_conventions` tool

### Example: Filter Query Pattern

Could add documentation for:
- MongoDB query operators in `filter` parameters
- Nested field access with dot notation
- Performance optimization tips
- Index-aware query patterns

## Alternative Approaches Considered

### ❌ Embedding Full Documentation in Field Descriptions
**Problem**: Field descriptions become too long, cluttering the schema and wasting tokens

### ❌ External URL Links
**Problem**: Requires network access, breaks offline usage, can't be versioned with code

### ❌ Hardcoded Schema Examples
**Problem**: Examples are static, can't cover all use cases, difficult to maintain

### ✅ MCP Documentation Tool (Chosen)
**Advantages**: On-demand, comprehensive, maintainable, reusable, version-controlled

## Best Practices

### For Documentation Writers

1. **Use Clear Section Headers**: Make it easy to scan
2. **Provide Multiple Examples**: Cover common and complex cases
3. **Include Anti-Patterns**: Show what NOT to do
4. **Link Related Concepts**: Cross-reference other patterns
5. **Keep It Updated**: Update when API changes

### For Field Descriptions

1. **Mention the Pattern Name**: "uses the enduserCondition pattern"
2. **Reference the Tool**: "use get_api_conventions tool for details"
3. **Provide Brief Context**: Don't leave AI completely in the dark
4. **Stay Concise**: Full details belong in conventions doc

### For AI Tool Developers

1. **Cache Documentation**: Don't fetch on every use
2. **Parse Structure Examples**: Extract reusable templates
3. **Validate Against Patterns**: Check generated code matches documented structure
4. **Provide Helpful Errors**: Reference conventions when validation fails

## Future Enhancements

### 1. Topic-Specific Retrieval
Currently returns full document. Could support:
```typescript
{ topic: "enduser-conditions" } // Returns just that section
{ topic: "filter-queries" }     // Returns different section
{ topic: "all" }                 // Returns everything
```

### 2. Searchable Index
Provide a tool to search conventions by keyword or use case

### 3. Code Templates
Return executable code templates that can be filled in:
```typescript
{
  name: "get_convention_template",
  parameters: {
    pattern: "enduser-condition-vip-only"
  }
}
// Returns ready-to-use code snippet
```

### 4. Validation Tool
Verify a structure matches a documented pattern:
```typescript
{
  name: "validate_convention",
  parameters: {
    pattern: "enduser-condition",
    structure: { /* user's attempt */ }
  }
}
// Returns validation errors or success
```

## Conclusion

The MCP Convention Documentation Tool pattern provides a **scalable, maintainable way** to share complex API patterns with AI tools. It keeps field descriptions clean while providing rich, detailed documentation exactly when needed.

This pattern is **reusable** for any complex, cross-cutting API concern and creates a **better developer experience** for both humans and AI.
