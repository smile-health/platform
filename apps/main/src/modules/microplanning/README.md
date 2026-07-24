# Microplanning Module

## Overview

The Microplanning module manages the end-to-end microplanning workflow for immunization programs. It is organized as a **7-step sequential process** (steps 0–6), of which **steps 0–5 are currently implemented** and **step 6 is designed**.

The central orchestrator is the [`overview/`](overview) module, which coordinates step status aggregation, submission, and configuration retrieval. Each step is backed by one or more dedicated modules.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                       OVERVIEW (Orchestrator)                       │
│  microplanning.controller.ts  ←  microplanning.module.ts            │
│  GET /steps  |  POST /submit  |  GET /config                        │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ delegates to
          ┌────────────────────┼────────────────────┐
          ▼                    ▼                    ▼
   ┌───────────┐     ┌─────────────────┐   ┌────────────────┐
   │           │     │  Step Modules   │   │  Repositories  │
   │ Dashboard │     │ (0 → 1 → 2 →   │   │  (data access) │
   │   API     │     │  3 → 4 → 5 → 6)│   │                │
   └───────────┘     └─────────────────┘   └────────────────┘
```

The [`overview/microplanning.module.ts`](overview/microplanning.module.ts) is the **central brain**. It:
- Calls each step module's logic to compute progress status.
- Merges "bias" and "non-bias" sub-steps when no category filter is applied (steps 1 & 2).
- Handles microplanning submission by locking all step data (sets `status = 1` across all related tables).
- Lists microplanning configuration from `ws_microplanning_config`.

---

## Steps

### Step 0 — Input Target Data

**Modules:** [`targets/`](targets)

**Purpose:** Import and manage immunization target individuals (by NIK) for villages and schools within a sub-district.

**Key responsibilities:**
- CRUD for target records (`ws_targets` table).
- XLS/XLSX template download and bulk import.
- Summary views grouped by target group, age, gender, etc.
- Absolute target creation for "out-of-school" calculations.

**Status calculation:** The overview module counts villages and schools that have at least one target record. Step 0 is marked complete when every village and school in the sub-district has targets.

---

### Step 1 — Target Estimation

**Modules:**
- [`target-estimation/`](target-estimation) — Core business logic
- [`target-estimation-bias/`](target-estimation-bias) — Repository for school (bias) estimation
- [`target-estimation-non-bias/`](target-estimation-non-bias) — Repository for village (non-bias) estimation

**Purpose:** Calculate and record estimation details for immunization service delivery — both for **village-based (non-bias)** and **school-based (bias)** populations.

**Key responsibilities:**
- Save/update village estimation details (outreach service %, facility service %, required services, vaccinator availability, health worker gaps, etc.).
- Save/update school estimation details (schedule month, required service days, available vaccinators, etc.).
- Calculate target estimations with configurable formulas.
- Immunization service dashboard per village/school.
- Community health worker summary.
- Data checker and injection dashboard.

**Status calculation:** The overview module checks `ws_village_estimation_details` (non-bias) and `ws_school_estimation_details` (bias) for completed records. When no category filter is applied, bias and non-bias sub-steps are **merged** into one step with combined progress.

---

### Step 2 — Vaccine & Immunization Materials

**Modules:**
- [`immunization-logistics/`](immunization-logistics) — Combined logistics views
- [`non-bias-immunization-logistics/`](non-bias-immunization-logistics) — Village (non-bias) logistics
- [`bias-immunization-logistics/`](bias-immunization-logistics) — School (bias) logistics
- [`material-targets/`](material-targets) — Material targets listing
- [`mp-config/`](mp-config) — Microplanning program configuration

**Purpose:** Calculate and manage vaccine & immunization material needs based on target estimations.

**Key responsibilities:**
- **non-bias:** Save village immunization achievement data, calculate logistics (vaccine vials, syringes, safety boxes), recalculate estimation/IP rates, export calculation details to XLS.
- **bias:** Save school immunization data, calculate school-level logistics, recalculate estimation/IP rates.
- **combined view:** Routine immunization counts, vaccine vials used, vaccine utilization rate, projected vaccine needs (yearly/monthly), immunization achievements, vial needs by school.
- **material-targets:** Paginated list of material target configurations.
- **mp-config:** Active program config retrieval, material-target configs (with IP/coverage), material substitutions.

**Status calculation:** The overview module checks `ws_material_needs` for completed records per village (non-bias) and school (bias). Like step 1, bias and non-bias sub-steps are merged when no category is specified.

---

### Step 3 — Healthcare Map

**Modules:**
- [`map-service-point/`](map-service-point) — Service point mapping
- [`map-destination/`](map-destination) — Destination mapping
- [`map-route/`](map-route) — Route mapping

**Purpose:** Create the geographic/digital map of immunization service delivery points, destinations, and routes.

**Key responsibilities:**
- **Service Point:** Define the healthcare facility's service point on the map (GET, POST, DELETE).
- **Destination:** Define destination locations where immunization services will be delivered (list, bulk create, delete).
- **Route:** Define routes from service point to destinations (detail, create, delete) with middleware that resolves service point references.

**Status calculation:** The overview module checks three boolean flags: `service_point_exists`, `destination_exists`, and `route_exists`. Step 3 progress = number of these flags that are true out of 3.

---

### Step 4 — Area Prioritization Decision

**Module:** [`priority-areas/`](priority-areas)

**Purpose:** Prioritize villages/areas for immunization service delivery based on decision criteria.

**Key responsibilities:**
- List priority areas with optional village filter.
- Bulk save priority areas (assign villages as priority).
- Update priority rankings for areas.
- Get rankings and summary views.

**Status calculation:** The overview module queries `ws_priority_areas` and tracks two sub-tasks:
1. All villages have been filled/assigned as priority areas.
2. All priority areas have a `priority_rank` assigned.

Progress = number of completed sub-tasks out of 2. The response also includes `detail.filled_villages` and `detail.total_villages`.

---

### Step 5 — Problem Solution

**Module:** [`problem-solution/`](problem-solution)

**Purpose:** Identify problems and define solutions for each village in the microplanning area.

**Key responsibilities:**
- List all villages with problem type counts.
- Create problem-solution records per village (2 problem types per village required).
- Update and delete individual solutions.
- Get summary of problem type distribution and progress.

**Status calculation:** The overview module queries `ws_microplanning_problem_solutions` and tracks villages that have exactly 2 problem types filled. Progress = completed villages / total villages.

---

### Step 6 — Activity Plan

**Module:** [`activity-plan/`](activity-plan)

**Purpose:** Define and manage activity plans for immunization programs. There are **2 mandatory activity plans** that must be completed before submission, plus optional plans that users can create.

**Key responsibilities:**
- List all activity plans (mandatory plans always shown with `has_completed` flag).
- Get detail of a specific activity plan.
- Create optional activity plans.
- Update activity plan details (sets `has_completed = true` for mandatory plans when filled).
- Delete optional activity plans (mandatory plans cannot be deleted).
- Get summary with plan counts and progress percentage.

**Mandatory Plans:**
| Title | Description |
|-------|-------------|
| `Imunisasi Rutin di Puskesmas` | Routine immunization at the health center |
| `Imunisasi di Sekolah` | School-based immunization |

**Activity Plan Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Activity plan title (fixed for mandatory) |
| `objective` | text | Free-text objective description |
| `frequency` | string | Free-text frequency |
| `target_group_ids` | JSON | Array of target group IDs |
| `location_type_ids` | JSON | Array of location type IDs |
| `implementation_schedule` | text | Free-text schedule |
| `material_ids` | JSON | Array of material IDs |
| `budget_estimation` | decimal | Estimated budget |
| `budget_source_id` | bigint | FK to budget source |
| `additional_information` | text | Free-text additional info |

**Status calculation:** The overview module queries `ws_microplanning_activity_plans` and counts mandatory plans where `has_completed = 1`. Progress = completed mandatory plans / 2. Optional plans do not affect step completion.

---

## Category Filtering (Bias / Non-Bias)

The `GET /steps` endpoint accepts an optional `category` query parameter:

| Category   | Behavior                                                      |
|------------|---------------------------------------------------------------|
| `"bias"`   | Shows only school-based steps (bias estimation + bias material) |
| `"non-bias"` | Shows only village-based steps (non-bias estimation + non-bias material) |
| *(omitted)* | Merges both bias and non-bias sub-steps into single steps 1 & 2 |

The merging logic lives in [`microplanning.module.ts`](overview/microplanning.module.ts):
- [`#mergeEstimationSteps()`](overview/microplanning.module.ts:79) — Combines bias + non-bias sub-steps for step 1.
- [`#mergeMaterialSteps()`](overview/microplanning.module.ts:110) — Combines bias + non-bias sub-steps for step 2.

