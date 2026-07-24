# DB cleanup notes — Indonesia-only module removal

This is a **notes-only** document, not an executed migration. Application code for
ASIK, BIOFARMA, SIHA, DIN, SISMAL, EMONEV, and BMHP has been removed from
`apps/core`, `apps/main`, and `apps/warehouse-service`, but the database schema
these modules owned has **not** been touched. Historical migration files are left
in place (they're likely already applied in real environments — deleting them
would corrupt migration history, not the schema).

Do not run any of this without DBA review. Nothing here has been tested against
a live database.

## Tables with no remaining application code reader

### ASIK (apps/main)
- `integration_asik_aggregate`

### BIOFARMA (apps/main)
- `integration_biofarma_orders`
- `integration_biofarma_smdv_orders`

### EMONEV (apps/main)
- `integration_emonev_materials`
- `integration_emonev_provinces`
- `integration_emonev_regencies`
- `integration_emonev_regencies_updated`

### warehouse-service (smile-vs-asik / smile-vs-biofarma reconciliation)
No dedicated tables — these modules only ran read queries (via the deleted
`ddl/`/`dql/` SQL files) against shared warehouse tables. Nothing to drop here.

### SIHA / DIN / SISMAL
No dedicated tables were found — these modules read/wrote through shared core
tables (`ws_orders`, `ws_materials`, `ws_activities`, `integration_logs`, etc.),
which are still in active use by other features. **Nothing to drop for these
three** — the removal was code-only.

## BMHP tables (apps/main) — largest set, ~20 tables with FK relationships

Deletion order matters: child tables (with FKs pointing at other bmhp tables)
must drop before the tables they reference. Suggested drop order (children
first), based on the FKs found in the original migrations:

1. `ws_bmhp_examination_parameters` (FK → bmhp_examinations, bmhp_parameters)
2. `ws_bmhp_examination_target_groups` (FK → bmhp_examinations, bmhp_target_groups)
3. `ws_bmhp_examination_methods` (FK → bmhp_examinations, bmhp_examination_methods)
4. `ws_bmhp_examination_target_materials`
5. `ws_bmhp_revision_notifications` (FK → ws_bmhp_approval_periods and/or approval signatures — verify)
6. `ws_bmhp_desk_results` (FK → ws_bmhp_approval_periods)
7. `ws_bmhp_approval_logs` (FK → ws_bmhp_approval_periods)
8. `ws_bmhp_stock_recaps` (FK → ws_bmhp_approval_periods)
9. `ws_bmhp_screening_completions` (multiple FKs — verify against ws_bmhp_approval_periods / ws_bmhp_planning)
10. `ws_bmhp_material_calculations` (multiple FKs)
11. `ws_bmhp_approval_period_province` (FK → entities, ws_bmhp_approval_periods)
12. `ws_bmhp_approval_signature` / `bmhp_approval_signatures` (check FK direction — a later migration adds `approval_signature_id` to approval_periods/desk_results, meaning drop order between these three needs re-verification against the live schema before executing)
13. `ws_bmhp_approval_periods`
14. `ws_bmhp_planning_materials` (FK → ws_bmhp_material_variant, variant_id column)
15. `ws_bmhp_planning_methods`
16. `ws_bmhp_planning_target_groups`
17. `ws_bmhp_planning`
18. `ws_bmhp_material_variant_detail`
19. `ws_bmhp_material_variant`
20. `ws_bmhp_materials_unit_details`
21. `ws_bmhp_material_details`
22. `bmhp_materials`
23. `bmhp_examinations`
24. `bmhp_examination_types`
25. `bmhp_examination_methods`
26. `bmhp_parameters`
27. `bmhp_target_groups`

Additional FK to check before dropping: several bmhp tables reference
`ws_program_plans.id` (added via `1771393543378_alter-bmhp-tables-add-program-plan-id`)
and `notification_types` (seeded via `1776696490037_seed-notification_type-bmhp-revision`).
Those are core shared tables — do **not** drop them, only remove the FK
columns/rows pointing at the deleted bmhp tables if they'd otherwise dangle.

**Before executing:** re-derive the exact FK graph from the live database
(`SHOW CREATE TABLE` or `information_schema.KEY_COLUMN_USAGE`) rather than
trusting this list blindly — several BMHP migrations were "fix"/"alter" passes
that may have changed FK targets after the original `CREATE TABLE`.

## Deferred (not in scope for this removal — do not drop)

- `entities.id_satu_sehat` column + `SATUSEHAT` user-type enum value — shared
  core column, still read by generic entity/order-integration code.
- `materials.is_kfa` column + `KFA_LEVEL_CODE_TO_ID` hierarchy levels — this is
  the material classification mechanism used throughout ordering/stock/disposal,
  not an isolated Indonesia integration.
- `ws_orders.biofarma_changed` / `code_biofarma` columns — read across
  order/disposal/allocation/relocation schemas, same category as above.
- `GLOBAL_MATERIAL_TYPES` `"bmhp"` entry in `apps/main/src/common/constants/material.ts`
  — this is a general material-type label (medicine/vaccine/bhp/bmhp/asset), a
  different and more fundamental concept than the BMHP program-plan module that
  was removed. Left untouched.
