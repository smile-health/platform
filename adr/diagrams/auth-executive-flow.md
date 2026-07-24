# Executive Auth Flow Diagram

This document describes the authentication flow for **Executive** users across the Auth Service and Warehouse Service.

Executive users are a separate user tier with their own login path (`/executive/*`) and profile endpoint, distinct from regular users.

---

## 1. Executive Login Flow (Auth Service)

```mermaid
sequenceDiagram
    autonumber
    participant Client
    participant AuthExecController as AuthExecutiveController<br/>authExecutiveController.ts
    participant LoginHandler as Login Handler<br/>authExecutiveRouteHandlers.ts
    participant AppService as AppService<br/>services/appService.ts
    participant UserServiceClient as UserServiceClient<br/>userServiceClient.ts
    participant UserService as User Service API<br/>(SMILE DB)
    participant KeycloakClient as KeycloakClient<br/>keycloakClient.ts
    participant Keycloak as Keycloak

    Client->>AuthExecController: POST /executive/login<br/>{ username, password, fcm_token? }
    AuthExecController->>LoginHandler: route to loginHandler
    LoginHandler->>LoginHandler: Validate request schema (Zod)

    LoginHandler->>AppService: login(username, password, deviceType, isExecutive=true)

    AppService->>UserServiceClient: validateUserExists(username, isExecutive=true)
    UserServiceClient->>UserService: GET /executive/users?username=...
    UserService-->>UserServiceClient: { exists: boolean, active: boolean, role }

    alt User not found or inactive
        UserServiceClient-->>AppService: throws 400 Bad Request
        AppService-->>Client: 400 Account inactive / not found
    end

    AppService->>AppService: Check device type restrictions<br/>(Operator → mobile only, Admin → web only)

    alt Device not allowed for role
        AppService-->>Client: 403 Forbidden
    end

    AppService->>AppService: Check USER_MULTIPLE_SESSION env<br/>for this username

    alt Single session mode
        AppService->>KeycloakClient: logoutUser(userId)
        KeycloakClient->>Keycloak: DELETE /sessions (all sessions)
        Keycloak-->>KeycloakClient: OK
    end

    AppService->>UserServiceClient: login(username, password, isExecutive=true)
    UserServiceClient->>UserService: POST /executive/login<br/>(creates Keycloak user if not exists)
    UserService-->>UserServiceClient: OK

    AppService->>KeycloakClient: getToken(username, password)
    KeycloakClient->>Keycloak: POST /token (password grant)<br/>{ client_id, client_secret, username, password }
    Keycloak-->>KeycloakClient: { access_token, refresh_token, expires_in, session_state }
    KeycloakClient-->>AppService: TokenResponse

    AppService->>UserServiceClient: updateUserLastLogin(token, { fcm_token }, isExecutive=true)
    UserServiceClient->>UserService: PATCH /executive/users/last-login
    UserService-->>UserServiceClient: OK

    AppService-->>LoginHandler: { authDetails: TokenResponse }
    LoginHandler-->>Client: 200 OK<br/>{ authDetails: { access_token, refresh_token, expires_in, ... } }
```

---

## 2. Executive Token Validation Flow (Auth Service)

```mermaid
sequenceDiagram
    autonumber
    participant Client
    participant AuthExecController as AuthExecutiveController<br/>authExecutiveController.ts
    participant ValidateHandler as Validate Handler<br/>authExecutiveRouteHandlers.ts
    participant AppService as AppService<br/>services/appService.ts
    participant KeycloakClient as KeycloakClient<br/>keycloakClient.ts
    participant Keycloak as Keycloak

    Client->>AuthExecController: GET /executive/validate-token<br/>Authorization: Bearer <token>
    AuthExecController->>ValidateHandler: route to validateTokenHandler
    ValidateHandler->>ValidateHandler: Extract Bearer token from header

    ValidateHandler->>AppService: validateToken(token)
    AppService->>KeycloakClient: validateToken(token)
    KeycloakClient->>Keycloak: GET /userinfo<br/>Authorization: Bearer <token>

    alt Token invalid or expired
        Keycloak-->>KeycloakClient: 401 Unauthorized
        KeycloakClient-->>AppService: throws UnauthorizedError
        AppService-->>Client: 401 Unauthorized
    end

    Keycloak-->>KeycloakClient: UserInfo { sub, email, preferred_username,<br/>realm_access, appUserId, programId }
    KeycloakClient-->>AppService: UserInfo
    AppService-->>ValidateHandler: UserInfo
    ValidateHandler-->>Client: 200 OK<br/>{ sub, email, preferred_username, realm_access, ... }
```

---

## 3. Warehouse Service — Executive Request Auth Middleware