When category is omitted, step 3 (Healthcare Map) and step 4 (Priority Areas) are also included.

---

## Submission Flow

The `POST /submit` endpoint in [`microplanning.controller.ts`](overview/microplanning.controller.ts) triggers [`submitMicroplanning()`](overview/microplanning.module.ts:620) which:

1. Validates that a draft microplanning record exists (`status = 0`).
2. Fetches all current step statuses (implicit validation).
3. Atomically updates `status = 1` across all related tables:
   - `ws_microplanning`
   - `ws_targets`
   - `ws_village_estimation_details`
   - `ws_school_estimation_details`
   - `ws_material_needs`
   - `ws_map_service_points`
   - `ws_map_destinations`
   - `ws_map_routes`
   - `ws_microplanning_problem_solutions`
   - `ws_microplanning_activity_plans`

---

## Dashboard

**Module:** [`dashboard/`](dashboard)

Provides analytics and reporting APIs:
- Target vs Consumption (by age group and by material)
- Total target data
- Batch information by material ID
- XLS export for material target vs consumption

---

## Configuration

The `GET /config` endpoint in [`microplanning.controller.ts`](overview/microplanning.controller.ts) reads from `ws_microplanning_config` via [`MicroplanningRepository.getMicroplanningConfig()`](overview/microplanning.repository.ts:308).

