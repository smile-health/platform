# Keycloak ↔ OpenHIM SSO Integration

## Overview

This document describes the Single Sign-On (SSO) integration between the SMILE Keycloak instance and OpenHIM. After this integration, users managed in Keycloak can log in to OpenHIM using their Keycloak credentials. OpenHIM's local login remains available in parallel for users that exist only in OpenHIM.

---

## Architecture

```
Browser
  │
  ├─► https://<openhim-url>:9000  (OpenHIM Console)
  │       │  clicks "Login with Keycloak"
  │       ▼
  ├─► https://<keycloak-url>/realms/smile/protocol/openid-connect/auth
  │       │  user enters Keycloak credentials
  │       ▼
  ├─► https://<openhim-url>:9000?code=XXXX  (Keycloak redirects back)
  │       │  Console sends auth code to OpenHIM Core
  │       ▼
  └─► OpenHIM Core ──► Keycloak token endpoint  (server-to-server)
                           │  exchanges code for access token
                           │  reads resource_access["openhim-oauth"].roles
                           ▼
                       creates or updates OpenHIM user
                       sets groups from Keycloak client roles
```

**Key principle**: Keycloak handles **authentication** (who you are). OpenHIM determines **authorization** (what you can access) based on the `groups` field synced from Keycloak client roles on every login.

---

## Files Changed

| File                         | Change                                                                                                                                                                 |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `infra/compose-openhim.yml`  | Added `api_openid_*` env vars to `openhim-core`; added SSO env vars to `openhim-console`                                                                               |
| `infra/keycloak/realm.json`  | Added `openhim-oauth` confidential client + 7 client roles under `roles.client`                                                                                        |
| `infra/compose-keycloak.yml` | Added `OPENHIM_KC_CLIENT_SECRET` + `OPENHIM_CONSOLE_URL` env vars for realm.json substitution; added `CHOWN`/`SETUID`/`SETGID`/`DAC_OVERRIDE` caps to postgres service |
| `infra/.env.example`         | Added `OPENHIM_KC_URL`, `KC_OPENHIM_CLIENT_ID`, `OPENHIM_KC_CLIENT_SECRET`, `OPENHIM_CONSOLE_URL`                                                                      |

---

## Environment Variables

Add these to your `infra/.env`:

```env
# Keycloak → OpenHIM SSO Integration
OPENHIM_KC_URL=https://<your-keycloak-host>      # e.g. https://auth.smile-indonesia.id
KC_OPENHIM_CLIENT_ID=openhim-oauth               # used by openhim-console image
OPENHIM_KC_CLIENT_SECRET=<client-secret>          # from Keycloak UI: Clients → openhim-oauth → Credentials
OPENHIM_CONSOLE_URL=https://<openhim-console-url>:9000          # browser-accessible URL of OpenHIM Console
```

> **Local development note**: If Keycloak is running locally via `compose-keycloak.yml`, use
> `OPENHIM_KC_URL=http://host.docker.internal:<KC_PORT>` instead. This URL must be reachable
> from both the browser AND the `openhim-core` container. Do NOT use `127.0.0.1` or `localhost`
> — those resolve to the container itself from inside Docker, not to your machine.

---

## Keycloak Setup (Deployed Instance)

### 1. Create the `openhim-oauth` Client

In the `smile` realm → **Clients** → **Create client**:

| Field                 | Value                          |
| --------------------- | ------------------------------ |
| Client ID             | `openhim-oauth`                |
| Client authentication | **ON** (makes it confidential) |
| Standard flow         | **ON**                         |
| Direct access grants  | OFF                            |
| Service accounts      | OFF                            |

After saving:

- **Valid redirect URIs**: `https://<openhim-console-url>:9000/*` _(or your OpenHIM Console URL + `/*`)_
- **Web origins**: `https://<openhim-console-url>:9000` _(prevents CORS errors)_
- **Home URL**: `https://<openhim-console-url>:9000` _(optional, for UX)_

> Root URL and Admin URL are **not required** for the SSO flow.

Go to the **Credentials** tab → copy the generated secret → put it in `.env` as `OPENHIM_KC_CLIENT_SECRET`.

### 2. Create Client Roles

In `Clients → openhim-oauth → Roles → Create role`, create each of these example roles (actual may differ except 'admin'):

