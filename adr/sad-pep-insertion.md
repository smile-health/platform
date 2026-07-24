# SAD — PEP Insertion | SMILE 5.0

**Tipe Dokumen:** Software Architecture Decision  
**Berlaku untuk:** `apps/main` (BE) · `packages/ui/src/pages/transaction/TransactionCreate` (FE)  
**Program:** Rabies only (tidak berlaku Dengue / PrEP / Booster)  
**PRD Ref:** §4h — PEP Insertion, v2.0 Jun 2026  
**Status:** `BELUM DIIMPLEMENTASI`  
**Tanggal:** Juni 2026

---

## Ringkasan Eksekutif

| | Jumlah | Keterangan |
|---|---|---|
| **Missing** | 15 | Fitur / logika yang belum ada (BE + FE) |
| **Partial** | 2 | Fitur yang ada sebagian — perlu perubahan signifikan |
| **Reusable** | 3 | Infrastruktur yang bisa di-reuse atau diperluas |

Fitur PEP Insertion pada PRD v2.0 mendefinisikan skenario di mana petugas menyisipkan transaksi PEP 0 dengan tanggal lebih awal dari transaksi yang sudah ada. Ini **berbeda fundamental** dari mekanisme `other_sequences` yang sudah ada di kode.

---

## 1. Analisis PRD §4h — PEP Insertion

### 1.1 Aturan Dasar — Pembatasan Urutan

| Kondisi Pasien | Pilihan yang Tersedia di Dropdown | Perilaku Sistem |
|---|---|---|
| Pasien **TIDAK** ditemukan di SMILE | Semua urutan (PEP 0, PEP 3, PEP 7, dst.) | Tidak ada pembatasan — transaksi biasa |
| Pasien **DITEMUKAN**, sudah punya rekam PEP | **Hanya 2 pilihan:** PEP 0 (sisipan) ATAU urutan selanjutnya dari PEP terakhir | Pembatasan ketat — dropdown dikurangi |
| Pasien **DITEMUKAN**, pilih PEP 0 (insertion detected) | PEP 0 dengan tanggal aktual wajib < tanggal existing PEP 0 | Trigger insertion logic + shift otomatis |

### 1.2 Logika Pergeseran Urutan (Shift)

Inti dari fitur ini adalah re-mapping urutan seluruh transaksi PEP pasien setelah insertion disimpan.

| Dosis PEP 0 Disisipkan | Efek pada Rekam Lama | Contoh Konkret |
|---|---|---|
| **1 dosis** | Existing PEP 0 → bergeser ke **PEP Day 3** | Transaksi 10 Jun (PEP 0 lama) menjadi PEP 3 dalam protokol |
| **2 dosis** | Existing PEP 0 → bergeser ke **PEP Day 7** | Transaksi 10 Jun (PEP 0 lama) menjadi PEP 7 dalam protokol |

> **Catatan arsitektur:** Pergeseran ini bukan menghapus rekam lama — melainkan *mengubah* `vaccine_sequence` pada rekam yang sudah ada di `ws_consumption_rabies` dan `ws_patient_rabies`, lalu merecalculate `next_vaccine_date` di `ws_consumptions`.

### 1.3 Perilaku Sistem Setelah Insertion

- Pergeseran urutan bersifat **atomik** — INSERT transaksi baru + UPDATE semua rekam lama dalam satu database transaction
- Semua `next_vaccine_date` pada rekam yang bergeser harus di-**recalculate** berdasarkan sequence baru
- Notifikasi pengingat yang sudah terjadwal di-**cancel dan dibuat ulang** berdasarkan urutan yang diperbarui
- Insertion transaction harus diberi **flag khusus** agar terlihat di Transaction List dengan badge
- **Audit log** mencatat bahwa shift terjadi, beserta timestamp dan user yang melakukan
- Return transaction pada insertion → semua shift **di-revert**
- Hanya berlaku saat pasien **DITEMUKAN** di SMILE — Non-NIK tidak didukung

### 1.4 Study Cases (PRD halaman 11–12)

#### Zagreb — Alur Normal
Protocol: PEP 0 = 2 dosis (Day 0), PEP 7 = 1 dosis, PEP 21/28 = 1 dosis

| Tanggal Input | Input ke- | PEP 0 | PEP 7 | PEP 21/28 |
|---|---|---|---|---|
| 02-Jan-26 | 1 | 2 | — | — |
| 08-Jan-26 | 2 | 2 | 1 | — |
| 15-Jan-26 | 3 | 2 | 1 | 1 |

