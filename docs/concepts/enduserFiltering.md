# Enduser Filtering Pattern

The `enduserCondition` (singular) and `enduserConditions` (plural) fields appear across multiple resource types to filter automation actions based on enduser (patient) properties.

## Where It's Used

- **AutomationStep**: `enduserConditions` - Only execute step for endusers matching conditions
- **AutomationTrigger**: `enduserCondition` - Only fire trigger for matching endusers
- **AutomatedAction**: `enduserConditions` - Runtime condition check on endusers
- **PhoneTree**: `enduserCondition` - Route calls based on enduser properties
- Other filtering contexts throughout the platform

## Structure

Enduser conditions use **MongoDB-style query syntax** with logical operators:

```typescript
{
  "$and": [
    { "condition": { /* enduser field filters */ } },
    { "condition": { /* enduser field filters */ } },
    // ... more conditions
  ]
}
```

Or using `$or`:

```typescript
{
  "$or": [
    { "condition": { /* enduser field filters */ } },
    { "condition": { /* enduser field filters */ } },
  ]
}
```

## Condition Object

Each `condition` object filters enduser properties using **MongoDB query operators**:

```typescript
{
  "condition": {
    "field_name": "exact_value",           // Exact match
    "field_name": { "$exists": true },     // Field exists check
    "age": { "$gt": 18, "$lt": 65 },      // Comparison operators (not a real field, example only)
    "tags": "vip",                         // Tag membership (single tag)
    "tags": { "$in": ["vip", "premium"] }, // Tag membership (multiple)
    "Custom Field Name": "value",          // Custom fields (use exact name)
  }
}
```

## Supported MongoDB Operators

- `$exists` - Check if field exists/is set
- `$gt`, `$gte` - Greater than (equal)
- `$lt`, `$lte` - Less than (equal)
- `$eq`, `$ne` - Equals, not equals
- `$in`, `$nin` - In array, not in array
- Logical: `$and`, `$or`, `$not`

## Available Field References

In enduser filter contexts, you can reference:

### 1. Standard Enduser Fields

Built-in fields on the enduser (patient) record:
- `"fname"`, `"lname"` - Patient name
- `"email"`, `"phone"` - Contact info
- `"dateOfBirth"`, `"gender"`, `"state"` - Demographics
- `"tags"` - Patient tags (e.g., "vip", "new-patient")
- `"assignedTo"` - Assigned provider user ID
- `"unassignedCareTeamId"` - Care team assignment
- And many more...

### 2. Custom Fields

Any custom field name defined in your organization settings:
- `"Insurance Provider"` - Custom field (exact name match)
- `"Risk Level"` - Custom field
- `"Preferred Language"` - Custom field

**Note**: Custom field names are **case-sensitive** and must match exactly.

---

## Examples

### Example 1: VIP Patients Only

```typescript
await session.api.automation_steps.createOne({
  journeyId: "journey_id",
  action: {
    type: "sendEmail",
    info: { templateId: "vip_template_id", senderId: "user_id" }
  },
  events: [{ type: "onJourneyStart", info: {} }],
  enduserConditions: {
    "$and": [
      {
        "condition": {
          "tags": "vip"  // Patient has "vip" tag
        }
      }
    ]
  }
});
```

### Example 2: High-Risk Patients in California

```typescript
{
  "$and": [
    {
      "condition": {
        "state": "CA"
      }
    },
    {
      "condition": {
        "Risk Level": "High"  // Custom field
      }
    }
  ]
}
```

### Example 3: Either New Patients OR Unassigned

```typescript
{
  "$or": [
    {
      "condition": {
        "tags": "new-patient"
      }
    },
    {
      "condition": {
        "assignedTo": { "$exists": false }  // No assigned provider
      }
    }
  ]
}
```

### Example 4: Adults with Insurance

```typescript
{
  "$and": [
    {
      "condition": {
        "dateOfBirth": { "$lt": "2005-01-01" }  // Born before 2005
      }
    },
    {
      "condition": {
        "Insurance Provider": { "$exists": true }  // Custom field is populated
      }
    }
  ]
}
```

### Example 5: Complex Multi-Condition

```typescript
{
  "$and": [
    {
      "condition": {
        "tags": { "$in": ["active", "enrolled"] }  // Has either tag
      }
    },
    {
      "condition": {
        "state": { "$in": ["CA", "NY", "TX"] }  // In one of these states
      }
    },
    {
      "condition": {
        "Wellness Score": { "$gte": 15 }  // Custom field value >= 15
      }
    }
  ]
}
```

### Example 6: AutomationTrigger with Condition

```typescript
await session.api.automation_triggers.createOne({
  event: { type: "Field Equals", info: { field: "email", value: "$exists" } },
  action: { type: "Add To Journey", info: { journeyId: "onboarding_journey_id" } },
  status: "Active",
  enduserCondition: {
    "$and": [
      {
        "condition": {
          "tags": { "$nin": ["onboarded"] }  // Does NOT have "onboarded" tag
        }
      }
    ]
  }
});
```

---

## Best Practices

1. **Always wrap in $and or $or**: Even for single conditions, use `{ "$and": [{ "condition": {...} }] }`
2. **Use exact custom field names**: Custom fields are case-sensitive and must match exactly
3. **Test with tags first**: Tags are the simplest way to test conditional logic
4. **Combine standard and custom fields**: Mix built-in fields with custom fields as needed
5. **Use $exists for presence checks**: Better than checking for specific values when you just need to know if data is present
6. **Use $in for multiple values**: Better than multiple $or conditions
7. **Test incrementally**: Start with simple conditions, add complexity gradually

---

## Common Pitfalls

### ❌ Don't forget the wrapper array

```typescript
// WRONG
"enduserCondition": { "condition": { "tags": "vip" } }

// RIGHT
"enduserCondition": { "$and": [{ "condition": { "tags": "vip" } }] }
```

### ❌ Don't use wrong operator syntax

```typescript
// WRONG (unnecessary $eq operator)
"condition": { "tags": { "$eq": "vip" } }

// RIGHT (direct value for equality)
"condition": { "tags": "vip" }
```

### ❌ Don't misspell custom field names

```typescript
// WRONG (case mismatch)
"condition": { "insurance provider": "Aetna" }

// RIGHT (exact match)
"condition": { "Insurance Provider": "Aetna" }
```

### ❌ Don't confuse with form field conditions

```typescript
// WRONG - Using field IDs in AutomationStep (this is enduser filtering, not form logic!)
"enduserConditions": {
  "$and": [{ "condition": { "field_abc123": "Yes" } }]  // field IDs not available here!
}

// RIGHT - Using enduser properties
"enduserConditions": {
  "$and": [{ "condition": { "tags": "consented" } }]
}
```

---

## Related Patterns

- **Filter queries**: When using `getSome()` methods, use similar MongoDB query syntax in the `mdbFilter` parameter
- **Form field conditions**: See FormField tool schema for `compoundLogic` previousField type (references field IDs, not enduser properties)
- **Conditional branching**: AutomationSteps can branch based on enduser properties