| Role name     | Purpose                                                      |
| ------------- | ------------------------------------------------------------ |
| `admin`       | Full OpenHIM administrative access (special hardcoded group) |
| `users`       | Base group — access to all standard channels                 |
| `smile-admin` | SMILE application admin                                      |
| `smile-users` | SMILE regular users                                          |
| `smile-app`   | SMILE service account / integration                          |
| `wms-admin`   | WMS admin                                                    |
| `wms-app`     | WMS service account / integration                            |

> These role names must match the **Permission Group** names defined in OpenHIM channels exactly.
> OpenHIM has no UI to manage group definitions — groups are free-text strings that link users
> to channels. A group "exists" wherever it appears on a user or a channel's allow list.

### 3. Assign Client Roles to Users

For each user who needs OpenHIM access:

User → **Role mapping** → **Filter by client** → select `openhim-oauth` → assign roles

---

## Local Keycloak Setup (`compose-keycloak.yml`)

If using the local Keycloak for development:

1. The `openhim-oauth` client and all 7 client roles are already defined in `keycloak/realm.json` and will be auto-imported on first startup.
2. The Postgres service has been updated with required capabilities (`CHOWN`, `SETUID`, `SETGID`, `DAC_OVERRIDE`) needed for initialisation.
3. Keycloak port is bound to `0.0.0.0` (not `127.0.0.1`) so that `host.docker.internal` resolves correctly from both the browser and inside Docker containers.
4. Assign client roles to users manually after startup via the Keycloak admin UI (`http://localhost:<KC_PORT>`).

> **Note**: Postgres uses a `tmpfs` mount — data is lost when the container is removed.
> Every `docker compose down && up` cycle starts with a fresh database and re-imports the realm.

---

## How OpenHIM Handles Keycloak Users