#### Essen — Termasuk Skenario Insertion
Protocol: PEP 0 = 1, PEP 3 = 1, PEP 7 = 1, PEP 14 = 1

| Tanggal Aktual | Input ke- | PEP 0 | PEP 3 | PEP 7 | PEP 14 | Keterangan |
|---|---|---|---|---|---|---|
| 05-Jan-26 | 1 | 1 | — | — | — | Entry pertama |
| 12-Jan-26 | 2 | 1 | 1 | — | — | Tambah PEP 3 |
| **02-Jan-26** | **3** | **1** | **1** | **1** | — | **Insertion PEP 0 (tgl lebih awal dari 05-Jan)** |
| 17-Jan-26 | 4 | 1 | 1 | 1 | 1 | Lanjut PEP 14 |

> Input ke-3 menyisipkan PEP 0 pada 02-Jan (sebelum 05-Jan), menyebabkan rekam 05-Jan bergeser ke PEP 3, dan 12-Jan bergeser ke PEP 7.

#### Essen → Zagreb (Ubah Tipe)
Pasien awalnya dicatat dengan Essen, kemudian insertion dilakukan dengan tipe Zagreb.

| Tanggal Aktual | Input ke- | PEP 0 | PEP 3 | PEP 7 | PEP 21/28 | Keterangan |
|---|---|---|---|---|---|---|
| 10-Jan-26 | 1 | 1 | — | — | — | Essen Day 0 |
| 14-Jan-26 | 2 | 1 | 1 | — | — | Essen Day 3 |
| **03-Jan-26** | **3** | **2** | — | **1** | **1** | **Insertion Zagreb (2 dosis), tgl lebih awal** |

> Insertion 03-Jan dengan Zagreb (2 dosis) menyebabkan rekam Essen 10-Jan bergeser ke PEP 7, dan 14-Jan bergeser ke PEP 21/28.

#### Essen → Zagreb → Booster (Ubah Tipe + Booster)

| Tanggal Aktual | Input ke- | PEP 0 | PEP 3 | PEP 7 | PEP 21/28 | Booster PEP 0 | Booster PEP 7 | Keterangan |
|---|---|---|---|---|---|---|---|---|
| 16-Jan-26 | 1 | 1 | — | — | — | — | — | Entry pertama |
| 20-Jan-26 | 2 | 1 | 1 | — | — | — | — | Tambah PEP 3 |
| 09-Jan-26 | 3 | 1 | 1 | 1 | 1 | — | — | Insertion PEP 0 + other_sequences |
| **03-Jan-26** | **4** | **2** | — | **1** | — | **1** | — | **Insertion Zagreb + Booster dimulai** |

---

## 2. Analisis Kode Existing

### 2.1 Arsitektur Dua Modul

Ada dua consumption module terpisah untuk Rabies, dengan skema tabel yang berbeda:

| Modul | File Utama | Tabel Sequence | Digunakan untuk |
|---|---|---|---|
| `consumption-rabies` | `consumption-rabies.module.ts` | `rabies_vaccine_rules` | Alur Rabies utama (lewat controller sendiri) |
| `consumption` (general) | `consumption.module.ts` | `ws_vaccine_sequences` + `ws_vaccine_rules` | Protokol baru (Dengue, generic) |

> PEP Insertion bekerja pada alur Rabies, sehingga implementasi utama ada di **consumption-rabies** module. Tabel `rabies_vaccine_rules` masih digunakan untuk sequence chain, bukan `ws_vaccine_rules`.

### 2.2 Validasi Sequence yang Ada

File `consumption-rabies.middleware.ts` (L287–L545) menangani validasi dengan tahapan berikut:

- **Active duration check** (L287–337): Jika pasien ditemukan, cek apakah tanggal transaksi baru masih dalam `active_duration` dari vaksin terakhir
- **Existing sequence check** (L340–357): Jika sequence yang diminta *sudah ada* di `ws_patient_rabies` → *error* `"invalid vaccine sequence"`
- **Chain validation** (L360–422): Walk backwards melalui `previous_sequence` untuk verifikasi chain
- **Prerequisite qty** (L424–545): Khusus sequence 11 dan 13 (booster), cek minimum dosis

