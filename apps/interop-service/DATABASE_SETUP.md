# Database Setup Guide

## Overview

The Interop Service requires manual database setup before first startup. This approach gives you full control over schema changes and avoids automated migration issues.

## Prerequisites

- ✅ AWS RDS MySQL instance running and accessible
- ✅ Database credentials configured in `.env` file
- ✅ `smile_interop` database already created (If it is not already there, please see the commands in next section)
- ✅ MySQL client installed (MySQL Workbench, command-line, or other)

## Required Tables

The service requires these tables to operate:

1. **`openhim_route_mappings`** - Routing configuration
2. **`openhim_route_execution_logs`** - Audit trail

## Setup Instructions

### Prep Step: Create Interop Database in AWS RDS, if not already created.

Use the below statement to create the `smile_interop` database.

```bash
CREATE DATABASE `smile_interop` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
```

### Step 1: Connect to AWS RDS

Using MySQL Workbench or command line:

```bash
mysql -h app-smile5-uat.cxeycqoo6axz.ap-southeast-3.rds.amazonaws.com \
      -u smile5_app_usr \
      -p \
      -D smile_interop
```

Or use your preferred MySQL client with these connection details:

- **Host**: `app-smile5-uat.cxeycqoo6axz.ap-southeast-3.rds.amazonaws.com`
- **Port**: `3306`
- **Database**: `smile_interop`
- **User**: From `DB_USER` in `.env`
- **Password**: From `DB_PASSWORD` in `.env`

### Step 2: Execute Schema Script

Once connected, run the schema creation script:

```bash
# From project root
mysql -h <host> -u <user> -p smile_interop < apps/interop-service/db-scripts/schema.sql
```

Or copy-paste the contents of `schema.sql` into your MySQL client and execute.

### Step 3: Verify Tables Created

Verify the tables were created successfully:

```sql
USE smile_interop;
SHOW TABLES;

-- You should see:
-- +-------------------------+
-- | Tables_in_smile_interop |
-- +-------------------------+
-- | openhim_route_execution_logs |
-- | openhim_route_mappings       |
-- +-------------------------+

-- Check table structures
DESC openhim_route_mappings;
DESC openhim_route_execution_logs;
```

### Step 4: (Optional) Seed Initial Data

If you want to pre-populate routing configurations:

```bash
# From project root
mysql -h <host> -u <user> -p smile_interop < apps/interop-service/db-scripts/route-mapping-insert.sql
```

## Starting the Service

Once database setup is complete, start the service normally:

```bash
cd apps/interop-service

# Development
pnpm dev

# Production
pnpm build
pnpm start
```

The service will:

1. ✅ Auto-create `smile_interop` database if it doesn't exist
2. ✅ Validate that required tables exist
3. ❌ **Fail with clear error** if tables are missing

## Support

If you encounter issues during database setup:

1. Check this document first
2. Verify AWS RDS connectivity: `telnet <host> 3306`
3. Check `.env` file for correct credentials
4. Review service logs for specific error messages
5. Consult with DevOps team for AWS RDS access issues
