# Architecture Decision Record: Manajemen Autentikasi dan Otorisasi (RBAC)

## Konteks

Dokumen ini menjelaskan arsitektur, alur kerja, dan implementasi dari sistem Autentikasi dan Otorisasi (Role-Based Access Control / RBAC) pada Platform Backend SMILE. Sistem ini menggunakan kombinasi antara Keycloak sebagai Identity and Access Management (IAM) utama dan mekanisme otorisasi internal berbasis database.

Sistem otorisasi tersebar di beberapa layanan, terutama pada `auth-service` (untuk login dan sinkronisasi role) dan `main` service (untuk validasi akses API).

## 1. Arsitektur Manajemen Role (Afiliasi Keycloak)

Manajemen *role* pada sistem ini menggunakan Keycloak sebagai sumber utama yang disinkronkan secara dinamis dengan database internal. Terdapat dua jenis role utama:

1.  **Realm Roles (Global):** Berlaku di seluruh sistem (contoh: `superadmin`, `admin`, `operator`).
2.  **Client Roles (Spesifik Aplikasi/Integrasi):** Berlaku khusus untuk klien eksternal atau integrasi sistem tertentu (contoh: `siha`, `sitb`, `din`).

### Alur Sinkronisasi Role (Auto-Sync)

Sistem `auth-service` bertindak sebagai "jembatan" otomatis ke Keycloak (dikelola oleh `appService.ts`). Saat ada pembuatan atau pembaruan User:

1.  **Pengecekan Dinamis:** Auth Service menarik daftar role yang ada di Keycloak.
2.  **Auto-Create:** Jika sistem internal ingin memberikan role "X" kepada user, tetapi role "X" **belum ada** di Keycloak, maka `auth-service` akan **secara otomatis membuat role tersebut di Keycloak**.
3.  **Assignment (Pemetaan):** Role lama pada user di Keycloak dihapus, lalu diisi ulang dengan pemetaan role baru yang sinkron dengan database internal.

```mermaid
sequenceDiagram
    participant Admin as Admin/Sistem
    participant Auth as Auth Service<br/>(appService.ts)
    participant KC as Keycloak

    Note over Admin, KC: PROSES SINKRONISASI ROLE (Create/Update User)
    Admin->>Auth: 1. Simpan User dengan Roles: ["admin", "editor"]
    Auth->>KC: 2. Get Existing Roles dari Keycloak
    KC-->>Auth: Daftar Role Keycloak
    
    alt Role Belum Ada di Keycloak
        Auth->>KC: 3. Create Role baru ("editor") ke Keycloak
        KC-->>Auth: Sukses
    end
    
    Auth->>KC: 4. Hapus Role lama user (jika update)
    Auth->>KC: 5. Assign/Map Roles ["admin", "editor"] ke User ID
    KC-->>Auth: Role berhasil disinkronisasi
```

## 2. Alur Autentikasi (Proses Login)

Proses autentikasi terjadi pada `auth-service` saat user memasukkan kredensial.

1.  **Pengecekan Database Internal:** Memvalidasi apakah user tersebut ada dan statusnya aktif di database internal SMILE (via `userServiceClient`).
2.  **Validasi Perangkat (Device Rule):** Validasi berdasarkan peran (contoh: *Operator* dilarang login via Web, *Admin* dilarang login via Mobile).
3.  **Integrasi Keycloak:** Mengecek eksistensi user di Keycloak. Jika belum ada, sistem akan memanggil *core service* untuk menyinkronkan/membuat user di Keycloak.
4.  **Penerbitan Token:** Memverifikasi kredensial ke Keycloak dan mendapatkan JWT Token.
5.  **Pembaruan Status:** Mencatat waktu login terakhir (*last login*).

```mermaid
sequenceDiagram
    participant Client
    participant Auth as Auth Service
    participant UserDB as User Service / DB
    participant KC as Keycloak (IAM)

    Note over Client, KC: PROSES AUTENTIKASI (LOGIN)
    Client->>Auth: 1. Request Login (Username, Password, Device Type)
    Auth->>UserDB: 2. Validasi User Exist & Aktif?
    UserDB-->>Auth: User Valid
    Auth->>Auth: 3. Validasi Aturan Perangkat (Device Rule)
    Auth->>KC: 4. Cek/Request Token dengan Kredensial
    KC-->>Auth: Mengembalikan JWT Access Token
    Auth->>UserDB: 5. Update status "Last Login"
    Auth-->>Client: 6. Response: { authDetails: Token }
```

## 3. Alur Otorisasi (RBAC)

Otorisasi ("siapa boleh melakukan apa") dikendalikan secara berjenjang di `main` service.