> **Masalah kritis:** Baris L340–357 secara eksplisit *menolak* jika sequence yang diminta sudah ada di rekam pasien. Ini yang perlu diubah — untuk PEP Insertion, memilih PEP 0 saat pasien sudah punya PEP 0 seharusnya *diizinkan* (sebagai sisipan), bukan ditolak.

### 2.3 Mekanisme "Other Sequences" vs PEP Insertion

| | Other Sequences (Existing) | PEP Insertion (PRD §4h — Belum Ada) |
|---|---|---|
| **Tujuan** | Mengisi *gap historis* — pasien sudah punya beberapa suntikan sebelumnya yang belum tercatat | Menyisipkan PEP 0 baru dengan tanggal lebih awal dari data yang sudah ada |
| **Efek pada rekam lama** | Tidak ada — hanya menambah rekam baru | **Mengubah** rekam yang sudah ada — update `vaccine_sequence` pada rekam lama |
| **Qty transaksi** | `change_qty: 0` (zero-qty) untuk sequence yang dilewati | Qty aktual yang real |
| **Pergeseran urutan** | Tidak ada — sequence ID tetap | Pergeseran urutan otomatis berdasarkan jumlah dosis yang disisipkan |
| **Validasi tanggal** | Tidak ada | Wajib: tanggal insertion < tanggal existing PEP 0 |

### 2.4 Sistem Notifikasi yang Ada

Di `patient.cron.ts` (L25–154), CRON job membaca `next_vaccine_date` dari `ws_consumptions` untuk menentukan kapan notifikasi dikirim. Tidak ada mekanisme recalculation atau cancellation jadwal notifikasi yang sudah di-set.

### 2.5 Skema Tabel Relevan

| Tabel | Kolom Relevan | Keterangan |
|---|---|---|
| `ws_consumptions` | `vaccine_sequence_id`, `next_vaccine_date`, `actual_date`, `reference_consumption_id`, `stop_notification`, `return_transaction_id` | Tidak ada kolom `is_pep_insertion` atau sejenisnya |
| `ws_consumption_rabies` | `consumption_id`, `vaccine_sequence`, `vaccine_type`, `vaccine_method` | Tidak ada flag insertion |
| `ws_patient_rabies` | `patient_id`, `vaccine_sequence`, `vaccine_type`, `vaccine_method`, `last_vaccine_at` | Satu record per pasien (upsert). Ini yang perlu di-update setelah shift |
| `rabies_vaccine_rules` | `id`, `previous_sequence`, `next_sequence`, `active_duration`, `prerequisite_qty` | Chain rules — digunakan untuk menentukan target shift |

### 2.6 Kondisi FE Existing

| File | Status | Keterangan |
|---|---|---|
| `useGetRabiesSequences.ts` | `PARTIAL` | Fetch `GET /transactions/rabies-sequence` tanpa context pasien — tidak ada `identity_number` param |
| `transaction-consumption.service.ts` (L60) | `EXISTS` | `getDataPatientSequence(nik, protocolId)` → `GET /consumptions/patient/{nik}/{protocolId}/vaccine-sequence` sudah ada, tapi response tidak include restricted sequences |
| `PatienVaccineSequence` type | `PARTIAL` | Punya `next_sequence` dan `previous_sequence` tapi tidak ada `is_insertion`, `restricted_sequences`, atau info insertion |
| `useProtocolRabiesVaccine.ts` | `PARTIAL` | Menangani vaccine selection tapi tidak ada insertion detection logic |
| `ProtocolRabiesVaccine.tsx` | `PARTIAL` | Dropdown sequence sudah ada, tapi tidak aware konteks insertion |

---

## 3. Gap Analysis — PRD vs Kode Existing

### 3a. Backend Gaps

