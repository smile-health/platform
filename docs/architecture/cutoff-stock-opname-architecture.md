# Software Architecture Document: Cutoff Stock Opname

**Author**: Khoirul Annas  
**Email**: khoirul.annas@badr-interactive.co.id  
**Feature**: Cutoff Stock Opname  
**Implementation Period**: May 20, 2026 - June 02, 2026  
**Version**: 1.0  
**Date**: June 08, 2026  

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Business Context & Problem Statement](#2-business-context--problem-statement)
3. [System Overview](#3-system-overview)
4. [Architecture Design](#4-architecture-design)
5. [Database Schema Design](#5-database-schema-design)
6. [Component Architecture](#6-component-architecture)
7. [Integration Points](#7-integration-points)
8. [Data Flow](#8-data-flow)
9. [Validation & Business Rules](#9-validation--business-rules)
10. [Deployment Considerations](#10-deployment-considerations)
11. [Testing Strategy](#11-testing-strategy)

---

## 1. Introduction

### 1.1 Purpose
This document describes the software architecture for the **Cutoff Stock Opname** feature, a critical component of the SMILE Platform's inventory management system. The feature ensures that stock quantities recorded during stock opname (physical inventory) remain immutable after a specified cutoff date/time, preventing discrepancies between physical counts and system records.

### 1.2 Scope
- Database schema enhancements for stock opname periods and stock quantities
- Business logic for cutoff-based stock quantity management
- Integration with order fulfillment, shipment, and transaction modules
- API endpoint modifications for stock opname period management
- Master data export enhancements

### 1.3 Definitions

| Term | Definition |
|------|------------|
| **Cutoff Date** | A datetime field in `ws_stock_opname_periods` that marks the deadline after which stock quantities become immutable |
| **Cutoff Qty** | A field in `ws_stocks` that stores the stock quantity as of the cutoff date |
| **Stock Opname Period** | A defined timeframe for conducting physical inventory counts |
| **canUpdateCutoffQty()** | A repository method that determines whether cutoff quantities can be modified based on current date vs. cutoff date |

---

## 2. Business Context & Problem Statement

### 2.1 Problem Statement
In the traditional inventory management workflow, stock quantities (`qty`) in the system continuously change with every transaction (order fulfillment, stock addition/removal, discards, returns). This creates a mismatch between:

1. **Physical Stock Opname Count**: The actual count of items in the warehouse at a specific point in time
2. **System Stock Quantity**: The quantity that may have changed due to subsequent transactions

This discrepancy makes it impossible to:
- Accurately reconcile physical counts with system records
- Perform meaningful variance analysis
- Maintain audit trails for financial reporting

### 2.2 Solution
The **Cutoff Stock Opname** feature introduces a temporal boundary (cutoff date) that freezes stock quantities for reporting purposes while allowing normal business operations to continue. The system maintains two parallel quantity values:

- **`qty`**: Real-time quantity (updates with all transactions)
- **`cutoff_qty`**: Quantity as of cutoff date (immutable after cutoff)

---

## 3. System Overview

### 3.1 System Context

```
┌─────────────────────────────────────────────────────────────┐
│                     SMILE Platform                           │
│                                                             │
│  ┌──────────────────┐        ┌──────────────────────────┐  │
│  │ Stock Opname      │        │ Order Management System   │  │
│  │ Module            │◄──────►│                          │  │
│  │ - Period Mgmt     │        │ - Order Fulfillment      │  │
│  │ - Cutoff Logic    │        │ - Shipment Processing    │  │
│  │ - API Endpoints   │        │ - Order Status Tracking  │  │
│  └──────────────────┘        └──────────────────────────┘  │
│          │                              │                    │
│          │                              │                    │
│          ▼                              ▼                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Transaction Module                       │  │
│  │  - ADD_STOCK / REMOVE_STOCK / DISCARDS / RETURNS     │  │
│  └──────────────────────────────────────────────────────┘  │
│          │                                                   │
│          │                                                   │
│          ▼                                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Database Layer                           │  │
│  │  ws_stock_opname_periods  →  cutoff_date              │  │
│  │  ws_stocks                →  cutoff_qty               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Technology Stack

| Layer | Technology |
|-------|------------|
| **Runtime** | Node.js / NestJS Framework |
| **Database** | MySQL (via Kysely query builder) |
| **Validation** | Zod Schema Validation |
| **ORM/Query Builder** | Kysely |
| **Migration** | Kysely Migration |
| **Transaction Management** | Atomic database transactions |

---

## 4. Architecture Design

### 4.1 High-Level Architecture Pattern

The feature follows the **Domain-Driven Design (DDD)** pattern with **Clean Architecture** principles:

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  (Controllers, REST APIs, DTOs, Schema Validation)          │
├─────────────────────────────────────────────────────────────┤
│                     Application Layer                        │
│  (Use Cases, Services, Orchestration Logic)                  │
├─────────────────────────────────────────────────────────────┤
│                     Domain Layer                             │
│  (Business Rules, Entities, Repository Interfaces)           │
├─────────────────────────────────────────────────────────────┤
│                     Infrastructure Layer                     │
│  (Repositories, Database Access, External APIs)              │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Design Principles

1. **Single Responsibility**: Each module (order, transaction, stock-opname) handles its own logic
2. **Dependency Inversion**: High-level modules depend on abstractions (repositories)
3. **Atomic Operations**: All stock updates use atomic database transactions
4. **Temporal Consistency**: Cutoff logic is evaluated at runtime based on current timestamp
5. **Backward Compatibility**: Existing workflows continue to function with conditional updates

---

## 5. Database Schema Design

### 5.1 Entity Relationship Diagram

```
ws_stock_opname_periods (1) ──── can have many ──── (N) ws_stocks
         │                                                    │
         │ cutoff_date                                        │ cutoff_qty
         │                                                    │
         └────────────────────────────────────────────────────┘
```

### 5.2 Table Definitions

#### Table: `ws_stock_opname_periods`

```sql
CREATE TABLE ws_stock_opname_periods (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    warehouse_id BIGINT NOT NULL,
    month_period INT NOT NULL CHECK (month_period BETWEEN 1 AND 12),
    year_period INT NOT NULL CHECK (year_period >= 2000),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    cutoff_date DATETIME NOT NULL,  -- NEW COLUMN
    status INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    INDEX idx_warehouse_period (warehouse_id, year_period, month_period),
    INDEX idx_cutoff_date (cutoff_date)
);
```

**New Column Rationale**: `cutoff_date` stores the exact timestamp after which stock quantities become immutable for stock opname reporting purposes.

#### Table: `ws_stocks`

```sql
ALTER TABLE ws_stocks ADD COLUMN cutoff_qty DOUBLE UNSIGNED NOT NULL DEFAULT 0 AFTER unreceived_qty;
```

**Column Rationale**: `cutoff_qty` mirrors the `qty` field but represents the quantity captured at cutoff time. It updates synchronously with `qty` until the cutoff date is exceeded.

### 5.3 Migration Details

**Migration File**: `1779175342124_add_coloumn_cutoff_date_at_table_ws_stock_opname_periods.ts`

**Up Migration**:
```typescript
export async function up(db: Kysely<Database>): Promise<void> {
  // 1. Add cutoff_date to ws_stock_opname_periods
  await db.schema
    .alterTable("ws_stock_opname_periods")
    .addColumn("cutoff_date", sql`datetime after end_date`)
    .execute()

  // 2. Add cutoff_qty to ws_stocks
  await db.schema
    .alterTable("ws_stocks")
    .addColumn(
      "cutoff_qty",
      sql`double unsigned not null default 0 after unreceived_qty`
    )
    .execute()

  // 3. Backfill existing stock records
  await sql`UPDATE ws_stocks SET cutoff_qty = GREATEST(qty, 0) WHERE deleted_at IS NULL`.execute(db)
}
```

**Down Migration**:
```typescript
export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema
    .alterTable("ws_stock_opname_periods")
    .dropColumn("cutoff_date")
    .execute()

  await db.schema.alterTable("ws_stocks").dropColumn("cutoff_qty").execute()
}
```

**Data Backfill Strategy**: Existing stock records are initialized with `cutoff_qty = GREATEST(qty, 0)` to ensure non-negative values.

---

## 6. Component Architecture

### 6.1 Core Repository: `StockOpnamePeriodRepository`

**Location**: `apps/main/src/modules/stock-opname-period/stock-opname-period.repository.ts`

**Primary Responsibility**: Provide cutoff evaluation logic and stock opname period queries.

**Key Method: `canUpdateCutoffQty(c: Connection)`**

```typescript
async canUpdateCutoffQty(c: Connection): Promise<boolean> {
  // 1. Retrieve active stock opname period with cutoff_date
  // 2. Compare current datetime with cutoff_date
  // 3. Return true if current datetime < cutoff_date (can still update)
  //    Return false if current datetime >= cutoff_date (frozen)
}
```

**Logic Flow**:
```
Input: Database transaction context (c)
  ├─► Query: Find active stock opname period for current warehouse
  ├─► IF no active period exists
  │     └─► RETURN true (no cutoff restriction)
  │
  ├─► Compare: NOW() vs cutoff_date
  ├─► IF NOW() < cutoff_date
  │     └─► RETURN true (allow cutoff_qty updates)
  │
  └─► ELSE (NOW() >= cutoff_date)
        └─► RETURN false (freeze cutoff_qty)
```

### 6.2 Module Integration Map

| Module | File | Integration Point |
|--------|------|-------------------|
| **Stock Opname Period** | `stock-opname-period.module.ts` | Core: Manages cutoff_date field |
| **Order Central Delivery** | `order-central-delivery.module.ts` | Updates `cutoff_qty` on vendor stock fulfillment |
| **Order Status Fulfilled** | `order-status-fulfilled.module.ts` | Applies delta to `cutoff_qty` on customer stock fulfillment |
| **Order Status Ship** | `order-status-ship.module.ts` | Updates `cutoff_qty` during shipment |
| **Transaction Module** | `transaction.module.ts` | Updates `cutoff_qty` across all transaction types |
| **Consumption Module** | `consumption.module.ts` | Manages cutoff_qty on consumptions |
| **Master Data Export** | Export services | Includes cutoff_date in exports |

---

## 7. Integration Points

### 7.1 Order Fulfillment Integration (`order-central-delivery`)

**Trigger**: When a central delivery order is processed and vendor stock is deducted.

**Behavior**:
```typescript
// Check if cutoff_qty updates are allowed
const canUpdateCutoffQty = await this.stockOpnamePeriodRepo.canUpdateCutoffQty(c)

// Calculate new quantities
const newVendorQty = Number(vendorStock.qty) - Number(child.ordered_qty)

// Prepare update payload
const updateData = {
  qty: newVendorQty,
  in_transit_qty: Number(vendorStock.in_transit_qty) + Number(child.ordered_qty),
  // ... other fields
}

// Conditionally include cutoff_qty
if (canUpdateCutoffQty) {
  updateData.cutoff_qty = newVendorQty
}

// Execute update
await this.stockRepo.update(c, updateData, { id: vendorStock.id })
```

**Business Rule**: Vendor stock `cutoff_qty` is updated only if the current date is before the cutoff date.

### 7.2 Order Fulfillment Customer Stock (`order-status-fulfilled`)

**Trigger**: When an order is marked as fulfilled (received by customer).

**Atomic SQL Pattern**:
```sql
UPDATE ws_stocks SET
  qty = qty + qty_delta,
  unreceived_qty = GREATEST(unreceived_qty + unreceived_qty_delta, 0),
  cutoff_qty = GREATEST(COALESCE(NULLIF(cutoff_qty, 0), qty) + cutoff_qty_delta, 0)
WHERE id = ?
```

**Key Logic**:
- `COALESCE(NULLIF(cutoff_qty, 0), qty)` handles initialization: if `cutoff_qty` is 0 (not yet set), it uses current `qty` as baseline
- `GREATEST(..., 0)` ensures non-negative quantities (safety constraint)
- `cutoff_qty_delta` is applied only when `canUpdateCutoffQty` returns true

### 7.3 Transaction Module Integration

**Scope**: All transaction types in `TransactionModule`

**Transaction Types Affected**:
1. **ADD_STOCK** - Stock intake/entry
2. **REMOVE_STOCK** - Stock withdrawal
3. **DISCARDS** - Broken/damaged items
4. **RETURN** - Customer returns
5. **CANCEL_DISCARD** - Cancellation of previous discard
6. **PROGRAM_STOCK** - Program/asset stock allocation

**Pattern Applied**:
```typescript
// For each transaction processing method
const canUpdateCutoffQty = await this.stockOpnamePeriodRepo.canUpdateCutoffQty(c)

// During stock update
await this.stockRepo.update(c, {
  qty: qty.newQty,
  ...(canUpdateCutoffQty ? { cutoff_qty: qty.newQty } : {})
}, { id: stockId })
```

### 7.4 Consumption Module Integration

**Feature**: `cutoff_qty` management within consumption workflows  
**Commit**: `002e21785` (May 21, 2026)

---

## 8. Data Flow

### 8.1 Cutoff Qty Update Flow (Before Cutoff Date)

```
Transaction Trigger (Order Fulfillment, Stock Update, etc.)
    │
    ▼
canUpdateCutoffQty(connection)
    │
    ├─► Query active stock opname period
    │   WHERE NOW() < cutoff_date
    │
    ▼
true (can update)
    │
    ▼
Update ws_stocks SET
  qty = newQty,
  cutoff_qty = newQty  ← MIRRORS qty
```

### 8.2 Cutoff Qty Freeze Flow (After Cutoff Date)

```
Transaction Trigger (Order Fulfillment, Stock Update, etc.)
    │
    ▼
canUpdateCutoffQty(connection)
    │
    ├─► Query active stock opname period
    │   WHERE NOW() >= cutoff_date
    │
    ▼
false (cannot update)
    │
    ▼
Update ws_stocks SET
  qty = newQty           ← REAL-TIME quantity changes
  -- cutoff_qty unchanged (frozen)
```

### 8.3 Stock Opname Period Creation Flow

```
API Request: CreateStockOpnamePeriodRequest
    │
    ├─► Zod Validation: cutoff_date between start_date and end_date
    │
    ▼
Transform payload:
  cutoff_date: `${data.cutoff_date} 16:59:59`
    │
    ▼
Insert into ws_stock_opname_periods
  (includes cutoff_date field)
```

---

## 9. Validation & Business Rules

### 9.1 Zod Validation Schema

**File**: `apps/main/src/modules/stock-opname-period/stock-opname-period.schema.ts`

```typescript
export const CreateStockOpnamePeriodRequest = z.object({
  warehouse_id: z.number().int().positive(),
  month_period: z.number().int().min(1).max(12),
  year_period: z.number().int().min(2000),
  start_date: z.string().date(),
  end_date: z.string().date(),
  cutoff_date: z.string().date(),  // NEW: Required field
  status: z.number().int().optional(),
}).superRefine((val, c) => {
  // Existing: start_date must be <= end_date
  if (new Date(val.start_date) > new Date(val.end_date)) {
    c.addIssue({
      code: z.ZodIssueCode.custom,
      message: "validator.end_date_before_start_date",
      path: ["end_date"],
    })
  }
  
  // NEW: cutoff_date must be >= start_date
  if (new Date(val.cutoff_date) < new Date(val.start_date)) {
    c.addIssue({
      code: z.ZodIssueCode.custom,
      message: "validator.cutoff_date_before_start_date",
      path: ["cutoff_date"],
    })
  }
  
  // NEW: cutoff_date must be <= end_date
  if (new Date(val.cutoff_date) > new Date(val.end_date)) {
    c.addIssue({
      code: z.ZodIssueCode.custom,
      message: "validator.cutoff_date_after_end_date",
      path: ["cutoff_date"],
    })
  }
})
```

### 9.2 Business Rules Summary

| Rule # | Rule Description | Enforcement Location |
|--------|------------------|---------------------|
| BR-001 | `cutoff_date` must be within `[start_date, end_date]` | API Schema Validation |
| BR-002 | `cutoff_qty` updates only allowed when `NOW() < cutoff_date` | Repository `canUpdateCutoffQty()` |
| BR-003 | `cutoff_qty` cannot be negative (uses `GREATEST(..., 0)`) | Database Update Query |
| BR-004 | `cutoff_qty` initialization uses current `qty` if not set | Fulfillment Repository |
| BR-005 | Time component of `cutoff_date` is set to `16:59:59` (end of business day) | Payload Transformation |
| BR-006 | Migration backfills `cutoff_qty = GREATEST(qty, 0)` for existing data | Database Migration |

---

## 10. Deployment Considerations

### 10.1 Pre-Deployment Checklist

1. **Database Migration**:
   - [ ] Run migration `1779175342124_add_coloumn_cutoff_date_at_table_ws_stock_opname_periods.ts`
   - [ ] Verify `cutoff_qty` backfill completed successfully
   - [ ] Verify indexes created on `ws_stock_opname_periods.cutoff_date`

2. **Code Deployment Order**:
   - [ ] Deploy Stock Opname Period module (repository + controller)
   - [ ] Deploy Order modules (central-delivery, order-status-fulfilled, order-status-ship)
   - [ ] Deploy Transaction module
   - [ ] Deploy Consumption module
   - [ ] Deploy Export services

3. **Configuration**:
   - [ ] No new environment variables required
   - [ ] Verify database connection supports datetime precision

### 10.2 Rollback Strategy

**Option 1: Feature Flag** (Recommended)
```typescript
const canUpdateCutoffQty = process.env.ENABLE_CUTOFF_QTY === 'true'
  ? await this.stockOpnamePeriodRepo.canUpdateCutoffQty(c)
  : true  // Force true to maintain old behavior
```

**Option 2: Database Rollback**
```bash
# Execute down migration
kysely migrate:down 1779175342124_add_coloumn_cutoff_date_at_table_ws_stock_opname_periods
```

**Option 3: Code Rollback**
- Revert commits in reverse chronological order using git revert

### 10.3 Performance Considerations

| Concern | Mitigation |
|---------|-----------|
| `canUpdateCutoffQty()` called on every transaction | Add database index on `ws_stock_opname_periods.cutoff_date` |
| Large batch updates | Use atomic SQL operations, not row-by-row updates |
| Concurrent transaction processing | Database-level locking via Kysely transactions |

---

## 11. Testing Strategy

### 11.1 Unit Tests

**Target**: `StockOpnamePeriodRepository.canUpdateCutoffQty()`

```typescript
describe('canUpdateCutoffQty', () => {
  it('should return true when no active stock opname period exists')
  it('should return true when NOW() < cutoff_date')
  it('should return false when NOW() >= cutoff_date')
  it('should handle edge case: NOW() exactly equals cutoff_date')
})
```

### 11.2 Integration Tests

**Scenario 1: Order Fulfillment Before Cutoff**
```
Setup: Create stock opname period with cutoff_date = tomorrow
Action: Process order fulfillment
Assert: Both qty and cutoff_qty are updated
```

**Scenario 2: Order Fulfillment After Cutoff**
```
Setup: Create stock opname period with cutoff_date = yesterday
Action: Process order fulfillment
Assert: qty is updated, cutoff_qty remains unchanged
```

**Scenario 3: Stock Opname Period Creation**
```
Action: POST /api/stock-opname-period with cutoff_date
Assert: Validation error when cutoff_date > end_date
Assert: Validation error when cutoff_date < start_date
Assert: Success when cutoff_date within range
```

### 11.3 End-to-End Tests

1. **Full Workflow: Create Period → Process Transactions → Verify Cutoff**
2. **Regression: Ensure existing transaction flows are not broken**
3. **Export Validation: Verify cutoff_date appears in master data exports**

### 11.4 Data Integrity Tests

```sql
-- Verify no negative cutoff_qty values
SELECT COUNT(*) FROM ws_stocks WHERE cutoff_qty < 0;

-- Verify cutoff_qty initialized correctly
SELECT COUNT(*) FROM ws_stocks WHERE cutoff_qty = 0 AND qty > 0;

-- Verify cutoff_date constraints
SELECT * FROM ws_stock_opname_periods 
WHERE cutoff_date < start_date OR cutoff_date > end_date;
```

---

## 12. Commit History

| Date | Commit | Description |
|------|--------|-------------|
| May 20, 2026 | `f5de292c` | Add payload cutoff_date when creating stock opname period |
| May 20, 2026 | `f7d2bfcf` | Add UPDATE query for cutoff_qty backfill in migration |
| May 20, 2026 | `1b3ec8f9` | Update cutoff_qty on order fulfillment (central delivery) |
| May 20, 2026 | `d8e38275` | Update cutoff_qty on order status flow |
| May 20, 2026 | `fd78f1b0` | Duplicate migration fix for cutoff_qty |
| May 21, 2026 | `002e2178` | Implementation cutoff_qty on module consumptions |
| May 21, 2026 | `44627750` | Implementation update cutoff_qty on module transactions |
| May 21, 2026 | `48a66283` | Duplicate transaction module implementation |
| May 21, 2026 | `b9f873ae` | Duplicate consumption module implementation |
| May 21, 2026 | `e84a1e11` | Duplicate cutoff hours fix |
| May 22, 2026 | `017de79d` | Duplicate cutoff_date payload commit |
| May 22, 2026 | `1e06501f` | Duplicate period_id fix for cutoff_qty retrieval |
| May 22, 2026 | `d8e38275` | Duplicate cutoff_qty sales order logic |
| May 25, 2026 | `66f3bf37` | Add hours to cutoff_date time component |
| May 25, 2026 | `e84a1e11` | Duplicate hours fix |
| Jun 02, 2026 | `fbf4a2e8` | Fix cutoff date validation when updating cutoff_qty |
| Jun 02, 2026 | `48209f69` | Add cutoff date to master data exports |
| Jun 02, 2026 | `75d27e0a` | Duplicate master data export cutoff date |

---

## 13. Future Enhancements

| Enhancement | Description | Priority |
|-------------|-------------|----------|
| **Cutoff Date History** | Track changes to cutoff dates for audit purposes | Medium |
| **Partial Cutoff** | Support per-material or per-category cutoff dates | Low |
| **Cutoff Notification** | Notify warehouse managers before cutoff date | Medium |
| **Batch Cutoff Update** | Recalculate cutoff_qty for completed periods | Low |
| **Analytics Dashboard** | Show variance between qty and cutoff_qty | High |

---

## Appendix A: Error Handling

| Scenario | Error Type | HTTP Status | User Message |
|----------|-----------|-------------|---------------|
| `cutoff_date` > `end_date` | ValidationError | 400 | "validator.cutoff_date_after_end_date" |
| `cutoff_date` < `start_date` | ValidationError | 400 | "validator.cutoff_date_before_start_date" |
| No active stock opname period | N/A | N/A | Returns `canUpdateCutoffQty = true` |
| `cutoff_qty` < 0 (attempted) | Safety Guard | N/A | Prevented by `GREATEST(..., 0)` |

---

## Appendix B: Monitoring & Observability

### Key Metrics to Track
1. **Transaction Success Rate**: % of transactions that successfully update `cutoff_qty`
2. **Cutoff Freeze Events**: Count of transactions after cutoff date (should not update `cutoff_qty`)
3. **Migration Duration**: Time taken for `cutoff_qty` backfill
4. **Validation Errors**: Count of `cutoff_date` validation failures

### Logging Points
```typescript
// In canUpdateCutoffQty
logger.info('Cutoff evaluation', {
  warehouseId,
  cutoffDate,
  currentTime: new Date(),
  canUpdate: result
})

// In transaction handlers
if (!canUpdateCutoffQty) {
  logger.warn('Cutoff freeze active - cutoff_qty not updated', {
    stockId,
    transactionType,
    cutoffDate,
    currentTime: new Date()
  })
}
```

---

**End of Document**
