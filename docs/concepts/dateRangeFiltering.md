# Date Range Filtering

## Overview

For filtering resources by creation time, update time, or custom date fields, use dedicated date range parameters instead of `mdbFilter` with comparison operators.

**Why use dedicated parameters?**
- Cleaner syntax
- Better performance
- Optimized for date queries
- Avoids common MongoDB operator mistakes

## Available Parameters

| Parameter | Description | Default Field |
|-----------|-------------|---------------|
| `from` | Start date/time (ISO string or Unix timestamp) | `createdAt` |
| `to` | End date/time (ISO string) | `createdAt` |
| `fromToField` | Custom field name for range filter | `createdAt` |
| `fromUpdated` | Start date/time for update filter (ISO string) | `updatedAt` |
| `toUpdated` | End date/time for update filter (ISO string) | `updatedAt` |

## Basic Examples

### Filter by Creation Date

```typescript
// Get forms created in January 2024
forms_get_page({
  from: '2024-01-01T00:00:00Z',
  to: '2024-01-31T23:59:59Z'
})

// Can also use Unix timestamps for 'from'
forms_get_page({
  from: 1704067200,  // January 1, 2024 00:00:00 UTC
  to: '2024-01-31T23:59:59Z'
})
```

### Filter by Update Date

```typescript
// Get templates updated in the last 7 days
templates_get_page({
  fromUpdated: '2024-01-15T00:00:00Z',
  toUpdated: '2024-01-22T23:59:59Z'
})
```

### Filter by Custom Date Field

```typescript
// Get appointments by appointment start time
calendar_events_get_page({
  from: '2024-02-01T00:00:00Z',
  to: '2024-02-29T23:59:59Z',
  fromToField: 'startTime'
})

// Get database records by custom date field
database_records_get_page({
  databaseId: 'db-123',
  from: '2024-01-01',
  to: '2024-12-31',
  fromToField: 'appointmentDate'
})
```

## Common Use Cases

### Get Recent Records

```typescript
// Get forms created in the last 30 days
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

forms_get_page({
  from: thirtyDaysAgo.toISOString(),
  to: new Date().toISOString()
})
```

### Get Records from Specific Month

```typescript
// Get journeys created in March 2024
journeys_get_page({
  from: '2024-03-01T00:00:00Z',
  to: '2024-03-31T23:59:59Z'
})
```

### Get Recently Modified Records

```typescript
// Get templates updated in the last 24 hours
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

templates_get_page({
  fromUpdated: yesterday.toISOString(),
  toUpdated: new Date().toISOString()
})
```

### Get Upcoming Appointments

```typescript
// Get appointments scheduled for next week
const today = new Date();
const nextWeek = new Date();
nextWeek.setDate(today.getDate() + 7);

calendar_events_get_page({
  from: today.toISOString(),
  to: nextWeek.toISOString(),
  fromToField: 'startTime'
})
```

## Combining with mdbFilter

You can combine date range parameters with `mdbFilter` for complex queries:

```typescript
// Get active forms created in January 2024
forms_get_page({
  from: '2024-01-01',
  to: '2024-01-31T23:59:59Z',
  mdbFilter: {
    type: 'enduserFacing',
    archivedAt: { $exists: false }
  }
})

// Get VIP patient appointments this month
calendar_events_get_page({
  from: '2024-01-01',
  to: '2024-01-31T23:59:59Z',
  fromToField: 'startTime',
  mdbFilter: {
    'attendees.tags': 'vip'
  }
})
```

## Date Format Reference

### ISO 8601 Format (Recommended)

```typescript
// Full datetime with timezone
'2024-01-15T14:30:00Z'        // UTC time
'2024-01-15T14:30:00-05:00'   // EST time

// Date only (treated as start of day UTC)
'2024-01-15'                   // Equivalent to 2024-01-15T00:00:00Z

// With milliseconds
'2024-01-15T14:30:00.000Z'
```