| Fitur / Requirement | Status | Detail Gap | File yang Terdampak |
|---|---|---|---|
| **Insertion Detection** — Deteksi skenario sisipan | `MISSING` | Middleware saat ini *menolak* (error) jika PEP 0 dipilih saat pasien sudah punya PEP 0. Perlu diubah menjadi deteksi insertion. | `middleware.ts` L340–357 |
| **Sequence Restriction API** — Endpoint sequence yang aware pasien | `MISSING` | `GET /transactions/rabies-sequence` tidak menerima konteks pasien. Endpoint `GET /consumptions/patient/{nik}/{protocolId}/vaccine-sequence` ada tapi tidak mengembalikan restricted sequences + insertion flag. | `repository.ts`, `controller.ts` |
| **Date Validation for Insertion** — Tanggal sisipan < tanggal existing | `MISSING` | Tidak ada validasi bahwa `actual_transaction_date` pada insertion lebih awal dari tanggal PEP 0 yang sudah ada. | `middleware.ts` L44–57 |
| **Sequence Shift Logic** — Re-mapping rekam lama | `MISSING` | Tidak ada kode yang mengupdate `vaccine_sequence` pada `ws_consumption_rabies` dan `ws_patient_rabies` setelah insertion. | `module.ts` (baru), `repository.ts` (baru) |
| **next_vaccine_date Recalculation** — Update tanggal vaksin berikutnya | `MISSING` | Setelah shift, `next_vaccine_date` di `ws_consumptions` untuk rekam yang bergeser perlu dihitung ulang berdasarkan sequence baru. | `module.ts` (baru), `repository.ts` (baru) |
| **Notification Recalculation** — Cancel & buat ulang jadwal notif | `MISSING` | Tidak ada mekanisme untuk menghentikan notifikasi yang sudah aktif untuk sequence yang bergeser. | `patient.cron.ts` L25 |
| **is_pep_insertion Flag** — Marking transaksi sebagai sisipan | `MISSING` | Tidak ada kolom di `ws_consumptions` untuk menandai insertion transaction. | Migration baru, `db.d.ts` |
| **Audit Log Insertion** — Rekam event pergeseran | `MISSING` | Tidak ada tabel atau mekanisme audit. | Migration baru, `module.ts` |
| **Return Transaction Revert** — Undo shift saat return | `MISSING` | Return flow tidak mendeteksi insertion dan tidak ada logika revert shift. | `transaction.module.ts`, `transaction.repository.ts` |
| **Other Sequences Mechanism** | `PARTIAL` | Konsep zero-qty bisa di-reuse tapi perlu dipisah eksplisit dari insertion path. | `module.ts` L461 |
| **Active Duration Validation** | `PARTIAL` | Sudah ada tapi harus di-bypass saat insertion terdeteksi. | `middleware.ts` L287 |
| **Transaction DB Structure** | `EXISTS` | Infrastruktur create transaction + consumption sudah solid. | `module.ts` L112–210 |
| **Vaccine Rule Chain** | `EXISTS` | Logic traversal `previous_sequence` / `next_sequence` sudah ada. | `middleware.ts` L369 |
| **Patient Identity Lookup** | `EXISTS` | `getPatientIdByIdentity()` dan `updateOrCreatePatient()` sudah ada. | `repository.ts` L89–131 |

### 3b. Frontend Gaps

| Fitur / Requirement | Status | Detail Gap | File yang Terdampak |
|---|---|---|---|
| **Restricted Sequence Dropdown** — Batasi opsi saat pasien ditemukan | `MISSING` | Hook `useGetRabiesSequences` fetch tanpa context pasien; tidak ada logika pembatasan. | `useGetRabiesSequences.ts`, `ProtocolRabiesVaccine.tsx` |
| **Insertion Detection UI** — Deteksi & komunikasikan ke user saat PEP 0 dipilih dan pasien sudah ada | `MISSING` | Tidak ada logika di `useProtocolRabiesVaccine` untuk mendeteksi skenario insertion. | `useProtocolRabiesVaccine.ts` |
| **Actual Date Field di Header** — Field tanggal aktual transaksi wajib (PRD §4a) | `MISSING` | Perlu validasi bahwa tanggal aktual diisi dan digunakan untuk insertion date check. | Header form component |
| **PEP Insertion Confirmation Modal** — Konfirmasi sebelum submit insertion | `MISSING` | Perlu modal peringatan: "Anda akan menyisipkan PEP 0 dengan tanggal lebih awal, urutan existing akan bergeser." | Komponen baru |
| **Date Validation Error Display** — Tampilkan error jika tanggal insertion ≥ tanggal existing | `MISSING` | Tidak ada komponen untuk menampilkan error validasi tanggal insertion. | Header form component, error state |
| **Restricted Sequences Response Type** — Type untuk API response restricted sequences | `MISSING` | `PatienVaccineSequence` tidak punya field `restricted_sequences` atau `is_insertion_available`. | `transaction-consumption.type.ts` |
| **is_pep_insertion Type** — Type field untuk marking insertion transaction | `MISSING` | Tidak ada field di type definition untuk badge Transaction List. | `transaction-consumption.type.ts` |
| **Transaction List Badge** — Tampilkan badge "PEP Insertion" di daftar transaksi | `MISSING` | List view tidak membaca atau menampilkan `is_pep_insertion` flag. | Transaction list page / table component |
| **Transaction Detail Insertion Note** — Catatan "Urutan diperbarui akibat sisipan PEP pada [tanggal]" | `MISSING` | Detail view tidak punya komponen untuk menampilkan insertion note. | Transaction detail page |