```mermaid
sequenceDiagram
    autonumber
    participant Client
    participant Router as Hono Router<br/>Warehouse Service
    participant AuthMiddleware as AuthKeycloakMiddleware<br/>auth.middleware.ts
    participant CoreAPI as Core API<br/>(CORE_API_URL)
    participant Controller as Warehouse Controller

    Client->>Router: ANY /executive/<resource><br/>Authorization: Bearer <token><br/>x-program-id: <id><br/>Device-Type: <type>

    Router->>AuthMiddleware: handleAuthKeycloak (applied before controller)

    AuthMiddleware->>AuthMiddleware: Check Authorization header
    alt No Authorization header
        AuthMiddleware-->>Client: 401 Unauthorized
    end

    AuthMiddleware->>AuthMiddleware: Detect path.includes("/executive")<br/>→ pathUrl = "/executive/account/profile"

    AuthMiddleware->>CoreAPI: GET /executive/account/profile<br/>Authorization: Bearer <token>

    alt Profile fetch failed (4xx/5xx)
        CoreAPI-->>AuthMiddleware: { message: "..." }
        AuthMiddleware-->>Client: 403 Forbidden (data.message)
    end

    CoreAPI-->>AuthMiddleware: 200 OK<br/>{ role_id, ...userProfile }

    AuthMiddleware->>AuthMiddleware: Set context variables:<br/>programId = x-program-id header<br/>deviceId = DEVICE_TYPE[Device-Type header]<br/>roleId = data.role_id<br/>language = Accept-Language header<br/>user = data (full profile)

    AuthMiddleware->>Controller: await next() — request proceeds
    Controller-->>Client: Response
```

---

## 4. Combined Executive Auth Architecture Overview

```mermaid
flowchart TD
    Client([Client / Frontend])

    subgraph AuthService["Auth Service (apps/auth-service)"]
        direction TB
        ExecCtrl["AuthExecutiveController\n/executive/login\n/executive/validate-token\n/executive/logout\n/executive/forgot-password"]
        AppSvc["AppService\nservices/appService.ts\n\nlogin(isExecutive=true)\nvalidateToken()\nlogoutUser()"]
        UserSvcClient["UserServiceClient\nuserServiceClient.ts\n\nvalidateUserExists(isExecutive)\nlogin(isExecutive)\nupdateUserLastLogin(isExecutive)"]
        KcClient["KeycloakClient\nkeycloakClient.ts\n\ngetToken()\nvalidateToken()\nlogoutUser()"]
    end

    subgraph ExternalServices["External Services"]
        UserSvc["User Service API\n(SMILE DB — executive users)"]
        Keycloak["Keycloak\nOAuth2 / OIDC"]
        CoreAPI["Core API\n/executive/account/profile"]
    end

    subgraph WarehouseService["Warehouse Service (apps/warehouse-service)"]
        direction TB
        AuthMW["AuthKeycloakMiddleware\nauth.middleware.ts\n\nDetects /executive path\nFetches executive profile\nSets ctx: user, roleId, programId"]
        WCtrl["Warehouse Controller\nBusiness logic endpoints"]
    end

    Client -->|"POST /executive/login"| ExecCtrl
    ExecCtrl --> AppSvc
    AppSvc --> UserSvcClient
    UserSvcClient -->|"validate/login executive user"| UserSvc
    AppSvc --> KcClient
    KcClient -->|"password grant / userinfo / logout"| Keycloak

    Client -->|"ANY /executive/* + Bearer token"| AuthMW
    AuthMW -->|"GET /executive/account/profile"| CoreAPI
    CoreAPI -.->|"token validation"| Keycloak
    AuthMW --> WCtrl

    style AuthService fill:#dbeafe,stroke:#3b82f6
    style WarehouseService fill:#dcfce7,stroke:#22c55e
    style ExternalServices fill:#fef9c3,stroke:#eab308
```

---

## Key Differences: Executive vs Regular Auth

| Aspect | Regular User | Executive User |
|---|---|---|
| Login endpoint | `POST /login` | `POST /executive/login` |
| Validate endpoint | `GET /validate-token` | `GET /executive/validate-token` |
| User Service path | `/users?username=...` | `/executive/users?username=...` |
| Core API profile | `/account/profile` | `/executive/account/profile` |
| Warehouse middleware detection | `path` does **not** include `/executive` | `path.includes("/executive")` → `true` |
| Device restrictions | Enforced per role | Same role-based enforcement |
| Keycloak realm | Shared realm | Same shared realm |

---

## Files Referenced

| File | Role |
|---|---|
| [apps/auth-service/src/controllers/authExecutiveController.ts](../../apps/auth-service/src/controllers/authExecutiveController.ts) | Route registration for executive auth endpoints |
| [apps/auth-service/src/route-handlers/authExecutiveRouteHandlers.ts](../../apps/auth-service/src/route-handlers/authExecutiveRouteHandlers.ts) | Executive login, validate, logout, forgot-password handlers |
| [apps/auth-service/src/services/appService.ts](../../apps/auth-service/src/services/appService.ts) | Core auth logic: `login()`, `validateToken()`, `logoutUser()` |
| [apps/auth-service/src/userServiceClient.ts](../../apps/auth-service/src/userServiceClient.ts) | SMILE DB user service client (`isExecutive` flag) |
| [apps/auth-service/src/keycloakClient.ts](../../apps/auth-service/src/keycloakClient.ts) | Keycloak token and admin API client |
| [apps/warehouse-service/src/common/middlewares/auth.middleware.ts](../../apps/warehouse-service/src/common/middlewares/auth.middleware.ts) | `AuthKeycloakMiddleware` — path-based executive profile fetch |