Additionally, [`mp-config/`](mp-config) provides low-level repository access to:
- Active `ws_mp_program_config` records (by year/category).
- Material-target configurations with coverage/IP lookups.
- Material substitution mappings.

---

## Module Dependency Diagram

```
                         ┌──────────────────┐
                         │    overview/      │
                         │  (Orchestrator)   │
                         └──┬────┬────┬─────┘
                            │    │    │
              ┌─────────────┘    │    └─────────────┐
              ▼                  ▼                  ▼
      ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
      │  targets/    │   │   target-    │   │  dashboard/  │
      │  (Step 0)    │   │  estimation/ │   │  (Analytics) │
      └──────────────┘   │  (Step 1)    │   └──────────────┘
                         └──┬──────┬────┘
                            │      │
                 ┌──────────┘      └──────────┐
                 ▼                             ▼
      ┌────────────────────┐      ┌────────────────────────┐
      │ target-estimation- │      │ target-estimation-     │
      │ non-bias/          │      │ bias/                  │
      │ (village repo)     │      │ (school repo)          │
      └────────────────────┘      └────────────────────────┘

                         ┌──────────────────┐
                         │  immunization-   │
                         │  logistics/      │
                         │  (Step 2 views)  │
                         └──┬──────┬───────┘
                            │      │
                 ┌──────────┘      └──────────┐
                 ▼                             ▼
      ┌────────────────────┐      ┌────────────────────────┐
      │ non-bias-immunization-│   │ bias-immunization-     │
      │ logistics/          │   │ logistics/              │
      │ (village logistics) │   │ (school logistics)      │
      └────────────────────┘      └────────────────────────┘

      ┌──────────────┐      ┌──────────────────┐
      │ material-    │      │    mp-config/     │
      │ targets/     │      │  (Config repos)   │
      │ (List view)  │      └──────────────────┘
      └──────────────┘

      ┌────────────────────────────────────────────┐
      │              Map Modules (Step 3)           │
      │  ┌────────────┐ ┌──────────┐ ┌──────────┐  │
      │  │ map-service│ │map-dest- │ │map-route │  │
      │  │ -point/    │ │ination/  │ │          │  │
      │  └────────────┘ └──────────┘ └──────────┘  │
      └────────────────────────────────────────────┘

      ┌──────────────────┐
      │  priority-areas/ │
      │   (Step 4)       │
      └──────────────────┘

      ┌──────────────────┐
      │ problem-solution/│
      │   (Step 5)       │
      └──────────────────┘

      ┌──────────────────┐
      │  activity-plan/  │
      │   (Step 6)       │
      └──────────────────┘
```

---

## Key Data Tables

| Table                                 | Module(s) Using It                         | Step |
|---------------------------------------|--------------------------------------------|------|
| `ws_targets`                          | `targets/`, `overview/`                    | 0    |
| `ws_village_estimation_details`       | `target-estimation/`, `target-estimation-non-bias/`, `overview/` | 1 |
| `ws_school_estimation_details`        | `target-estimation/`, `target-estimation-bias/`, `overview/`     | 1 |
| `ws_material_needs`                   | `non-bias-immunization-logistics/`, `bias-immunization-logistics/`, `immunization-logistics/`, `overview/` | 2 |
| `ws_mp_program_config`                | `mp-config/`                                | 2 |
| `ws_mp_material_target_config`        | `mp-config/`, `material-targets/`           | 2 |
| `ws_map_service_points`               | `map-service-point/`, `overview/`           | 3 |
| `ws_map_destinations`                 | `map-destination/`, `overview/`             | 3 |
| `ws_map_routes`                       | `map-route/`, `overview/`                   | 3 |
| `ws_priority_areas`                   | `priority-areas/`, `overview/`              | 4 |
| `ws_microplanning_problem_solutions`  | `problem-solution/`, `overview/`            | 5 |
| `ws_microplanning_activity_plans`     | `activity-plan/`, `overview/`               | 6 |
| `ws_microplanning`                    | `overview/` (all modules via context)       | All |
| `ws_microplanning_config`             | `overview/`                                 | Config |