---

## 4. Rencana Implementasi Backend

Urutan implementasi mengikuti dependency: database migration dulu, lalu repository, middleware, module, dan terakhir return + notifikasi. Setiap langkah harus diselesaikan dan ditest sebelum ke langkah berikutnya.

### Langkah 1 — Database Migration: Tambah Kolom `is_pep_insertion`

**File:** `apps/main/src/.../migrations/`, `db.d.ts`

Tambahkan kolom `is_pep_insertion` ke tabel `ws_consumptions` untuk menandai transaksi yang merupakan hasil sisipan PEP. Nilai `1` = insertion, `NULL` = transaksi reguler.

```typescript
// Migration: add-column-is_pep_insertion-ws_consumptions.ts
await db.schema
  .alterTable("ws_consumptions")
  .addColumn("is_pep_insertion", "tinyint", (col) =>
    col.defaultTo(null)
  )
  .execute()
```

Tambah juga tabel `ws_pep_insertion_logs` untuk audit trail (`patient_id`, `inserted_by`, `insertion_consumption_id`, `pre_shift_state` JSON, `inserted_at`).

---

### Langkah 2 — Repository: Query Patient PEP History & Update Sequence

**File:** `consumption-rabies.repository.ts`

Method-method baru:

- **`getPatientPepConsumptions(patientId, excludeId?)`** — Query semua rekam `ws_consumptions` + `ws_consumption_rabies` untuk pasien, diurutkan `actual_date` ascending.
- **`getEarliestPepDate(patientId)`** — Shortcut ambil tanggal `actual_date` terawal pasien.
- **`updateConsumptionRabiesSequence(consumptionId, newSequenceId)`** — UPDATE `vaccine_sequence` pada rekam tertentu.
- **`updateConsumptionNextVaccineDate(consumptionId, newNextVaccineDate)`** — UPDATE `next_vaccine_date` setelah shift.
- **`getSequenceAfterShift(currentSequenceId, steps, vaccineMethod)`** — Dari `rabies_vaccine_rules`, tentukan sequence tujuan shift. Harus memperhitungkan `vaccine_method` karena chain Zagreb vs Essen berbeda.
- **`getRestrictedSequencesForPatient(patientId)`** — Untuk endpoint dropdown aware pasien. Returns: `[start_sequence, next_from_last]`.

---

### Langkah 3 — Middleware: Deteksi Insertion & Validasi Tanggal

**File:** `consumption-rabies.middleware.ts` (L340–357, L44–57)

#### 3a. Ubah "existing sequence check" (L340–357)

```typescript
const isStartSequence = await isStartSequenceId(patient.vaccine_sequence)

if (existingSequence && isStartSequence) {
  // Insertion scenario — lanjutkan ke date validation
  patient.__is_insertion = true
} else if (existingSequence) {
  // Sequence non-PEP 0 yang sudah ada → tetap error
  conditionsMessage(ctx, t("validator.invalid_vaccine_sequence"), true, [...])
}
```

#### 3b. Tambah Date Validation untuk Insertion

```typescript
if (patient.__is_insertion) {
  const earliestDate = await repo.getEarliestPepDate(c, patientId)
  const insertionDate = new Date(data.actual_transaction_date)

  conditionsMessage(
    ctx,
    t("validator.insertion_date_must_be_before_existing"),
    insertionDate >= earliestDate,
    ["actual_transaction_date"]
  )
}
```

---

### Langkah 4 — Module: Implementasi Shift Logic (Inti Fitur)

**File:** `consumption-rabies.module.ts`

Method `doProcessPepInsertion()` dipanggil setelah INSERT utama selesai, dalam satu database transaction:

