# Step 6 — Activity Plan

## Overview

The **Activity Plan** step is the final step (Step 6) in the microplanning workflow. It allows users to define and manage activity plans for immunization programs within a sub-district.

There are **2 mandatory activity plans** that must be completed before the microplanning can be submitted. These mandatory plans have a fixed `title` and a `has_completed` flag to track completion status. Users can also create **additional (optional) activity plans** beyond the mandatory ones.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     ACTIVITY PLAN MODULE                             │
│  activity-plan.controller.ts  ←  activity-plan.module.ts            │
│  GET /activity-plans  |  GET /activity-plans/:id  |  POST /activity-plans  |
│  PUT /activity-plans/:id  |  DELETE /activity-plans/:id  |  GET /summary  |
└──────────────────────────────┬──────────────────────────────────────┘
                               │ delegates to
                               ▼
                    ┌─────────────────────┐
                    │  Activity Plan       │
                    │  Repository          │
                    │  (data access)       │
                    └─────────────────────┘
```

The module follows the same architectural pattern as other microplanning steps (e.g., [`priority-areas/`](../priority-areas), [`problem-solution/`](../problem-solution)).

---

## Database Schema

### Table: `ws_microplanning_activity_plans`

| Column                  | Type         | Nullable | Description                                              |
|-------------------------|--------------|----------|----------------------------------------------------------|
| `id`                    | BIGINT (PK)  | NO       | Auto-incrementing primary key                            |
| `microplanning_id`      | BIGINT       | NO       | FK to `ws_microplanning.id`                              |
| `title`                 | VARCHAR(255) | NO       | Activity plan title (fixed for mandatory plans)          |
| `objective`             | TEXT         | YES      | Free-text description of the activity objective          |
| `frequency`             | VARCHAR(255) | YES      | Free-text frequency description                          |
| `target_group_ids`      | JSON         | YES      | Array of target group IDs (e.g., `[1, 2, 3]`)            |
| `location_type_ids`     | JSON         | YES      | Array of location type IDs (e.g., `[1, 2]`)              |
| `implementation_schedule`| TEXT        | YES      | Free-text implementation schedule                        |
| `material_ids`          | JSON         | YES      | Array of material IDs needed (e.g., `[10, 20, 30]`)      |
| `budget_estimation`     | DOUBLE       | YES      | Estimated budget amount                                  |
| `budget_source_id`      | BIGINT       | YES      | FK to `ws_budget_sources.id`                             |
| `additional_information`| TEXT         | YES      | Free-text additional information                         |
| `is_mandatory`          | TINYINT(1)   | NO       | `1` = mandatory plan, `0` = optional plan                |
| `status`                | TINYINT(1)   | NO       | `0` = draft, `1` = submitted                             |
| `created_by`            | BIGINT       | YES      | User ID who created the record                           |
| `updated_by`            | BIGINT       | YES      | User ID who last updated the record                      |
| `created_at`            | DATETIME     | YES      | Record creation timestamp                                |
| `updated_at`            | DATETIME     | YES      | Record last update timestamp                             |
| `deleted_at`            | DATETIME     | YES      | Soft-delete timestamp (NULL = not deleted)               |

### Indexes

```sql
CREATE INDEX idx_activity_plans_microplanning ON ws_microplanning_activity_plans(microplanning_id);
CREATE INDEX idx_activity_plans_mandatory ON ws_microplanning_activity_plans(is_mandatory);
CREATE INDEX idx_activity_plans_status ON ws_microplanning_activity_plans(status);
```

---

## API Endpoints

All endpoints are scoped under the current microplanning context (resolved via middleware from `c.var.microplanningId`).

### 1. `GET /activity-plans` — List Activity Plans

Returns a list of all activity plans for the current microplanning. By default, the 2 mandatory plans are always included (with `has_completed` flag). Optional plans created by the user are also returned.

**Query Parameters:** None

**Response:**

```json
[
  {
    "id": 1,
    "title": "Imunisasi Rutin di Puskesmas",
    "has_completed": 0,
    "is_mandatory": 1,
    "data": null
  },
  {
    "id": 2,
    "title": "Imunisasi di Sekolah",
    "has_completed": 1,
    "is_mandatory": 1,
    "data": {
      "id": 2,
      "title": "Imunisasi di Sekolah",
      "objective": "Melakukan imunisasi MR di semua sekolah dasar",
      "frequency": "Sekali dalam bulan Agustus",
      "target_groups": [
        { "id": 1, "name": "BBL (0-11 bulan)" },
        { "id": 2, "name": "Batita (12-23 bulan)" }
      ],
      "location_types": [
        { "id": 1, "name": "Puskesmas" },
        { "id": 3, "name": "Posyandu" }
      ],
      "implementation_schedule": "Minggu ke-2 Agustus 2025",
      "materials": [
        { "id": 10, "name": "Vaksin MR" },
        { "id": 20, "name": "Syringe 0.5ml" },
        { "id": 30, "name": "Safety Box" }
      ],
      "budget_estimation": 15000000.00,
      "budget_source": { "id": 5, "name": "APBD Kabupaten" },
      "additional_information": "Koordinasi dengan kepala sekolah diperlukan",
      "is_mandatory": 1,
      "has_completed": 1,
      "status": 0
    }
  },
  {
    "id": 10,
    "title": "Imunisasi Tambahan di Posyandu",
    "has_completed": 0,
    "is_mandatory": 0,
    "data": {
      "id": 10,
      "title": "Imunisasi Tambahan di Posyandu",
      "objective": "Menjangkau balita di posyandu terpencil",
      "frequency": "Setiap bulan",
      "target_groups": [
        { "id": 3, "name": "Balita (24-59 bulan)" }
      ],
      "location_types": [
        { "id": 2, "name": "Posyandu" }
      ],
      "implementation_schedule": "Setiap minggu ke-4",
      "materials": [
        { "id": 10, "name": "Vaksin MR" },
        { "id": 25, "name": "Syringe 1ml" }
      ],
      "budget_estimation": 5000000.00,
      "budget_source": { "id": 3, "name": "BOS" },
      "additional_information": null,
      "is_mandatory": 0,
      "has_completed": 1,
      "status": 0
    }
  }
]
```

**Response Fields (List Item):**

| Field            | Type    | Description                                                    |
|------------------|---------|----------------------------------------------------------------|
| `id`             | number  | Activity plan ID                                               |
| `title`          | string  | Activity plan title (fixed for mandatory)                      |
| `has_completed`  | number  | Whether the plan has been filled out (0 = false, 1 = true)     |
| `is_mandatory`   | number  | Whether this is a mandatory plan (0 = false, 1 = true)         |
| `data`           | object \| null | Full detail object if `has_completed` is `1`, otherwise `null` |

**Note:** A plan is considered completed (`has_completed = 1`) when it has an `objective` value set (i.e., `objective !== null`).

---

### 2. `GET /activity-plans/:id` — Get Activity Plan Detail

Returns the full detail of a specific activity plan.

**Path Parameters:**

| Parameter | Type   | Description        |
|-----------|--------|--------------------|
| `id`      | number | Activity plan ID   |

**Response:**

```json
{
  "id": 2,
  "title": "Imunisasi di Sekolah",
  "objective": "Melakukan imunisasi MR di semua sekolah dasar",
  "frequency": "Sekali dalam bulan Agustus",
  "target_groups": [
    { "id": 1, "name": "BBL (0-11 bulan)" },
    { "id": 2, "name": "Batita (12-23 bulan)" }
  ],
  "location_types": [
    { "id": 1, "name": "Puskesmas" },
    { "id": 3, "name": "Posyandu" }
  ],
  "implementation_schedule": "Minggu ke-2 Agustus 2025",
  "materials": [
    { "id": 10, "name": "Vaksin MR" },
    { "id": 20, "name": "Syringe 0.5ml" },
    { "id": 30, "name": "Safety Box" }
  ],
  "budget_estimation": 15000000.00,
  "budget_source": { "id": 5, "name": "APBD Kabupaten" },
  "additional_information": "Koordinasi dengan kepala sekolah diperlukan",
  "is_mandatory": 1,
  "has_completed": 1,
  "status": 0
}
```

**Response Fields (Detail):**

| Field                      | Type              | Description                                              |
|----------------------------|-------------------|----------------------------------------------------------|
| `id`                       | number            | Activity plan ID                                         |
| `title`                    | string            | Activity plan title (fixed for mandatory plans)          |
| `objective`                | string \| null    | Free-text objective description                          |
| `frequency`                | string \| null    | Free-text frequency description                          |
| `target_groups`            | ReferenceItem[] \| null | Array of target group objects with `id` and `name` |
| `location_types`           | ReferenceItem[] \| null | Array of location type objects with `id` and `name` |
| `implementation_schedule`  | string \| null    | Free-text implementation schedule                        |
| `materials`                | ReferenceItem[] \| null | Array of material objects with `id` and `name`     |
| `budget_estimation`        | number \| null    | Estimated budget (decimal)                               |
| `budget_source`            | ReferenceItem \| null | Budget source object with `id` and `name`          |
| `additional_information`   | string \| null    | Free-text additional information                         |
| `is_mandatory`             | number            | `1` = mandatory, `0` = optional                          |
| `has_completed`            | number            | `1` = completed, `0` = not completed                     |
| `status`                   | number            | `0` = draft, `1` = submitted                             |

**ReferenceItem Structure:**

| Field | Type   | Description |
|-------|--------|-------------|
| `id`  | number | Reference ID |
| `name`| string | Reference name |

---

### 3. `POST /activity-plans` — Create Activity Plan

Creates a new activity plan. This endpoint is used for **optional** plans only. Mandatory plans are pre-seeded and cannot be created via this endpoint.

**Request Body:**

```json
{
  "title": "Imunisasi Tambahan di Posyandu",
  "objective": "Menjangkau balita di posyandu terpencil",
  "frequency": "Setiap bulan",
  "target_group_ids": [3],
  "location_type_ids": [2],
  "implementation_schedule": "Setiap minggu ke-4",
  "material_ids": [10, 25],
  "budget_estimation": 5000000.00,
  "budget_source_id": 3,
  "additional_information": null
}
```

**Request Body Fields:**

| Field                      | Type              | Required | Description                                      |
|----------------------------|-------------------|----------|--------------------------------------------------|
| `title`                    | string            | YES      | Activity plan title (max 255 chars)              |
| `objective`                | string            | NO       | Free-text objective                              |
| `frequency`                | string            | NO       | Free-text frequency                              |
| `target_group_ids`         | number[]          | NO       | Array of target group IDs                        |
| `location_type_ids`        | number[]          | NO       | Array of location type IDs                       |
| `implementation_schedule`  | string            | NO       | Free-text schedule                               |
| `material_ids`             | number[]          | NO       | Array of material IDs                            |
| `budget_estimation`        | number            | NO       | Budget estimation (decimal)                      |
| `budget_source_id`         | number            | NO       | Budget source ID                                 |
| `additional_information`   | string            | NO       | Additional information                           |

**Response (201 Created):**

```json
{
  "message": "success",
  "id": 10
}
```

---

### 4. `PUT /activity-plans/:id` — Update Activity Plan

Updates an existing activity plan. For mandatory plans, this sets the `has_completed` flag to `1` when the `objective` field is filled.

**Path Parameters:**

| Parameter | Type   | Description        |
|-----------|--------|--------------------|
| `id`      | number | Activity plan ID   |

**Request Body:** (same as POST, all fields optional)

```json
{
  "objective": "Updated objective text",
  "frequency": "Dua kali dalam setahun",
  "target_group_ids": [1, 2, 3],
  "location_type_ids": [1],
  "implementation_schedule": "Jadwal baru",
  "material_ids": [10, 20],
  "budget_estimation": 20000000.00,
  "budget_source_id": 5,
  "additional_information": "Catatan tambahan"
}
```

**Response (200 OK):**

```json
{
  "message": "success"
}
```

---

### 5. `DELETE /activity-plans/:id` — Delete Activity Plan

Soft-deletes an **optional** activity plan. Mandatory plans **cannot** be deleted.

**Path Parameters:**

| Parameter | Type   | Description        |
|-----------|--------|--------------------|
| `id`      | number | Activity plan ID   |

**Response (200 OK):**

```json
{
  "message": "success"
}
```

**Error Response (400 Bad Request) — Attempting to delete mandatory plan:**

```json
{
  "error": "Mandatory activity plans cannot be deleted"
}
```

---

### 6. `GET /activity-plans/summary` — Get Activity Plan Summary

Returns a summary of activity plans, showing the count of total plans.

**Response:**

```json
{
  "total_plans": 5
}
```

**Response Fields:**

| Field            | Type   | Description                                    |
|------------------|--------|------------------------------------------------|
| `total_plans`    | number | Total number of activity plans                 |

---

## Mandatory Activity Plans

The following 2 mandatory plans are **pre-seeded** when a microplanning record is created (via `seedMandatoryPlans`). They have fixed titles and cannot be deleted.

| ID (seed) | Title (fixed)                              | Description                                    |
|-----------|--------------------------------------------|------------------------------------------------|
| 1         | `Imunisasi Rutin di Puskesmas`             | Routine immunization at the health center      |
| 2         | `Imunisasi di Sekolah`                     | School-based immunization                      |

These plans are created with `is_mandatory = 1` and `has_completed = 0`. The `has_completed` flag is set to `1` when the user fills in the plan details (specifically the `objective` field) via the `PUT` endpoint.

---

## Status Calculation (for Overview Orchestrator)

The overview module calculates Step 6 progress as follows:

- **Sub-tasks:** 2 (one per mandatory plan)
- **Completed:** Number of mandatory plans where `has_completed = 1` (i.e., `objective !== null`)
- **Progress:** `completed / 2 * 100`

Optional plans do **not** affect the step completion status. They are supplementary and tracked separately.

### Integration with `GET /steps`

When the overview module returns step data, Step 6 will appear as:

```json
{
  "step_number": 6,
  "title": "Activity Plan",
  "status": {
    "status": "not_filled",
    "completed": 1,
    "total": 2,
    "percentage": 50
  }
}
```

---

## Submission Flow Integration

When `POST /submit` is called on the overview endpoint, the activity plan status is updated:

```sql
UPDATE ws_microplanning_activity_plans
SET status = 1, updated_at = NOW()
WHERE microplanning_id = ? AND deleted_at IS NULL;
```

This locks all activity plan records, preventing further modifications.

---

## Module Structure

```
activity-plan/
├── activity-plan.controller.ts      # HTTP route definitions
├── activity-plan.module.ts          # Business logic orchestration
├── activity-plan.repository.ts      # Database access layer
├── activity-plan.schema.ts          # Zod validation schemas
├── activity-plan.middleware.ts      # Request validation middleware
└── DESIGN.md                        # This file
```

---

## Reference Data Sources

| Field in Response      | Source Table                    | Notes                                        |
|------------------------|---------------------------------|----------------------------------------------|
| `target_groups`        | `target_groups`                 | Target group definitions (uses `title as name`) |
| `location_types`       | `ws_microplanning_config`       | Config with key `destination_type`           |
| `materials`            | `ws_materials`                  | Material definitions                         |
| `budget_source`        | `ws_budget_sources`             | Budget source definitions                    |

---

## Code Generation Prompt

Use the following prompt to generate the implementation code:

```
Create a NestJS/Hono-based microplanning module for "Activity Plan" (Step 6) following the existing patterns in the codebase.