### Unix Timestamps (Supported for 'from' only)

```typescript
// Seconds since January 1, 1970 UTC
from: 1704067200              // January 1, 2024 00:00:00 UTC
from: 1704153600              // January 2, 2024 00:00:00 UTC
```

## Best Practices

### 1. Use ISO Strings for Clarity

```typescript
// ✅ GOOD - Clear and explicit
from: '2024-01-01T00:00:00Z'
to: '2024-01-31T23:59:59Z'

// ❌ AVOID - Ambiguous timezone
from: '2024-01-01'  // What timezone?
```

### 2. Always Include End Time in 'to'

```typescript
// ✅ GOOD - Includes entire last day
to: '2024-01-31T23:59:59Z'

// ❌ WRONG - Misses most of last day
to: '2024-01-31'  // Only includes 00:00:00
```

### 3. Use Dedicated Parameters, Not mdbFilter

```typescript
// ✅ GOOD - Use dedicated date parameters
forms_get_page({
  from: '2024-01-01',
  to: '2024-12-31'
})

// ❌ WRONG - Don't use mdbFilter for dates
forms_get_page({
  mdbFilter: {
    createdAt: { $gte: '2024-01-01', $lte: '2024-12-31' }
  }
})
```

### 4. Filter Recent Updates Separately

```typescript
// ✅ GOOD - Use fromUpdated/toUpdated for update times
templates_get_page({
  fromUpdated: '2024-01-15',
  toUpdated: '2024-01-22'
})

// ❌ WRONG - Don't mix createdAt and updatedAt filtering
templates_get_page({
  from: '2024-01-01',
  mdbFilter: { updatedAt: { $gte: '2024-01-15' } }
})
```

## Common Pitfalls

### ❌ Using mdbFilter for Date Ranges

```typescript
// WRONG - Inefficient and error-prone
forms_get_page({
  mdbFilter: {
    createdAt: { $gt: '2024-01-01', $lt: '2024-01-31' }
  }
})

// RIGHT - Use dedicated parameters
forms_get_page({
  from: '2024-01-01',
  to: '2024-01-31T23:59:59Z'
})
```

### ❌ Forgetting Timezone in ISO Strings

```typescript
// WRONG - Ambiguous timezone
from: '2024-01-15T14:30:00'

// RIGHT - Explicit UTC timezone
from: '2024-01-15T14:30:00Z'
```

### ❌ Missing Time in End Date

```typescript
// WRONG - Only gets 00:00:00 on Jan 31
to: '2024-01-31'

// RIGHT - Gets entire day on Jan 31
to: '2024-01-31T23:59:59Z'
```

### ❌ Using createdAt for Update Queries

```typescript
// WRONG - Using from/to for update time
forms_get_page({
  from: '2024-01-15',
  to: '2024-01-22',
  fromToField: 'updatedAt'  // Don't do this!
})

// RIGHT - Use dedicated update parameters
forms_get_page({
  fromUpdated: '2024-01-15',
  toUpdated: '2024-01-22'
})
```

## Quick Reference

| Goal | Parameters | Example |
|------|------------|---------|
| Created in date range | `from`, `to` | `from: '2024-01-01', to: '2024-01-31T23:59:59Z'` |
| Updated in date range | `fromUpdated`, `toUpdated` | `fromUpdated: '2024-01-15', toUpdated: '2024-01-22'` |
| Custom field date range | `from`, `to`, `fromToField` | `from: '2024-02-01', to: '2024-02-29', fromToField: 'startTime'` |
| Last 7 days (created) | `from` only | `from: '2024-01-15'` |
| Last 7 days (updated) | `fromUpdated` only | `fromUpdated: '2024-01-15'` |

## Related Documentation

- [mdbFilter.md](./mdbFilter.md) - Using MongoDB-style filters for non-date queries
- [enduserFiltering.md](./enduserFiltering.md) - Filtering automations by enduser properties