```typescript
async doProcessPepInsertion(c, { patientId, insertedDoseQty, insertedConsumptionId, userId }) {
  const existingConsumptions = await
    repo.getPatientPepConsumptions(c, patientId, insertedConsumptionId)

  // 1 dosis → shift 1 step (Day 0→Day 3); 2 dosis → shift 2 step (Day 0→Day 7)
  const shiftSteps = insertedDoseQty === 2 ? 2 : 1
  const vaccineMethod = existingConsumptions[0].vaccine_method

  for (const consumption of existingConsumptions) {
    const targetSeqId = await repo.getSequenceAfterShift(
      c, consumption.vaccine_sequence, shiftSteps, vaccineMethod
    )
    await repo.updateConsumptionRabiesSequence(c, consumption.id, targetSeqId)

    const newNextDate = calculateNextVaccineDate(consumption.actual_date, targetSeqId)
    await repo.updateConsumptionNextVaccineDate(c, consumption.consumption_id, newNextDate)
  }

  // Update ws_patient_rabies ke state terbaru (satu kali di akhir)
  const latest = existingConsumptions.at(-1)
  await repo.updateOrCreatePatientRabies(c, { patient_id: patientId, ... })

  // Audit log dengan pre_shift_state
  await repo.createPepInsertionLog(c, {
    patient_id: patientId,
    inserted_by: userId,
    insertion_consumption_id: insertedConsumptionId,
    pre_shift_state: existingConsumptions.map(c => ({
      id: c.id, original_sequence: c.vaccine_sequence
    }))
  })
}
```

---

### Langkah 5 — Controller: Endpoint Sequence Dropdown yang Aware Pasien

**File:** `consumption-rabies.controller.ts`

Modifikasi endpoint sequence untuk menerima `identity_number` opsional:

```typescript
// GET /transactions/rabies-sequence?identity_number=<NIK>
// Response ketika pasien ditemukan dengan last PEP = Day 3:
{
  "restricted": true,
  "sequences": [
    { "id": 1, "title": "PEP Hari 0", "is_insertion": true },
    { "id": 5, "title": "PEP Hari 7", "is_insertion": false }
  ]
}
```

---

### Langkah 6 — Notifikasi: Stop & Recalculate Setelah Shift

**File:** `consumption-rabies.module.ts`, `consumption-rabies.repository.ts`

Setelah shift dalam `doProcessPepInsertion`:

- Set `stop_notification = 1` pada rekam lama yang bergeser → cron berhenti kirim notif untuk sequence lama
- Update `next_vaccine_date` pada rekam yang di-shift → cron pick-up tanggal baru
- Set `stop_notification = 0` pada rekam insertion jika ada next sequence

> Karena `patient.cron.ts` membaca `next_vaccine_date` secara real-time dari DB, tidak perlu mekanisme queue cancellation terpisah.

---

### Langkah 7 — Return Transaction: Revert Shift Logic

**File:** `transaction.module.ts`, `transaction.repository.ts`

Saat return transaction diproses:

1. Cek apakah `ws_consumptions.is_pep_insertion = 1`
2. Jika ya: query `ws_pep_insertion_logs.pre_shift_state` untuk daftar rekam yang pernah di-shift
3. Kembalikan `vaccine_sequence` ke nilai semula (dari `pre_shift_state`)
4. Recalculate `next_vaccine_date` untuk rekam yang di-revert
5. Update `ws_patient_rabies` kembali ke sequence sebelum insertion
6. Re-enable notifikasi (`stop_notification = 0`) jika relevan

---

### Langkah 8 — Transaction List & Detail: Badge & Catatan Insertion

**File:** `transaction.repository.ts`, `detail.repository.ts`

- Expose `is_pep_insertion` dalam response Transaction List
- Di Transaction Detail, tambahkan `insertion_note` berisi: *"Urutan diperbarui akibat sisipan PEP pada [tanggal]"*

---

## 5. Rencana Implementasi Frontend

### Langkah FE-1 — Type Definitions

**File:** `packages/ui/src/pages/transaction/TransactionCreate/TransactionConsumption/transaction-consumption.type.ts`

Tambahkan:

```typescript
// Response dari endpoint sequence yang restricted
export type RestrictedRabiesSequence = {
  id: number
  title: string
  is_insertion: boolean
}

export type RabiesSequenceResponse = {
  restricted: boolean
  sequences: RestrictedRabiesSequence[]
} | RestrictedRabiesSequence[] // fallback untuk pasien tidak ditemukan

// Extend untuk badge di list view
export type TransactionListItem = {
  // ... existing fields ...
  is_pep_insertion?: 0 | 1 | null
}
```

