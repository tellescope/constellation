# Understanding replaceObjectFields

The `options.replaceObjectFields` parameter controls how updates behave for **object fields** and **arrays**. This is CRITICAL to understand to avoid accidental data loss.

## Default Behavior (replaceObjectFields: false or omitted)

**Merge behavior** - safest option:

```typescript
// Starting state: { fields: { field1: '1', field2: '2' }, tags: ['vip'] }

// Update with merge behavior (default)
users_update_one({
  id: 'user-id',
  updates: {
    fields: { field3: '3' },  // Add new field
    tags: ['premium']          // Append to array
  }
  // options omitted or { replaceObjectFields: false }
})

// Result: { fields: { field1: '1', field2: '2', field3: '3' }, tags: ['vip', 'premium'] }
// ✅ field1 and field2 preserved
// ✅ 'vip' tag preserved
```

## Replace Behavior (replaceObjectFields: true)

**Replace behavior** - dangerous, use with caution:

```typescript
// Starting state: { fields: { field1: '1', field2: '2' }, tags: ['vip', 'premium'] }

// Update with replace behavior
users_update_one({
  id: 'user-id',
  updates: {
    fields: { field3: '3' },  // REPLACES entire object
    tags: ['new-tag']          // REPLACES entire array
  },
  options: { replaceObjectFields: true }
})

// Result: { fields: { field3: '3' }, tags: ['new-tag'] }
// ❌ field1 and field2 DELETED!
// ❌ 'vip' and 'premium' tags DELETED!
```

## When to Use Each

### Use replaceObjectFields: false (default)
✅ Adding a new tag to existing tags
✅ Adding/updating one field in a custom fields object
✅ Appending to any array
✅ When you're unsure - this is the safe option

```typescript
// Add a single tag
endusers_update_one({
  id: 'enduser-id',
  updates: { tags: ['new-patient'] }
  // No options needed - merge is default
})
// Result: Existing tags + 'new-patient'

// Add one custom field
endusers_update_one({
  id: 'enduser-id',
  updates: {
    fields: { 'Insurance Provider': 'Aetna' }
  }
})
// Result: All existing fields + 'Insurance Provider'
```

### Use replaceObjectFields: true
✅ Completely replacing a tags array with new set
✅ Clearing all subfields in an object
✅ Setting an array to a known complete state

```typescript
// Replace entire tags array
users_update_one({
  id: 'user-id',
  updates: { tags: ['admin', 'developer'] },
  options: { replaceObjectFields: true }
})
// Result: Tags array is EXACTLY ['admin', 'developer'], all previous tags removed

// Clear all custom fields
endusers_update_one({
  id: 'enduser-id',
  updates: { fields: {} },
  options: { replaceObjectFields: true }
})
// Result: All custom fields deleted
```

## ⚠️ Critical Warning: Updating Object Subfields with replaceObjectFields: true

**This is the most dangerous scenario:**

```typescript
// Starting state
const enduser = {
  fields: {
    'Insurance Provider': 'Aetna',
    'Risk Level': 'High',
    'Last Visit': '2024-01-15'
  }
}

// WRONG - This will DELETE other fields!
endusers_update_one({
  id: enduser.id,
  updates: {
    fields: { 'Risk Level': 'Low' }  // Only updating one field
  },
  options: { replaceObjectFields: true }  // ❌ DANGEROUS!
})

// Result: { fields: { 'Risk Level': 'Low' } }
// ❌ 'Insurance Provider' DELETED!
// ❌ 'Last Visit' DELETED!
```

**CORRECT approach when you need replaceObjectFields: true:**

```typescript
// Step 1: Fetch existing record
const enduser = await endusers_get_one({ id: 'enduser-id' })

// Step 2: Merge your changes with existing data
const updatedFields = {
  ...enduser.fields,           // Preserve all existing fields
  'Risk Level': 'Low'          // Update the one field you want to change
}

// Step 3: Update with complete object
endusers_update_one({
  id: enduser.id,
  updates: { fields: updatedFields },
  options: { replaceObjectFields: true }
})

// Result: All fields preserved + 'Risk Level' updated to 'Low'
```

## Decision Tree

```
Do you want to update an object field or array?
│
├─ Are you setting it to a COMPLETE, KNOWN state?
│  (e.g., "tags should be exactly ['admin', 'staff']")
│  └─ Yes → Use replaceObjectFields: true
│
└─ Are you adding/modifying just PART of it?
   (e.g., "add 'new-tag' to existing tags" or "update one subfield")
   │
   ├─ Is it an object with multiple subfields?
   │  └─ Yes → Use replaceObjectFields: false (default)
   │           OR fetch → merge → update with true
   │
   └─ Is it a simple array?
      └─ Use replaceObjectFields: false (default) to append

When in doubt: Don't use replaceObjectFields: true
```

## Real-World Examples

### Example 1: Adding Journey States (Safe)
```typescript
// Add a new state to journey
journeys_update_one({
  id: 'journey-id',
  updates: {
    states: [{ name: 'New State', priority: 'High' }]
  }
  // Default merge: appends to existing states
})
```

### Example 2: Replacing Journey States (Careful)
```typescript
// Completely redefine all states
journeys_update_one({
  id: 'journey-id',
  updates: {
    states: [
      { name: 'Active', priority: 'High' },
      { name: 'Completed', priority: 'Low' }
    ]
  },
  options: { replaceObjectFields: true }
})
// Result: Only these 2 states exist, all others removed
```

### Example 3: Updating Enduser Custom Field (Safe)
```typescript
// Update one custom field, keep others
endusers_update_one({
  id: 'enduser-id',
  updates: {
    fields: { 'Preferred Contact': 'Email' }
  }
  // Default merge: preserves other custom fields
})
```

### Example 4: Clearing Tags (Intentional Replace)
```typescript
// Remove all tags
endusers_update_one({
  id: 'enduser-id',
  updates: { tags: [] },
  options: { replaceObjectFields: true }
})
// Result: tags array is empty
```

## Summary

| Scenario | replaceObjectFields | Behavior |
|----------|---------------------|----------|
| Add tag to array | `false` (default) | Appends to existing tags |
| Replace all tags | `true` | Replaces entire tags array |
| Update one object subfield | `false` (default) | Merges with existing subfields |
| Replace entire object | `true` | Replaces entire object (other subfields lost) |
| Not sure? | `false` (default) | Safest - merges instead of replacing |

**Golden Rule**: Use `replaceObjectFields: true` only when you have the COMPLETE, FINAL state you want. Otherwise, use the default merge behavior.