### Level 1: Validasi Middleware Token (`auth.middleware.ts`)
Terdapat dua varian pengecekan middleware:
*   **`AuthMiddleware` (Pengecekan Internal/Cepat):** Memverifikasi *signature* JWT secara lokal menggunakan `APP_KEY`, mengekstrak header `x-program-id` (workspace), dan memverifikasi akses workspace dari payload token.
*   **`AuthKeycloakMiddleware` (Pengecekan Tersentralisasi):** Memvalidasi token secara eksternal ke Keycloak. Mencari user berdasarkan ID Keycloak (`sub`), dan mengekstrak `realm_access.roles` (Global Roles) serta `resource_access` (Client Roles) untuk disimpan ke dalam Context.

### Level 2: Validasi Endpoint API (`role-validation.middleware.ts`)
Middleware ini (`RoleMiddleware.handle`) dipasang secara global pada seluruh *route* API.
1.  **Normalisasi URL:** Mengubah ID dinamis menjadi parameter statis (contoh: `/users/123/status` menjadi `/users/:id/status`).
2.  **Pengecekan Database:** Memanggil `RolesToResourceMappingRepository` untuk mencari aturan akses pada tabel `roles_to_resource_mapping` berdasarkan URL dan HTTP Method.
3.  **Validasi:** Mencocokkan *Role User* dari Context dengan daftar role yang diizinkan (kolom `role_list`). Jika tidak cocok, kembalikan `403 Forbidden`.

*(Catatan: Terdapat juga `allow()` dan `allowWithDeviceType()` untuk pengecekan hardcode pada level Route).*

### Level 3: Validasi Modul/Bisnis (Granular RBAC)
Pengecekan tambahan di level layanan/modul. Contohnya pada Modul Transaksi (`transaction.middleware.ts`), fungsi `#isMaterialHavePermission` memvalidasi apakah *Role* dan *Entity Type* user berhak memproses *Material* (Barang) tertentu.

### Flow Lengkap: Akses API

```mermaid
sequenceDiagram
    actor User
    participant API as Main API Router
    participant DB as Database<br/>(roles_to_resource_mapping)
    participant AuthMid as AuthKeycloak<br/>Middleware
    participant RoleMid as Role<br/>Middleware
    participant Controller as Controller /<br/>Service

    Note over User, Controller: FASE 2: AKSES RESOURCE & OTORISASI (Authorization)
    User->>API: PUT /core/users/123/status<br/>Header: Authorization Bearer Token
    
    %% Middleware 1: Auth
    API->>AuthMid: Intercept Request
    AuthMid->>AuthMid: Validasi Token (Keycloak/Local)
    AuthMid->>AuthMid: Ekstrak `roles` dari Token
    AuthMid->>AuthMid: Simpan 'roles' ke Memory (Context)
    AuthMid-->>API: Lanjut (Next)
    
    %% Middleware 2: Role RBAC
    API->>RoleMid: Intercept Request
    RoleMid->>RoleMid: Normalisasi URL menjadi `/core/users/:id/status`
    RoleMid->>DB: Cari RBAC (path + method `PUT`)
    DB-->>RoleMid: Return: role_list = "SUPERADMIN, ADMIN"
    
    RoleMid->>RoleMid: Cek Interseksi (Apakah user punya role di daftar?)
    Note right of RoleMid: User Roles: ["ADMIN", "OPERATOR"]<br/>Allowed: ["SUPERADMIN", "ADMIN"]<br/>Hasil: Match!
    
    alt Role Tidak Cocok
        RoleMid-->>User: Response 403 (Forbidden Access)
    else Role Cocok
        RoleMid-->>API: Lanjut (Next)
    end
    
    %% Fase Eksekusi
    API->>Controller: Teruskan request ke modul tujuan
    Controller->>Controller: Cek RBAC Level Bisnis (Opsional)
    Controller->>Controller: Eksekusi logika bisnis / update DB
    Controller-->>User: Response 200 OK
```

## 4. Cara Menambahkan Aturan RBAC Baru

Sistem RBAC bersifat *Data-Driven*. Untuk menambahkan aturan akses baru pada suatu endpoint:

1.  **Tambahkan Data di `roles_to_resource_mapping`:**
    *   `route_handler`: `/main/core/users/:id/status`
    *   `http_method`: `put`
    *   `role_list`: `SUPERADMIN, ADMIN` (Gunakan `PUBLIC` jika bisa diakses semua role).
    *   `status`: `1` (Aktif)
2.  **Pembuatan Role Baru (Opsional):** Jika membuat role baru (misal: `AUDITOR`), tambahkan role tersebut ke user via sistem manajemen user. `Auth Service` akan menyinkronkannya dengan Keycloak secara otomatis.
3.  **Guard Hardcode (Opsional):** Tambahkan fungsi `allowWithDeviceType()` pada definisi router di kode jika membutuhkan validasi kombinasi perangkat dan role yang spesifik.
