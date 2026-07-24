# infra/openhim — OpenHIM Initialization

This directory contains the custom Docker image, initialization scripts, and
configuration data for the OpenHIM Core instance used by the SMILE 5.0 interop
layer.

---

## Directory Structure

```
infra/openhim/
├── Dockerfile                   # Custom image built on jembi/openhim-core
├── config/
│   └── openhim-insert.json      # Exported OpenHIM config (users, clients, channels, mediators)
├── certs/                       # TLS certificate injection point (mounted read-only)
└── init-scripts/
    ├── entrypoint.sh            # Container entrypoint — orchestrates startup
    ├── init-admin-user.sh       # Creates and activates the admin user via REST API
    ├── create-token-passport.js # Creates the SHA-512 token passport in MongoDB
    ├── import-config.js         # Imports openhim-insert.json into a running OpenHIM
    └── lib/
        ├── api-client.js        # HTTPS client with retry logic for OpenHIM REST API
        ├── data-transformer.js  # Strips internal fields (_id, __v) before import
        ├── validator.js         # Validates the JSON config file structure
        └── logger.js            # Dual-output logger (stdout + rotating log file)
```

---

## Container Entrypoint Flow

The container runs `entrypoint.sh` as its CMD. The sequence is:

```
entrypoint.sh
│
├── 1. npm start &               Start OpenHIM Core in the background
│      └── Verify PID alive after 5s — abort if dead
│
├── 2. Poll https://localhost:8080/heartbeat
│      └── Max 120s; checks PID alive on each tick — abort if process dies
│
├── 3. init-admin-user.sh        Create + activate the admin user
│      ├── Checks if user already exists (idempotent)
│      ├── POST /users           Create user
│      ├── PUT /users/:email     Activate (clears newUser lock)
│      └── create-token-passport.js
│             └── Inserts SHA-512 token passport into MongoDB passports collection
│                 (required for openhim-mediator-utils API authentication)
│
├── 4. import-config.js          Import openhim-insert.json (idempotent)
│      ├── Phase 2: Validate JSON file structure
│      ├── Phase 3: Wait for OpenHIM healthcheck
│      ├── Phase 4: Import Users     (skip if already exists)
│      ├── Phase 5: Import Clients   (skip if already exists)
│      ├── Phase 6: Import Channels  (skip if already exists)
│      └── Phase 7: Import Mediators (skip if already exists, strip runtime fields)
│
└── 5. wait $OPENHIM_PID         Hand off — container lifetime = OpenHIM process lifetime
```

**Failure behaviour:** any step that fails causes `entrypoint.sh` to kill the
OpenHIM process and exit non-zero. Docker / Compose will detect this and report
the failure clearly rather than leaving a partially initialized container running.

**Idempotency:** all init steps are safe to re-run. Existing resources are
detected and skipped; only missing ones are created.

---

## Why the Token Passport?

OpenHIM supports two authentication mechanisms:

| Protocol | Used by | How created |
|----------|---------|-------------|
| `local` (bcrypt) | Web UI login | Automatically on `POST /users` |
| `token` (SHA-512) | `openhim-mediator-utils` (mediator registration) | **Not** created by the API — must be inserted directly into MongoDB |

When a user is created via the REST API, OpenHIM only creates the `local`
passport. The `token` passport must be created separately — that is what
`create-token-passport.js` does. Without it, mediator registration will fail
with an authentication error even if the password is correct.

---

## Environment Variables

All variables are declared in `infra/.env` and passed to the container via
`compose-openhim.yml`. No defaults are hardcoded in scripts — a missing
variable will cause a loud startup failure rather than a silent weak-password
deployment.

### OpenHIM Core (passed to `openhim-core` process)

| Variable | Description |
|----------|-------------|
| `mongo_url` | MongoDB connection string (interpolated by Compose from `OPENHIM_MONGO_PASSWORD`) |
| `mongo_atnaUrl` | ATNA audit MongoDB connection string |
| `logger_level` | OpenHIM log level (`info`, `debug`, etc.) — sourced from `OPENHIM_LOG_LEVEL` |