---

### Langkah FE-2 — Service: Update Endpoint Sequences

**File:** `transaction-consumption.service.ts`

Modifikasi `getListRabiesSequence` untuk menerima optional `identity_number`:

```typescript
export async function getListRabiesSequence(identityNumber?: string) {
  const response = await axios.get(`${MAIN_SERVICE}/transactions/rabies-sequence`, {
    params: identityNumber ? { identity_number: identityNumber } : undefined
  })
  return response?.data
}
```

---

### Langkah FE-3 — Hook: Update `useGetRabiesSequences`

**File:** `hooks/useGetRabiesSequences.ts`

Hook ini perlu menerima `identityNumber` dan meneruskan ke service. Jika response `restricted: true`, store hanya menyimpan sequences yang diperbolehkan, dengan flag `is_insertion` pada PEP 0.

---

### Langkah FE-4 — Hook: Insertion Detection di `useProtocolRabiesVaccine`

**File:** `hooks/useProtocolRabiesVaccine.ts`

Tambahkan logika:

```typescript
const handleChangeSequence = (selectedSeq: OptionType & { is_insertion?: boolean }) => {
  if (selectedSeq.is_insertion && historyVaccination) {
    // Pasien sudah ada + pilih PEP 0 → trigger insertion warning
    setShowInsertionWarning(true)
  }
  // ... existing logic
}
```

---

### Langkah FE-5 — Komponen Baru: `PepInsertionConfirmationModal`

**File:** Baru di `components/PepInsertionConfirmationModal.tsx`

Modal yang muncul saat insertion terdeteksi:

- Tampilkan peringatan: "Anda akan menyisipkan PEP 0 dengan tanggal lebih awal. Urutan vaksinasi pasien ini akan bergeser secara otomatis."
- Ringkasan pergeseran yang akan terjadi (berdasarkan qty yang dipilih)
- Tombol: **Batalkan** / **Lanjutkan Sisipan**
- Setelah konfirmasi → lanjutkan submit

---

### Langkah FE-6 — Restricted Dropdown & Insertion Badge di `ProtocolRabiesVaccine`

**File:** `components/protocols/ProtocolRabiesVaccine.tsx`

- Jika sequence option punya `is_insertion: true` → tampilkan label "(Sisipan)" di dropdown
- Jika `restricted: true` → tampilkan tooltip info "Pilihan urutan dibatasi berdasarkan riwayat pasien"

---

### Langkah FE-7 — Transaction List Badge & Detail Note

- **List view:** Tampilkan chip/badge "PEP Insertion" pada baris transaksi dengan `is_pep_insertion = 1`
- **Detail view:** Tampilkan section catatan insertion di bawah patient info: *"Urutan diperbarui akibat sisipan PEP pada [tanggal]"*

---

## 6. Perubahan Database

| Tabel | Perubahan | Tipe | Default | Tujuan |
|---|---|---|---|---|
| `ws_consumptions` | ADD COLUMN `is_pep_insertion` | `tinyint(1)` | `NULL` | Flag insertion — digunakan di List & Detail view dan Return logic |
| `ws_pep_insertion_logs` *(baru)* | CREATE TABLE | — | — | Audit trail: `patient_id`, `inserted_by`, `inserted_at`, `insertion_consumption_id`, `pre_shift_state` (JSON) |

> **Zero-downtime:** Kedua migration di atas bersifat additive. Tidak ada perubahan pada kolom existing. Tidak memerlukan backfill data lama.

---

## 7. Risiko Implementasi

