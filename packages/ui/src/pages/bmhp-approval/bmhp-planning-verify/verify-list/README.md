# Verify BMHP Planning - Implementation Guide

## Overview
This module implements the verification and management interface for BMHP (Bahan Medis Habis Pakai) planning data at the regency level. It provides a table-based interface where users can review and edit planning targets for various entities (e.g., Puskesmas) across different target groups.

## Directory Structure

```
verify-list/
├── VerifyPlanningListPage.tsx       # Main page component
├── index.ts                          # Export file
├── components/
│   └── VerifyPlanningTable.tsx      # Table component with editable inputs
├── hooks/
│   ├── useVerifyPlanningData.ts     # Hook for fetching data
│   └── useUpdateVerifyPlanning.ts   # Hook for updating data
├── libs/
│   ├── verify-planning.type.ts      # TypeScript types
│   └── verify-planning.filter.ts    # Filter schema
└── services/
    └── verify-planning.service.ts   # API service functions
```

## Key Features

### 1. **Hierarchical Filtering**
- **Program Plan (Year)**: Select the planning year
- **Province**: Select province to narrow down regencies
- **Regency**: Select specific regency (only enabled after province is selected)

The filter system ensures that regency options are only loaded after a province is selected, providing a clean user experience.

### 2. **Editable Table with Input Restrictions**
- Displays entities (e.g., Puskesmas) in rows
- Shows target groups in columns with 3 fields each:
  - **Target**: Sample count
  - **Adjustment Target**: Test count  
  - **Status**: Active/inactive checkbox
- **Important**: Inputs are only shown for data that already exists (`id !== null`)
- For data that doesn't exist yet (`id === null`), displays "0" without input fields
- This prevents users from creating data through the verification interface

### 3. **Smart Change Tracking**
- Tracks all user changes locally using a Map
- Only sends changed data to the API (minimal payload)
- Shows a save button with the count of changed entities
- Auto-saves when user navigates to a different page

### 4. **Status-Based Input Control**
- When status checkbox is unchecked, target inputs are disabled
- When status is `false`, backend automatically sets target values to 0
- This provides data consistency and prevents invalid entries

### 5. **Pagination Support**
- Supports paginated data loading
- Preserves changes when switching pages (auto-saves first)
- Shows pagination controls only when multiple pages exist

## API Integration

### GET /verify-bmhp-planning
Fetches planning data for all entities in a regency.

**Query Parameters:**
- `program_plan_id`: Required - ID of the planning year
- `regency_id`: Required - ID of the regency
- `page`: Optional - Page number (default: 1)
- `paginate`: Optional - Items per page (default: 10)
- `keyword`: Optional - Search term for entity names

**Response Structure:**
```typescript
{
  page: number
  item_per_page: number
  total_item: number
  total_page: number
  target_group: TargetGroup[]  // Static list of target groups
  data: EntityData[]            // Entity planning data
}
```

### POST /verify-bmhp-planning
Updates planning data (only sends changes).

**Request Body:**
```typescript
{
  regency_id: number
  program_plan_id: number
  data: [
    {
      planning_id?: number      // Optional, for existing planning
      entity_id: number          // Required
      target: Target[]           // Array of target data
    }
  ]
}
```

## Components

### VerifyPlanningListPage
Main container component that:
- Manages filters and pagination state
- Fetches data using `useVerifyPlanningData` hook
- Tracks changes using `useState` with Map
- Provides save functionality
- Shows loading states

### VerifyPlanningTable
Presentational component that:
- Renders the data table
- Provides editable inputs for existing data
- Shows placeholder "0" for non-existent data
- Displays a note explaining input visibility rules
- Uses sticky positioning for entity names column

## Type System

All types are centralized in `verify-planning.type.ts`:

```typescript
interface EntityData {
  id: number | null               // Planning ID
  entity_name: {
    id: number
    name: string
  }
  target: Target[]
}

interface Target {
  id: number | null               // null = doesn't exist yet
  target_id: number               // Target group ID
  target: number                  // Sample count
  adjustment_target: number       // Test count
  status: boolean                 // Active status
}
```

## Usage Example

```tsx
import VerifyPlanningListPage from '#pages/bmhp/bmhp-planning-verify/verify-list'

// In your routing:
<Route path="/verify-bmhp-planning" element={<VerifyPlanningListPage />} />
```

## Important Notes

### Input Visibility Logic
- **Shows input fields**: When `target.id !== null` (data exists)
- **Shows "0" placeholder**: When `target.id === null` (no data)
- **Reason**: Verification is for reviewing/editing existing data, not creating new records

### Status Field Behavior
- `status: true`: Data is active, values are saved as-is
- `status: false`: Backend sets `target = 0` and `adjustment_target = 0`
- Inputs are disabled when status is false

### Data Flow
1. User selects filters → data loads
2. User edits values → changes tracked locally
3. User clicks save (or changes page) → only changed entities sent to API
4. API response → re-fetch data → changes reset

## Future Enhancements

Potential improvements:
- Add bulk edit functionality
- Export to Excel
- Add search/filter within table
- Add data validation rules
- Add audit trail view
- Add comments/notes field

## Troubleshooting

### Data not loading
- Ensure all three filters are selected (Year, Province, Regency)
- Check browser console for API errors
- Verify API endpoint is accessible

### Can't edit inputs
- Check if data exists (`id` should not be null)
- Check if status checkbox is checked
- Verify user permissions

### Changes not saving
- Check if save button appears when editing
- Look for error toasts
- Check browser network tab for failed requests
- Verify request payload format

## Related Documentation

- [BMHP Planning Module](../list/README.md)
- [API Documentation](../API_DOCUMENTATION.md)
- [Filter Component](../../../../components/filter/README.md)
