// Database Module Exports

export {
  ensureDatabaseExists,
  createDatabase,
  checkDatabaseHealth,
  closeDatabase,
  validateRequiredTables,
} from "./connection";
export type {
  Database,
  RouteMappingTable,
  ExecutionLogTable,
} from "./connection";