Reference modules to follow:
- src/modules/microplanning/priority-areas/ (for structure)
- src/modules/microplanning/problem-solution/ (for patterns)

Requirements:
1. Create the following files in src/modules/microplanning/activity-plan/:
   - activity-plan.controller.ts
   - activity-plan.module.ts
   - activity-plan.repository.ts
   - activity-plan.schema.ts
   - activity-plan.middleware.ts

2. Database table: ws_microplanning_activity_plans
   Columns: id, microplanning_id, title, objective, frequency, target_group_ids (JSON), location_type_ids (JSON), implementation_schedule (TEXT), material_ids (JSON), budget_estimation (DOUBLE), budget_source_id, additional_information (TEXT), is_mandatory (TINYINT), has_completed (TINYINT), status (TINYINT), created_by, updated_by, created_at, updated_at, deleted_at

3. Endpoints:
   - GET /activity-plans — List all plans (mandatory + optional). Mandatory plans always show with has_completed flag.
   - GET /activity-plans/:id — Get detail of a specific plan.
   - POST /activity-plans — Create optional plan.
   - PUT /activity-plans/:id — Update plan (sets has_completed for mandatory).
   - DELETE /activity-plans/:id — Soft-delete optional plan only.
   - GET /activity-plans/summary — Return count summary.