| Risiko | Level | Mitigasi |
|---|---|---|
| Shift logic tidak atomik — crash di tengah UPDATE menyebabkan data inkonsisten | **Tinggi** | Seluruh operasi (INSERT + semua UPDATE shift) dalam satu database transaction via `c.var.trx`. |
| Logika `other_sequences` tumpang tindih dengan insertion detection di middleware | **Tinggi** | Pisahkan path secara eksplisit: insertion (PEP 0 saat pasien sudah ada) dan other_sequences (gap historis untuk pasien baru) adalah dua path berbeda dengan kondisi mutually exclusive. |
| Shift target sequence salah karena Zagreb vs Essen punya chain berbeda | **Tinggi** | `getSequenceAfterShift()` harus memperhitungkan `vaccine_method` saat traversal chain. |
| Active duration validation memblokir insertion karena tanggal insertion lebih awal dari `last_vaccine_at` | **Sedang** | Bypass active_duration check saat insertion terdeteksi (`__is_insertion = true`). Dokumentasikan kenapa bypass ini aman. |
| Notifikasi lama tidak berhenti setelah shift | **Sedang** | Set `stop_notification = 1` pada rekam lama sebelum shift diselesaikan. |
| Return transaction gagal revert karena audit log tidak menyimpan original sequence | **Sedang** | `ws_pep_insertion_logs.pre_shift_state` harus menyimpan original sequence ID per `consumption_id` sebelum diubah. |
| FE: Actual date field tidak diisi user sebelum NIK lookup, insertion date validation terjadi terlambat | **Sedang** | Validasi actual_date field wajib diisi sebelum form submission; tampilkan error inline jika tanggal insertion ≥ tanggal existing. |
| FE: Restricted sequences tidak di-refresh jika user ganti NIK setelah sequence sudah dipilih | **Rendah** | Reset field `vaccine_sequence` setiap kali NIK berubah di form. |

---

## 8. Yang Tidak Perlu Diubah

- **Dengue consumption flow** — PRD eksplisit menyatakan PEP Insertion tidak berlaku untuk Dengue
- **PrEP dan Booster flow** — Tidak terdampak
- **Non-NIK patients** — Insertion hanya berlaku saat pasien ditemukan; Non-NIK = tidak ditemukan = flow biasa
- **Schema `rabies_vaccine_rules`** — Tidak perlu perubahan; chain traversal sudah cukup
- **CRON job di `patient.cron.ts`** — Cukup update `next_vaccine_date` dan `stop_notification` di DB, cron akan menyesuaikan otomatis

---

## Referensi File

### Backend

| File | Relevansi |
|---|---|
| `apps/main/src/modules/transaction/consumption-rabies/consumption-rabies.middleware.ts` | Validasi utama — insertion detection & date validation |
| `apps/main/src/modules/transaction/consumption-rabies/consumption-rabies.module.ts` | Shift logic — `doProcessPepInsertion()` |
| `apps/main/src/modules/transaction/consumption-rabies/consumption-rabies.repository.ts` | Query methods baru untuk insertion |
| `apps/main/src/modules/transaction/consumption-rabies/consumption-rabies.controller.ts` | Endpoint sequence dropdown aware-pasien |
| `apps/main/src/modules/transaction/transaction.module.ts` | Return transaction revert logic |
| `apps/main/src/modules/transaction/transaction.repository.ts` | Query return + revert |
| `apps/main/src/modules/transaction/detail/detail.repository.ts` | Transaction detail — insertion note |
| `apps/main/src/modules/transaction/patient/patient.cron.ts` | Tidak diubah — cukup update DB |
| `apps/main/src/common/infrastructure/database/migrations/` | Migration baru: `is_pep_insertion`, `ws_pep_insertion_logs` |
| `apps/main/src/common/infrastructure/database/types/db.d.ts` | Update types setelah migration |

### Frontend

| File | Relevansi |
|---|---|
| `packages/ui/src/pages/transaction/TransactionCreate/hooks/useGetRabiesSequences.ts` | Update: terima `identityNumber`, teruskan ke service |
| `packages/ui/src/pages/transaction/TransactionCreate/TransactionConsumption/hooks/useProtocolRabiesVaccine.ts` | Update: insertion detection logic |
| `packages/ui/src/pages/transaction/TransactionCreate/TransactionConsumption/components/protocols/ProtocolRabiesVaccine.tsx` | Update: restricted dropdown + insertion badge |
| `packages/ui/src/pages/transaction/TransactionCreate/TransactionConsumption/transaction-consumption.service.ts` | Update: `getListRabiesSequence` terima optional `identity_number` |
| `packages/ui/src/pages/transaction/TransactionCreate/TransactionConsumption/transaction-consumption.type.ts` | Update: tambah `RestrictedRabiesSequence`, `is_pep_insertion` |
| `packages/ui/src/pages/transaction/TransactionCreate/TransactionConsumption/components/PepInsertionConfirmationModal.tsx` | **BARU** — modal konfirmasi insertion |
| Transaction list page / table component | Update: tampilkan badge `is_pep_insertion` |
| Transaction detail page | Update: tampilkan insertion note |
