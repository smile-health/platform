# Seed Program Imunisasi (BA-960)

Seeder `seeders/1795900000000_immunization_program_seed.ts` membuat workspace
`immunization` (IMUNISASI). Ini program yang berbeda dari `immunization_beneficiaries`.
Isinya master data dari SMILE production onprem Pusdatin dan data transaksi dummy
selama 12 bulan.

```bash
cd apps/core
bunx kysely seed:run --specific 1795900000000_immunization_program_seed
```

## Master data (`snapshot.json`)

Diambil read-only dari `prod_smile5_31102026` pada 27 Nov 2026:

- Semua material workspace imunisasi (227), relasi parent-child, aktivitas, dan manufaktur.
- Rantai entitas: Kemenkes, lalu 10 provinsi teratas, 10 kab/kota teratas di provinsi
  tersebut, 10 puskesmas teratas di kab/kota tersebut, dan 10 lastmile di bawah puskesmas
  tersebut. Peringkat dihitung dari jumlah transaksi imunisasi sejak 27 Nov 2025.
- Relasi entitas-material-aktivitas (min/max), customer-vendor, alasan transaksi, dan
  alasan laporan kejadian.
- Profil volume bulanan per entitas-material. Profil ini hanya angka agregat, tanpa
  baris transaksi asli.

Kolom user (`created_by` dan sejenisnya) serta kontak manufaktur dibuang dari snapshot.

## Pemetaan ID

ID prod dipertahankan kalau masih kosong di target. Baris yang sudah ada dipakai ulang
berdasarkan kunci alaminya:

| Tabel | Kunci alami |
|---|---|
| entities | `entity_tag_id` + `code` |
| materials | `code` |
| manufactures, material_units | nama |
| tabel per workspace | kombinasi foreign key-nya |

Kalau ID prod sudah dipakai baris lain, ID digeser sebesar offset (lihat `seed.ts`).
Lookup yang ID-nya berbeda antara prod dan SMILE Health, seperti `ws_transaction_types`,
`material_units`, dan `budget_sources`, dipetakan lewat nama.

## Data dummy (`dummy.ts`)

Simulasi harian, deterministik (seed 960):

- Stock count awal untuk semua level.
- Pengadaan Kemenkes per kuartal (Add Stock dengan batch baru).
- Distribusi Kemenkes ke provinsi tiap dua bulan, dan provinsi ke kab/kota tiap bulan.
- Request puskesmas ke kab/kota tiap bulan. Statusnya berjalan pending, confirmed,
  allocated, shipped, lalu fulfilled.
- Konsumsi di puskesmas tiap Selasa dan Kamis, dengan lastmile sebagai companion.
- Pembuangan sesekali.
- Sebagian order di minggu terakhir sengaja dibiarkan belum selesai.

Aktivitas yang disimulasikan adalah Rutin (20 material terbesar) dan BIAS (6 material,
hanya Agustus, September, dan November).

Invariant yang dijaga dan diuji di `src/tests/unit/immunization-program-seed.test.ts`:

- Qty stok sama dengan jumlah transaksinya, dan `opening_qty` berantai.
- Stok tidak pernah negatif.
- Barang hanya bergerak dari induk ke anak.
- Qty yang dikirim sama dengan qty yang diterima.

Baris dummy memakai rentang ID `[1_960_000_000, 1_970_000_000)`. Rentang ini dihapus
lalu dibangun ulang setiap kali seeder dijalankan. Master data hanya di-insert kalau
belum ada, jadi seeder aman dijalankan berulang.

Provinsi dan kab/kota yang tidak punya anak di rantai hanya memegang buffer kecil
(5% dari volume distribusi aslinya). Distribusi ke anak-anaknya yang berada di luar
rantai tidak disimulasikan.

## Akun user (`users.ts`)

- Satu akun dibuat untuk setiap entitas yang memegang stok, dengan aturan berikut:

  | Entitas | Username | Role |
  |---|---|---|
  | Kemenkes | `imun_kemenkes` | Admin |
  | Provinsi | `imun_prov_<nama>` | Manager |
  | Kab/kota | `imun_kab_<nama>` / `imun_kota_<nama>` | Manager |
  | Puskesmas | `imun_pkm_<nama>` | Operator |

  Lastmile tidak memegang stok, jadi tidak dibuatkan akun. Setiap akun tertaut ke
  `entity_id`-nya, mendapat akses program, dan memakai email `<username>@example.com`.
- Semua user yang sudah ada dengan role Super Admin atau Admin mendapat akses ke
  program ini lewat `user_workspaces`. Akses program dicek dari tabel ini, bukan dari
  atribut Keycloak.
- Akun Keycloak dibuat lewat auth-service, tapi hanya kalau env `SEED_USER_PASSWORD`
  dan `AUTH_URL` diset. Semua akun seed memakai password yang sama, dan password itu
  tidak disimpan di repo.
- Seeder hanya menyentuh user berprefix `imun_`, karena `POST /users` di auth-service
  menghapus lalu membuat ulang user Keycloak yang username atau email-nya sama.
- Role Operator hanya bisa login dari aplikasi mobile. Ini kebijakan auth-service,
  bukan bug seeder.

```bash
SEED_USER_PASSWORD=... bunx kysely seed:run --specific 1795900000000_immunization_program_seed
```
