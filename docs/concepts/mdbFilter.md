# MongoDB Filter Query Pattern

## Overview

When using `_get_page` methods in the Tellescope MCP server, you can filter results using the `mdbFilter` parameter with **native MongoDB query syntax** (using `$` prefix operators).

**Important**: MCP tools use `mdbFilter` with MongoDB native `$` prefix operators (`$exists`, `$gt`, `$in`), which is **different** from the Tellescope SDK's `filter` parameter that uses `_` prefix operators (`_exists`, `_gt`, `_in`).

## Basic Syntax

```typescript
// Exact match (implicit $eq)
mdbFilter: { fname: "John" }

// Existence check
mdbFilter: { email: { $exists: true } }

// Array membership
mdbFilter: { tags: { $in: ["vip", "premium"] } }

// Multiple conditions (implicit $and)
mdbFilter: {
  type: "enduserFacing",
  archivedAt: { $exists: false }
}
```

## Supported MongoDB Operators

### Comparison Operators

- `$eq` - Equals (usually omit, just use `field: value`)
- `$ne` - Not equals
- `$gt` - Greater than
- `$gte` - Greater than or equal
- `$lt` - Less than
- `$lte` - Less than or equal

### Array Operators

- `$in` - Value is in array of options
- `$nin` - Value is not in array of options

### Element Operators

- `$exists` - Field exists (true) or doesn't exist (false)

### Logical Operators

- `$and` - All conditions must match
- `$or` - At least one condition must match
- `$not` - Negates a condition
- `$nor` - None of the conditions match

## Examples

### Example 1: Find Active Forms

```typescript
forms_get_page({
  mdbFilter: {
    type: "enduserFacing",
    archivedAt: { $exists: false }
  }
})
```

### Example 2: Find Templates by Channel

```typescript
templates_get_page({
  mdbFilter: {
    forChannels: "Email",
    hideFromCompose: { $ne: true }
  }
})
```

### Example 3: Find High-Priority or Overdue Tickets

```typescript
tickets_get_page({
  mdbFilter: {
    $or: [
      { priority: { $gte: 8 } },
      { dueDate: { $lt: "2024-01-20" } }
    ]
  }
})
```

### Example 4: Find Journeys with Specific Tags

```typescript
journeys_get_page({
  mdbFilter: {
    tags: { $in: ["onboarding", "follow-up"] },
    archivedAt: { $exists: false }
  }
})
```

### Example 5: Complex Multi-Condition Query

```typescript
automation_steps_get_page({
  mdbFilter: {
    journeyId: "journey-123",
    $or: [
      { "action.type": "sendEmail" },
      { "action.type": "sendSMS" }
    ],
    tags: { $nin: ["deprecated"] }
  }
})
```

## Common Use Cases

### Find Resources by Title (Pattern Matching)

```typescript
forms_get_page({
  mdbFilter: {
    title: { $regex: "intake", $options: "i" }  // Case-insensitive search
  }
})
```

### Find Resources with Specific Tag

```typescript
journeys_get_page({
  mdbFilter: {
    tags: "high-priority"  // Single tag membership
  }
})
```

### Find Resources NOT Archived

```typescript
templates_get_page({
  mdbFilter: {
    archivedAt: { $exists: false }
  }
})
```

### Find Resources by Type

```typescript
forms_get_page({
  mdbFilter: {
    type: "enduserFacing",
    version: "v2"
  }
})
```

## Important Notes

### MCP vs SDK Syntax

**MCP Server** (this document):
```typescript
// Use $ prefix with mdbFilter parameter
mdbFilter: { fname: { $exists: true } }
```

**Tellescope SDK** (when writing scripts):
```typescript
// Use _ prefix with filter parameter
filter: { fname: { _exists: true } }
```

### Date Filtering

For date range filtering, use dedicated `from`/`to` parameters instead of `mdbFilter`:

```typescript
// ❌ WRONG - Don't use mdbFilter for date ranges
forms_get_page({
  mdbFilter: { createdAt: { $gt: "2024-01-01" } }
})

// ✅ CORRECT - Use dedicated date parameters
forms_get_page({
  from: "2024-01-01",
  to: "2024-01-31"
})
```

See [dateRangeFiltering.md](./dateRangeFiltering.md) for comprehensive date filtering documentation.

## Best Practices

1. **Use implicit $and**: Multiple fields at the same level are automatically AND'd together
2. **Use $in for multiple values**: Better than multiple $or conditions
3. **Use $exists for presence checks**: Better than checking for specific values when you just need to know if data exists
4. **Use dedicated date parameters**: Don't use `$gt`/`$lt` for date filtering - use `from`/`to` parameters
5. **Remember the $ prefix**: MCP uses `$exists`, not `_exists`

## Common Pitfalls

### ❌ Using Wrong Operator Prefix

```typescript
// WRONG - Using SDK syntax (_exists) in MCP
mdbFilter: { fname: { _exists: true } }

// RIGHT - Using MongoDB syntax ($exists) in MCP
mdbFilter: { fname: { $exists: true } }
```

### ❌ Using mdbFilter for Date Ranges

```typescript
// WRONG - Don't use mdbFilter for date filtering
mdbFilter: { createdAt: { $gte: "2024-01-01" } }

// RIGHT - Use dedicated date parameters
from: "2024-01-01", to: "2024-01-31"
```

### ❌ Forgetting Logical Operators

```typescript
// WRONG - This won't work as intended
mdbFilter: {
  priority: { $gt: 5 },
  priority: { $lt: 10 }  // Overwrites previous line!
}

// RIGHT - Use $and with $gt and $lt together
mdbFilter: {
  priority: { $gt: 5, $lt: 10 }  // Both in same object
}
```

## Quick Reference

| Operation | MongoDB Syntax (MCP) | SDK Syntax (Scripts) |
|-----------|---------------------|----------------------|
| Exists | `$exists: true` | `_exists: true` |
| Greater than | `$gt: value` | `_gt: value` |
| Less than | `$lt: value` | `_lt: value` |
| In array | `$in: [values]` | `_in: [values]` |
| Not equals | `$ne: value` | `_ne: value` |
| And | `$and: [conditions]` | `$and: [conditions]` |
| Or | `$or: [conditions]` | `$or: [conditions]` |