4. Response format:
   - In list/detail responses, ID arrays are resolved to object arrays with {id, name}:
     - target_group_ids → target_groups (from target_groups, using title as name)
     - location_type_ids → location_types (from ws_microplanning_config with key destination_type)
     - material_ids → materials (from ws_materials)
     - budget_source_id → budget_source (from ws_budget_sources)
   - Boolean fields (is_mandatory, has_completed) are returned as integers (0/1)

5. Follow the existing patterns:
   - Controller extends BaseController
   - Module handles business logic
   - Repository uses Kysely query builder
   - Schemas use Zod for validation
   - Middleware validates requests

6. The module should integrate with the overview orchestrator for step status calculation.
   Step 6 progress = number of mandatory plans with has_completed=1 out of 2.
   A plan is considered completed when objective !== null.

7. Use soft-delete pattern (deleted_at IS NULL) for all queries.

8. Use c.var.microplanningId for scoping all queries to the current microplanning context.

9. Mandatory plans are seeded automatically when no plans exist for a microplanning.
```

---

## Migration SQL

```sql
CREATE TABLE IF NOT EXISTS ws_microplanning_activity_plans (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  microplanning_id BIGINT NOT NULL,
  title VARCHAR(255) NOT NULL,
  objective TEXT,
  frequency VARCHAR(255),
  target_group_ids JSON,
  location_type_ids JSON,
  implementation_schedule TEXT,
  material_ids JSON,
  budget_estimation DOUBLE,
  budget_source_id BIGINT,
  additional_information TEXT,
  is_mandatory TINYINT(1) NOT NULL DEFAULT 0,
  has_completed TINYINT(1) NOT NULL DEFAULT 0,
  status TINYINT(1) NOT NULL DEFAULT 0,
  created_by BIGINT,
  updated_by BIGINT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME,
  INDEX idx_activity_plans_microplanning (microplanning_id),
  INDEX idx_activity_plans_mandatory (is_mandatory),
  INDEX idx_activity_plans_status (status),
  FOREIGN KEY (microplanning_id) REFERENCES ws_microplanning(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Seed Data for Mandatory Plans

```sql
-- Insert mandatory activity plans for each new microplanning record
-- This should be handled in the microplanning creation logic, not as a one-time seed.
-- Example trigger or service logic:
INSERT INTO ws_microplanning_activity_plans (microplanning_id, title, is_mandatory, has_completed, status, created_by, updated_by)
SELECT 
  mp.id,
  'Imunisasi Rutin di Puskesmas',
  1,
  0,
  0,
  mp.created_by,
  mp.created_by
FROM ws_microplanning mp
WHERE mp.id = ? AND NOT EXISTS (
  SELECT 1 FROM ws_microplanning_activity_plans ap 
  WHERE ap.microplanning_id = mp.id AND ap.title = 'Imunisasi Rutin di Puskesmas' AND ap.is_mandatory = 1
);

INSERT INTO ws_microplanning_activity_plans (microplanning_id, title, is_mandatory, has_completed, status, created_by, updated_by)
SELECT 
  mp.id,
  'Imunisasi di Sekolah',
  1,
  0,
  0,
  mp.created_by,
  mp.created_by
FROM ws_microplanning mp
WHERE mp.id = ? AND NOT EXISTS (
  SELECT 1 FROM ws_microplanning_activity_plans ap 
  WHERE ap.microplanning_id = mp.id AND ap.title = 'Imunisasi di Sekolah' AND ap.is_mandatory = 1
);
```