### Initialization Scripts

| Variable | Used by | Description |
|----------|---------|-------------|
| `OPENHIM_ROOT_USER` | `init-admin-user.sh`, `api-client.js` | OpenHIM built-in root user email (default: `root@openhim.org`) |
| `OPENHIM_ROOT_PASSWORD` | `init-admin-user.sh`, `api-client.js` | Root user password — set at MongoDB init time |
| `OPENHIM_ADMIN_USERNAME` | `init-admin-user.sh` | Custom admin user to create |
| `OPENHIM_ADMIN_EMAIL` | `init-admin-user.sh`, `create-token-passport.js` | Email for the admin user (used as login identifier) |
| `OPENHIM_ADMIN_PASSWORD` | `init-admin-user.sh`, `create-token-passport.js` | Password for the admin user |
| `mongo_url` | `create-token-passport.js` | MongoDB URL — same value as used by OpenHIM Core |
| `OPENHIM_CONFIG_FILE` | `import-config.js` | Path to the JSON config file (default: `/etc/openhim/config/openhim-insert.json`) |
| `OPENHIM_LOG_DIR` | `import-config.js` | Directory for import log files (default: `/var/log/openhim`) |

### MongoDB

| Variable | Description |
|----------|-------------|
| `OPENHIM_MONGO_PASSWORD` | Password for the MongoDB `root` user — set once at volume init; changing it after init requires a manual DB password reset |

> **Note on `OPENHIM_ROOT_PASSWORD` vs `OPENHIM_MONGO_PASSWORD`:** These are
> two different passwords. `OPENHIM_MONGO_PASSWORD` is the MongoDB database
> root credential. `OPENHIM_ROOT_PASSWORD` is the OpenHIM application root
> user password stored inside the `openhim` database. Both are initialized from
> `.env` and must match what was used when the volumes were first created.

---

## openhim-insert.json

Exported from OpenHIM via the console (Exporter tool) or directly from MongoDB.
Contains:

| Resource | Count | Notes |
|----------|-------|-------|
| Users | 4 | `root@openhim.org`, `admin@openhim.local`, two test users |
| Clients | 2 | `smile-app`, `wms-app` |
| Channels | 20 | All SMILE event channels + adapter channels |
| Mediators | 1 | `urn:mediator:smile-rule-router` — the Rule Router mediator definition |
| ContactGroups | 0 | Not yet used |

Import is **idempotent** — running it against a fully-configured OpenHIM instance
will skip all existing resources and exit 0. Runtime-only fields (`_lastHeartbeat`,
`_uptime`, `_id`, `__v`) are stripped before each resource is sent to the API.

To re-export after making changes in the OpenHIM console:
1. Go to **Console → Export/Import**
2. Export all resources
3. Replace `infra/openhim/config/openhim-insert.json`
4. Rebuild and redeploy the `openhim-core` container

---

## Rebuilding & Redeploying

```bash
# From infra/ directory
docker compose -f compose-openhim.yml --env-file .env build openhim-core --no-cache
docker compose -f compose-openhim.yml --env-file .env up -d openhim-core

# Watch the full init sequence
docker logs openhim-core -f
```

The initialization log file is also persisted in the `openhim_logs` Docker
volume at `/var/log/openhim/import-<timestamp>.log`.

---

## Ports

| Port | Purpose | Bound to |
|------|---------|----------|
| `OPENHIM_CORE_PORT` (8080) | Admin API (HTTPS) | `127.0.0.1` only |
| `OPENHIM_CORE_HTTPS_PORT` (8443) | Admin API alternate HTTPS | `127.0.0.1` only |
| `OPENHIM_API_PORT` (5000) | Mediator / router HTTPS port | `127.0.0.1` only |
| `OPENHIM_HTTP_PORT` (5001) | Mediator / router HTTP port | `127.0.0.1` only |
| `OPENHIM_HTTPS_PORT` (5002) | Mediator / router HTTPS (alt) | `127.0.0.1` only |
| `OPENHIM_CONSOLE_PORT` (9000) | Web UI | `127.0.0.1` only |