> These behaviours were validated through direct testing. The source of truth is
> `src/protocols/openid.js` in [jembi/openhim-core-js](https://github.com/jembi/openhim-core-js).

### On every successful Keycloak login, OpenHIM:

1. Decodes the JWT access token from Keycloak
2. Reads `resource_access["openhim-oauth"].roles` → sets as the user's `groups`
3. Looks up the user by email in OpenHIM's MongoDB
4. **Creates** the user if they don't exist yet (auto-provisioning)
5. **Overwrites** the user if they do exist (email, firstname, surname, groups, provider, locked)
6. Sets `provider = "openid"` and `locked = false` unconditionally

### Fields synced from Keycloak on every login:

| Field       | Source                                                       |
| ----------- | ------------------------------------------------------------ |
| `email`     | OIDC profile (used as unique key)                            |
| `firstname` | OIDC profile `givenName`                                     |
| `surname`   | OIDC profile `familyName`                                    |
| `groups`    | `resource_access["openhim-oauth"].roles` in JWT access token |
| `provider`  | Hardcoded to `"openid"`                                      |
| `locked`    | Hardcoded to `false`                                         |

---

## Validated Behaviours

### ✅ Role change sync

Changing a user's client roles in Keycloak takes effect on their **next login**. OpenHIM groups are fully overwritten from the token on every login. Access is entirely controlled by Keycloak client roles.

### ✅ `admin` role gives full access

A user with the `admin` client role assigned gets full administrative access to all OpenHIM sections: clients, channels, transactions, users, certificates, and mediators.

### ✅ Disabling in Keycloak blocks access

For Keycloak-authenticated users, **disabling the user in Keycloak is the only reliable way to block access**. OpenHIM has no disable/block option for SSO users and always sets `locked = false` on Keycloak login. Locking a user directly in OpenHIM has no effect for Keycloak-authenticated sessions.

### ✅ Auto-provisioning

A user who exists in Keycloak but has never logged in to OpenHIM is automatically created in OpenHIM on first login, with groups set from their Keycloak client roles.

### ✅ Keycloak unavailable — local users still work

OpenHIM is configured with `authenticationTypes: ["openid", "local", "basic"]`. When Keycloak is unreachable, users with OpenHIM-only accounts can still log in using the local login form on the same page (`https://<openhim-console-url>:9000`). No different URL is needed.

### ✅ Keycloak user with zero client roles

A Keycloak user with no `openhim-oauth` client roles assigned can log in to OpenHIM but will have no permission groups — they can access the application shell but cannot see any channels or transactions.

### ✅ Auto-reprovisioning after deletion

If a user is deleted directly from OpenHIM but their Keycloak account remains active, their next Keycloak login will recreate the OpenHIM user with groups from their current client roles.

### ✅ Email case insensitivity

Both Keycloak and OpenHIM store emails in lowercase. Email matching between the two systems always works regardless of the casing used when creating the user.

---

## Security Implications

### ⚠️ OpenHIM lock is bypassed for Keycloak users

Because `locked = false` is hardcoded in the OIDC user sync, the OpenHIM "locked" account state is completely ineffective for SSO users. **Always disable the user in Keycloak** to revoke access.

### ⚠️ Local password persists indefinitely after Keycloak login

If a user previously had an OpenHIM local password before SSO was enabled, that password remains valid and functional even after they start using Keycloak. The user can log in via either path. OpenHIM provides no mechanism to invalidate or clear the local password for a user whose provider is `openid`.

**Recommendation for production**: Once all users have been migrated to Keycloak, consider removing `"local"` from `api_authenticationTypes` to enforce SSO-only login. Keep `"basic"` to allow the init script and API automation to continue working.

```yaml
# Enforced SSO (after full migration):
api_authenticationTypes: '["openid","basic"]'

# Mixed mode (during migration or for hybrid setups):
api_authenticationTypes: '["openid","local","basic"]'
```

---

## Managing Users Going Forward

| Task                               | Where to do it                                                      |
| ---------------------------------- | ------------------------------------------------------------------- |
| Create a new user                  | Keycloak only — they are auto-provisioned in OpenHIM on first login |
| Assign/change OpenHIM access       | Keycloak: assign/remove `openhim-oauth` client roles                |
| Revoke OpenHIM access immediately  | Keycloak: disable the user account                                  |
| Manage local-only OpenHIM users    | OpenHIM UI only (these users have no Keycloak account)              |
| Edit user profile (name, email)    | Keycloak — changes sync to OpenHIM on next login                    |
| Change OpenHIM channel permissions | OpenHIM: update the channel's `allow` list                          |

> **Important**: Do not manually edit `groups` on a Keycloak-provisioned user in OpenHIM.
> The value will be overwritten on their next login from the Keycloak token.

---

## Troubleshooting | General & Local Development

### "Login with Keycloak" button not visible

Check that `ssoEnabled` is `true` in the console's runtime config:

```bash
docker exec openhim-console cat /usr/share/nginx/html/config/default.json
```

If `ssoEnabled` is `false`, the env vars were not picked up. The openhim-console image uses these specific variable names: `KC_OPENHIM_SSO_ENABLED`, `KC_FRONTEND_URL`, `KC_REALM_NAME`, `KC_OPENHIM_CLIENT_ID`, `OPENHIM_CONSOLE_SHOW_LOGIN`.

### Keycloak login page loads without CSS/styles

Keycloak's asset URLs contain a path prefix that doesn't match how the server is exposed (e.g. `/auth/resources/...` returning 404). This is a Keycloak server misconfiguration — check `KC_HOSTNAME_URL` on the deployed Keycloak instance. The asset URLs and the auth endpoint path must share the same base URL.

### "Sign-in with Keycloak failed" after successful Keycloak login

OpenHIM Core cannot reach the Keycloak token endpoint. Most common cause in local dev: `OPENHIM_KC_URL` is set to `localhost` or `127.0.0.1`, which resolves to the container itself from inside Docker. Use `http://host.docker.internal:<port>` and ensure Keycloak's port is bound to `0.0.0.0` (not `127.0.0.1`).

### User logs in successfully but sees nothing (empty dashboard)

The user has no `openhim-oauth` client roles assigned in Keycloak. Their `groups` in OpenHIM will be empty. Assign appropriate client roles and log in again.

### Groups not updating after role change in Keycloak

Groups are synced from the token on **login**, not on every request. The user must log out and log back in for the new roles to take effect.

### openhim-core restart loop on startup

Check logs with `docker logs openhim-core`. Common causes:

- `basic authentication type is disabled` → ensure `"basic"` is in `api_authenticationTypes`
- `Wrong password entered by root@openhim.org` → `OPENHIM_ROOT_PASSWORD` in `.env` does not match the value in MongoDB. The correct value is whatever was used when the MongoDB volume was first initialised.
