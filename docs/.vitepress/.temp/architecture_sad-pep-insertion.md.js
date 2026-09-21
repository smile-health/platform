import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region architecture/sad-pep-insertion.md
var __pageData = JSON.parse("{\"title\":\"SAD — PEP Insertion | SMILE 5.0\",\"description\":\"\",\"frontmatter\":{},\"headers\":[],\"relativePath\":\"architecture/sad-pep-insertion.md\",\"filePath\":\"architecture/sad-pep-insertion.md\",\"lastUpdated\":null}");
var _sfc_main = { name: "architecture/sad-pep-insertion.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="sad-—-pep-insertion-smile-5-0" tabindex="-1">SAD — PEP Insertion | SMILE 5.0 <a class="header-anchor" href="#sad-—-pep-insertion-smile-5-0" aria-label="Permalink to &quot;SAD — PEP Insertion | SMILE 5.0&quot;">​</a></h1><p><strong>Tipe Dokumen:</strong> Software Architecture Decision<br><strong>Berlaku untuk:</strong> <code>apps/main</code> (BE) · <code>packages/ui/src/pages/transaction/TransactionCreate</code> (FE)<br><strong>Program:</strong> Rabies only (tidak berlaku Dengue / PrEP / Booster)<br><strong>PRD Ref:</strong> §4h — PEP Insertion, v2.0 Jun 2026<br><strong>Status:</strong> <code>SUDAH DIIMPLEMENTASI</code><br><strong>Tanggal:</strong> Juni 2026 (dokumen) · status diverifikasi ulang September 2026</p><hr><blockquote><p><strong>Sudah rilis.</strong> Dokumen ini ditulis sebelum implementasi dan statusnya tidak pernah diperbarui. Yang sudah ada di kode: <a href="https://github.com/smile-health/platform/blob/main/apps/main/src/common/infrastructure/database/migrations/1787000000001_add-column-is-pep-insertion-ws-consumptions.ts" target="_blank" rel="noreferrer"><code>1787000000001_add-column-is-pep-insertion-ws-consumptions.ts</code></a>, <a href="https://github.com/smile-health/platform/blob/main/apps/main/src/common/infrastructure/database/migrations/1787000000002_create-ws-pep-insertion-logs.ts" target="_blank" rel="noreferrer"><code>1787000000002_create-ws-pep-insertion-logs.ts</code></a>, <a href="https://github.com/smile-health/platform/blob/main/apps/main/src/common/infrastructure/database/migrations/1787000000003_add-column-pep-shifted-by-entity-id-ws-consumptions.ts" target="_blank" rel="noreferrer"><code>1787000000003_add-column-pep-shifted-by-entity-id-ws-consumptions.ts</code></a>, dan <a href="https://github.com/smile-health/platform/blob/main/apps/main/src/modules/transaction/consumption/consumption.v2.module.ts" target="_blank" rel="noreferrer"><code>transaction/consumption/consumption.v2.module.ts</code></a>.</p><p>Path FE yang dirujuk di header sudah pindah: <code>packages/ui/src/pages/transaction/TransactionConsumption</code> tidak ada lagi, dan <code>consumption-rabies/</code> sekarang hanya berisi <code>.schema.ts</code>. Perlakukan referensi file di bawah sebagai historis, bukan peta kode saat ini.</p></blockquote><h2 id="ringkasan-eksekutif" tabindex="-1">Ringkasan Eksekutif <a class="header-anchor" href="#ringkasan-eksekutif" aria-label="Permalink to &quot;Ringkasan Eksekutif&quot;">​</a></h2><table tabindex="0"><thead><tr><th></th><th>Jumlah</th><th>Keterangan</th></tr></thead><tbody><tr><td><strong>Missing</strong></td><td>15</td><td>Fitur / logika yang belum ada (BE + FE)</td></tr><tr><td><strong>Partial</strong></td><td>2</td><td>Fitur yang ada sebagian — perlu perubahan signifikan</td></tr><tr><td><strong>Reusable</strong></td><td>3</td><td>Infrastruktur yang bisa di-reuse atau diperluas</td></tr></tbody></table><p>Fitur PEP Insertion pada PRD v2.0 mendefinisikan skenario di mana petugas menyisipkan transaksi PEP 0 dengan tanggal lebih awal dari transaksi yang sudah ada. Ini <strong>berbeda fundamental</strong> dari mekanisme <code>other_sequences</code> yang sudah ada di kode.</p><hr><h2 id="_1-analisis-prd-§4h-—-pep-insertion" tabindex="-1">1. Analisis PRD §4h — PEP Insertion <a class="header-anchor" href="#_1-analisis-prd-§4h-—-pep-insertion" aria-label="Permalink to &quot;1. Analisis PRD §4h — PEP Insertion&quot;">​</a></h2><h3 id="_1-1-aturan-dasar-—-pembatasan-urutan" tabindex="-1">1.1 Aturan Dasar — Pembatasan Urutan <a class="header-anchor" href="#_1-1-aturan-dasar-—-pembatasan-urutan" aria-label="Permalink to &quot;1.1 Aturan Dasar — Pembatasan Urutan&quot;">​</a></h3><table tabindex="0"><thead><tr><th>Kondisi Pasien</th><th>Pilihan yang Tersedia di Dropdown</th><th>Perilaku Sistem</th></tr></thead><tbody><tr><td>Pasien <strong>TIDAK</strong> ditemukan di SMILE</td><td>Semua urutan (PEP 0, PEP 3, PEP 7, dst.)</td><td>Tidak ada pembatasan — transaksi biasa</td></tr><tr><td>Pasien <strong>DITEMUKAN</strong>, sudah punya rekam PEP</td><td><strong>Hanya 2 pilihan:</strong> PEP 0 (sisipan) ATAU urutan selanjutnya dari PEP terakhir</td><td>Pembatasan ketat — dropdown dikurangi</td></tr><tr><td>Pasien <strong>DITEMUKAN</strong>, pilih PEP 0 (insertion detected)</td><td>PEP 0 dengan tanggal aktual wajib &lt; tanggal existing PEP 0</td><td>Trigger insertion logic + shift otomatis</td></tr></tbody></table><h3 id="_1-2-logika-pergeseran-urutan-shift" tabindex="-1">1.2 Logika Pergeseran Urutan (Shift) <a class="header-anchor" href="#_1-2-logika-pergeseran-urutan-shift" aria-label="Permalink to &quot;1.2 Logika Pergeseran Urutan (Shift)&quot;">​</a></h3><p>Inti dari fitur ini adalah re-mapping urutan seluruh transaksi PEP pasien setelah insertion disimpan.</p><table tabindex="0"><thead><tr><th>Dosis PEP 0 Disisipkan</th><th>Efek pada Rekam Lama</th><th>Contoh Konkret</th></tr></thead><tbody><tr><td><strong>1 dosis</strong></td><td>Existing PEP 0 → bergeser ke <strong>PEP Day 3</strong></td><td>Transaksi 10 Jun (PEP 0 lama) menjadi PEP 3 dalam protokol</td></tr><tr><td><strong>2 dosis</strong></td><td>Existing PEP 0 → bergeser ke <strong>PEP Day 7</strong></td><td>Transaksi 10 Jun (PEP 0 lama) menjadi PEP 7 dalam protokol</td></tr></tbody></table><blockquote><p><strong>Catatan arsitektur:</strong> Pergeseran ini bukan menghapus rekam lama — melainkan <em>mengubah</em> <code>vaccine_sequence</code> pada rekam yang sudah ada di <code>ws_consumption_rabies</code> dan <code>ws_patient_rabies</code>, lalu merecalculate <code>next_vaccine_date</code> di <code>ws_consumptions</code>.</p></blockquote><h3 id="_1-3-perilaku-sistem-setelah-insertion" tabindex="-1">1.3 Perilaku Sistem Setelah Insertion <a class="header-anchor" href="#_1-3-perilaku-sistem-setelah-insertion" aria-label="Permalink to &quot;1.3 Perilaku Sistem Setelah Insertion&quot;">​</a></h3><ul><li>Pergeseran urutan bersifat <strong>atomik</strong> — INSERT transaksi baru + UPDATE semua rekam lama dalam satu database transaction</li><li>Semua <code>next_vaccine_date</code> pada rekam yang bergeser harus di-<strong>recalculate</strong> berdasarkan sequence baru</li><li>Notifikasi pengingat yang sudah terjadwal di-<strong>cancel dan dibuat ulang</strong> berdasarkan urutan yang diperbarui</li><li>Insertion transaction harus diberi <strong>flag khusus</strong> agar terlihat di Transaction List dengan badge</li><li><strong>Audit log</strong> mencatat bahwa shift terjadi, beserta timestamp dan user yang melakukan</li><li>Return transaction pada insertion → semua shift <strong>di-revert</strong></li><li>Hanya berlaku saat pasien <strong>DITEMUKAN</strong> di SMILE — Non-NIK tidak didukung</li></ul><h3 id="_1-4-study-cases-prd-halaman-11–12" tabindex="-1">1.4 Study Cases (PRD halaman 11–12) <a class="header-anchor" href="#_1-4-study-cases-prd-halaman-11–12" aria-label="Permalink to &quot;1.4 Study Cases (PRD halaman 11–12)&quot;">​</a></h3><h4 id="zagreb-—-alur-normal" tabindex="-1">Zagreb — Alur Normal <a class="header-anchor" href="#zagreb-—-alur-normal" aria-label="Permalink to &quot;Zagreb — Alur Normal&quot;">​</a></h4><p>Protocol: PEP 0 = 2 dosis (Day 0), PEP 7 = 1 dosis, PEP 21/28 = 1 dosis</p><table tabindex="0"><thead><tr><th>Tanggal Input</th><th>Input ke-</th><th>PEP 0</th><th>PEP 7</th><th>PEP 21/28</th></tr></thead><tbody><tr><td>02-Jan-26</td><td>1</td><td>2</td><td>—</td><td>—</td></tr><tr><td>08-Jan-26</td><td>2</td><td>2</td><td>1</td><td>—</td></tr><tr><td>15-Jan-26</td><td>3</td><td>2</td><td>1</td><td>1</td></tr></tbody></table><h4 id="essen-—-termasuk-skenario-insertion" tabindex="-1">Essen — Termasuk Skenario Insertion <a class="header-anchor" href="#essen-—-termasuk-skenario-insertion" aria-label="Permalink to &quot;Essen — Termasuk Skenario Insertion&quot;">​</a></h4><p>Protocol: PEP 0 = 1, PEP 3 = 1, PEP 7 = 1, PEP 14 = 1</p><table tabindex="0"><thead><tr><th>Tanggal Aktual</th><th>Input ke-</th><th>PEP 0</th><th>PEP 3</th><th>PEP 7</th><th>PEP 14</th><th>Keterangan</th></tr></thead><tbody><tr><td>05-Jan-26</td><td>1</td><td>1</td><td>—</td><td>—</td><td>—</td><td>Entry pertama</td></tr><tr><td>12-Jan-26</td><td>2</td><td>1</td><td>1</td><td>—</td><td>—</td><td>Tambah PEP 3</td></tr><tr><td><strong>02-Jan-26</strong></td><td><strong>3</strong></td><td><strong>1</strong></td><td><strong>1</strong></td><td><strong>1</strong></td><td>—</td><td><strong>Insertion PEP 0 (tgl lebih awal dari 05-Jan)</strong></td></tr><tr><td>17-Jan-26</td><td>4</td><td>1</td><td>1</td><td>1</td><td>1</td><td>Lanjut PEP 14</td></tr></tbody></table><blockquote><p>Input ke-3 menyisipkan PEP 0 pada 02-Jan (sebelum 05-Jan), menyebabkan rekam 05-Jan bergeser ke PEP 3, dan 12-Jan bergeser ke PEP 7.</p></blockquote><h4 id="essen-→-zagreb-ubah-tipe" tabindex="-1">Essen → Zagreb (Ubah Tipe) <a class="header-anchor" href="#essen-→-zagreb-ubah-tipe" aria-label="Permalink to &quot;Essen → Zagreb (Ubah Tipe)&quot;">​</a></h4><p>Pasien awalnya dicatat dengan Essen, kemudian insertion dilakukan dengan tipe Zagreb.</p><table tabindex="0"><thead><tr><th>Tanggal Aktual</th><th>Input ke-</th><th>PEP 0</th><th>PEP 3</th><th>PEP 7</th><th>PEP 21/28</th><th>Keterangan</th></tr></thead><tbody><tr><td>10-Jan-26</td><td>1</td><td>1</td><td>—</td><td>—</td><td>—</td><td>Essen Day 0</td></tr><tr><td>14-Jan-26</td><td>2</td><td>1</td><td>1</td><td>—</td><td>—</td><td>Essen Day 3</td></tr><tr><td><strong>03-Jan-26</strong></td><td><strong>3</strong></td><td><strong>2</strong></td><td>—</td><td><strong>1</strong></td><td><strong>1</strong></td><td><strong>Insertion Zagreb (2 dosis), tgl lebih awal</strong></td></tr></tbody></table><blockquote><p>Insertion 03-Jan dengan Zagreb (2 dosis) menyebabkan rekam Essen 10-Jan bergeser ke PEP 7, dan 14-Jan bergeser ke PEP 21/28.</p></blockquote><h4 id="essen-→-zagreb-→-booster-ubah-tipe-booster" tabindex="-1">Essen → Zagreb → Booster (Ubah Tipe + Booster) <a class="header-anchor" href="#essen-→-zagreb-→-booster-ubah-tipe-booster" aria-label="Permalink to &quot;Essen → Zagreb → Booster (Ubah Tipe + Booster)&quot;">​</a></h4><table tabindex="0"><thead><tr><th>Tanggal Aktual</th><th>Input ke-</th><th>PEP 0</th><th>PEP 3</th><th>PEP 7</th><th>PEP 21/28</th><th>Booster PEP 0</th><th>Booster PEP 7</th><th>Keterangan</th></tr></thead><tbody><tr><td>16-Jan-26</td><td>1</td><td>1</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td><td>Entry pertama</td></tr><tr><td>20-Jan-26</td><td>2</td><td>1</td><td>1</td><td>—</td><td>—</td><td>—</td><td>—</td><td>Tambah PEP 3</td></tr><tr><td>09-Jan-26</td><td>3</td><td>1</td><td>1</td><td>1</td><td>1</td><td>—</td><td>—</td><td>Insertion PEP 0 + other_sequences</td></tr><tr><td><strong>03-Jan-26</strong></td><td><strong>4</strong></td><td><strong>2</strong></td><td>—</td><td><strong>1</strong></td><td>—</td><td><strong>1</strong></td><td>—</td><td><strong>Insertion Zagreb + Booster dimulai</strong></td></tr></tbody></table><hr><h2 id="_2-analisis-kode-existing" tabindex="-1">2. Analisis Kode Existing <a class="header-anchor" href="#_2-analisis-kode-existing" aria-label="Permalink to &quot;2. Analisis Kode Existing&quot;">​</a></h2><h3 id="_2-1-arsitektur-dua-modul" tabindex="-1">2.1 Arsitektur Dua Modul <a class="header-anchor" href="#_2-1-arsitektur-dua-modul" aria-label="Permalink to &quot;2.1 Arsitektur Dua Modul&quot;">​</a></h3><p>Ada dua consumption module terpisah untuk Rabies, dengan skema tabel yang berbeda:</p><table tabindex="0"><thead><tr><th>Modul</th><th>File Utama</th><th>Tabel Sequence</th><th>Digunakan untuk</th></tr></thead><tbody><tr><td><code>consumption-rabies</code></td><td><code>consumption-rabies.module.ts</code></td><td><code>rabies_vaccine_rules</code></td><td>Alur Rabies utama (lewat controller sendiri)</td></tr><tr><td><code>consumption</code> (general)</td><td><code>consumption.module.ts</code></td><td><code>ws_vaccine_sequences</code> + <code>ws_vaccine_rules</code></td><td>Protokol baru (Dengue, generic)</td></tr></tbody></table><blockquote><p>PEP Insertion bekerja pada alur Rabies, sehingga implementasi utama ada di <strong>consumption-rabies</strong> module. Tabel <code>rabies_vaccine_rules</code> masih digunakan untuk sequence chain, bukan <code>ws_vaccine_rules</code>.</p></blockquote><h3 id="_2-2-validasi-sequence-yang-ada" tabindex="-1">2.2 Validasi Sequence yang Ada <a class="header-anchor" href="#_2-2-validasi-sequence-yang-ada" aria-label="Permalink to &quot;2.2 Validasi Sequence yang Ada&quot;">​</a></h3><p>File <code>consumption-rabies.middleware.ts</code> (L287–L545) menangani validasi dengan tahapan berikut:</p><ul><li><strong>Active duration check</strong> (L287–337): Jika pasien ditemukan, cek apakah tanggal transaksi baru masih dalam <code>active_duration</code> dari vaksin terakhir</li><li><strong>Existing sequence check</strong> (L340–357): Jika sequence yang diminta <em>sudah ada</em> di <code>ws_patient_rabies</code> → <em>error</em> <code>&quot;invalid vaccine sequence&quot;</code></li><li><strong>Chain validation</strong> (L360–422): Walk backwards melalui <code>previous_sequence</code> untuk verifikasi chain</li><li><strong>Prerequisite qty</strong> (L424–545): Khusus sequence 11 dan 13 (booster), cek minimum dosis</li></ul><blockquote><p><strong>Masalah kritis:</strong> Baris L340–357 secara eksplisit <em>menolak</em> jika sequence yang diminta sudah ada di rekam pasien. Ini yang perlu diubah — untuk PEP Insertion, memilih PEP 0 saat pasien sudah punya PEP 0 seharusnya <em>diizinkan</em> (sebagai sisipan), bukan ditolak.</p></blockquote><h3 id="_2-3-mekanisme-other-sequences-vs-pep-insertion" tabindex="-1">2.3 Mekanisme &quot;Other Sequences&quot; vs PEP Insertion <a class="header-anchor" href="#_2-3-mekanisme-other-sequences-vs-pep-insertion" aria-label="Permalink to &quot;2.3 Mekanisme &quot;Other Sequences&quot; vs PEP Insertion&quot;">​</a></h3><table tabindex="0"><thead><tr><th></th><th>Other Sequences (Existing)</th><th>PEP Insertion (PRD §4h — Belum Ada)</th></tr></thead><tbody><tr><td><strong>Tujuan</strong></td><td>Mengisi <em>gap historis</em> — pasien sudah punya beberapa suntikan sebelumnya yang belum tercatat</td><td>Menyisipkan PEP 0 baru dengan tanggal lebih awal dari data yang sudah ada</td></tr><tr><td><strong>Efek pada rekam lama</strong></td><td>Tidak ada — hanya menambah rekam baru</td><td><strong>Mengubah</strong> rekam yang sudah ada — update <code>vaccine_sequence</code> pada rekam lama</td></tr><tr><td><strong>Qty transaksi</strong></td><td><code>change_qty: 0</code> (zero-qty) untuk sequence yang dilewati</td><td>Qty aktual yang real</td></tr><tr><td><strong>Pergeseran urutan</strong></td><td>Tidak ada — sequence ID tetap</td><td>Pergeseran urutan otomatis berdasarkan jumlah dosis yang disisipkan</td></tr><tr><td><strong>Validasi tanggal</strong></td><td>Tidak ada</td><td>Wajib: tanggal insertion &lt; tanggal existing PEP 0</td></tr></tbody></table><h3 id="_2-4-sistem-notifikasi-yang-ada" tabindex="-1">2.4 Sistem Notifikasi yang Ada <a class="header-anchor" href="#_2-4-sistem-notifikasi-yang-ada" aria-label="Permalink to &quot;2.4 Sistem Notifikasi yang Ada&quot;">​</a></h3><p>Di <code>patient.cron.ts</code> (L25–154), CRON job membaca <code>next_vaccine_date</code> dari <code>ws_consumptions</code> untuk menentukan kapan notifikasi dikirim. Tidak ada mekanisme recalculation atau cancellation jadwal notifikasi yang sudah di-set.</p><h3 id="_2-5-skema-tabel-relevan" tabindex="-1">2.5 Skema Tabel Relevan <a class="header-anchor" href="#_2-5-skema-tabel-relevan" aria-label="Permalink to &quot;2.5 Skema Tabel Relevan&quot;">​</a></h3><table tabindex="0"><thead><tr><th>Tabel</th><th>Kolom Relevan</th><th>Keterangan</th></tr></thead><tbody><tr><td><code>ws_consumptions</code></td><td><code>vaccine_sequence_id</code>, <code>next_vaccine_date</code>, <code>actual_date</code>, <code>reference_consumption_id</code>, <code>stop_notification</code>, <code>return_transaction_id</code></td><td>Tidak ada kolom <code>is_pep_insertion</code> atau sejenisnya</td></tr><tr><td><code>ws_consumption_rabies</code></td><td><code>consumption_id</code>, <code>vaccine_sequence</code>, <code>vaccine_type</code>, <code>vaccine_method</code></td><td>Tidak ada flag insertion</td></tr><tr><td><code>ws_patient_rabies</code></td><td><code>patient_id</code>, <code>vaccine_sequence</code>, <code>vaccine_type</code>, <code>vaccine_method</code>, <code>last_vaccine_at</code></td><td>Satu record per pasien (upsert). Ini yang perlu di-update setelah shift</td></tr><tr><td><code>rabies_vaccine_rules</code></td><td><code>id</code>, <code>previous_sequence</code>, <code>next_sequence</code>, <code>active_duration</code>, <code>prerequisite_qty</code></td><td>Chain rules — digunakan untuk menentukan target shift</td></tr></tbody></table><h3 id="_2-6-kondisi-fe-existing" tabindex="-1">2.6 Kondisi FE Existing <a class="header-anchor" href="#_2-6-kondisi-fe-existing" aria-label="Permalink to &quot;2.6 Kondisi FE Existing&quot;">​</a></h3><table tabindex="0"><thead><tr><th>File</th><th>Status</th><th>Keterangan</th></tr></thead><tbody><tr><td><code>useGetRabiesSequences.ts</code></td><td><code>PARTIAL</code></td><td>Fetch <code>GET /transactions/rabies-sequence</code> tanpa context pasien — tidak ada <code>identity_number</code> param</td></tr><tr><td><code>transaction-consumption.service.ts</code> (L60)</td><td><code>EXISTS</code></td><td><code>getDataPatientSequence(nik, protocolId)</code> → <code>GET /consumptions/patient/{nik}/{protocolId}/vaccine-sequence</code> sudah ada, tapi response tidak include restricted sequences</td></tr><tr><td><code>PatienVaccineSequence</code> type</td><td><code>PARTIAL</code></td><td>Punya <code>next_sequence</code> dan <code>previous_sequence</code> tapi tidak ada <code>is_insertion</code>, <code>restricted_sequences</code>, atau info insertion</td></tr><tr><td><code>useProtocolRabiesVaccine.ts</code></td><td><code>PARTIAL</code></td><td>Menangani vaccine selection tapi tidak ada insertion detection logic</td></tr><tr><td><code>ProtocolRabiesVaccine.tsx</code></td><td><code>PARTIAL</code></td><td>Dropdown sequence sudah ada, tapi tidak aware konteks insertion</td></tr></tbody></table><hr><h2 id="_3-gap-analysis-—-prd-vs-kode-existing" tabindex="-1">3. Gap Analysis — PRD vs Kode Existing <a class="header-anchor" href="#_3-gap-analysis-—-prd-vs-kode-existing" aria-label="Permalink to &quot;3. Gap Analysis — PRD vs Kode Existing&quot;">​</a></h2><h3 id="_3a-backend-gaps" tabindex="-1">3a. Backend Gaps <a class="header-anchor" href="#_3a-backend-gaps" aria-label="Permalink to &quot;3a. Backend Gaps&quot;">​</a></h3><table tabindex="0"><thead><tr><th>Fitur / Requirement</th><th>Status</th><th>Detail Gap</th><th>File yang Terdampak</th></tr></thead><tbody><tr><td><strong>Insertion Detection</strong> — Deteksi skenario sisipan</td><td><code>MISSING</code></td><td>Middleware saat ini <em>menolak</em> (error) jika PEP 0 dipilih saat pasien sudah punya PEP 0. Perlu diubah menjadi deteksi insertion.</td><td><code>middleware.ts</code> L340–357</td></tr><tr><td><strong>Sequence Restriction API</strong> — Endpoint sequence yang aware pasien</td><td><code>MISSING</code></td><td><code>GET /transactions/rabies-sequence</code> tidak menerima konteks pasien. Endpoint <code>GET /consumptions/patient/{nik}/{protocolId}/vaccine-sequence</code> ada tapi tidak mengembalikan restricted sequences + insertion flag.</td><td><code>repository.ts</code>, <code>controller.ts</code></td></tr><tr><td><strong>Date Validation for Insertion</strong> — Tanggal sisipan &lt; tanggal existing</td><td><code>MISSING</code></td><td>Tidak ada validasi bahwa <code>actual_transaction_date</code> pada insertion lebih awal dari tanggal PEP 0 yang sudah ada.</td><td><code>middleware.ts</code> L44–57</td></tr><tr><td><strong>Sequence Shift Logic</strong> — Re-mapping rekam lama</td><td><code>MISSING</code></td><td>Tidak ada kode yang mengupdate <code>vaccine_sequence</code> pada <code>ws_consumption_rabies</code> dan <code>ws_patient_rabies</code> setelah insertion.</td><td><code>module.ts</code> (baru), <code>repository.ts</code> (baru)</td></tr><tr><td><strong>next_vaccine_date Recalculation</strong> — Update tanggal vaksin berikutnya</td><td><code>MISSING</code></td><td>Setelah shift, <code>next_vaccine_date</code> di <code>ws_consumptions</code> untuk rekam yang bergeser perlu dihitung ulang berdasarkan sequence baru.</td><td><code>module.ts</code> (baru), <code>repository.ts</code> (baru)</td></tr><tr><td><strong>Notification Recalculation</strong> — Cancel &amp; buat ulang jadwal notif</td><td><code>MISSING</code></td><td>Tidak ada mekanisme untuk menghentikan notifikasi yang sudah aktif untuk sequence yang bergeser.</td><td><code>patient.cron.ts</code> L25</td></tr><tr><td><strong>is_pep_insertion Flag</strong> — Marking transaksi sebagai sisipan</td><td><code>MISSING</code></td><td>Tidak ada kolom di <code>ws_consumptions</code> untuk menandai insertion transaction.</td><td>Migration baru, <code>db.d.ts</code></td></tr><tr><td><strong>Audit Log Insertion</strong> — Rekam event pergeseran</td><td><code>MISSING</code></td><td>Tidak ada tabel atau mekanisme audit.</td><td>Migration baru, <code>module.ts</code></td></tr><tr><td><strong>Return Transaction Revert</strong> — Undo shift saat return</td><td><code>MISSING</code></td><td>Return flow tidak mendeteksi insertion dan tidak ada logika revert shift.</td><td><code>transaction.module.ts</code>, <code>transaction.repository.ts</code></td></tr><tr><td><strong>Other Sequences Mechanism</strong></td><td><code>PARTIAL</code></td><td>Konsep zero-qty bisa di-reuse tapi perlu dipisah eksplisit dari insertion path.</td><td><code>module.ts</code> L461</td></tr><tr><td><strong>Active Duration Validation</strong></td><td><code>PARTIAL</code></td><td>Sudah ada tapi harus di-bypass saat insertion terdeteksi.</td><td><code>middleware.ts</code> L287</td></tr><tr><td><strong>Transaction DB Structure</strong></td><td><code>EXISTS</code></td><td>Infrastruktur create transaction + consumption sudah solid.</td><td><code>module.ts</code> L112–210</td></tr><tr><td><strong>Vaccine Rule Chain</strong></td><td><code>EXISTS</code></td><td>Logic traversal <code>previous_sequence</code> / <code>next_sequence</code> sudah ada.</td><td><code>middleware.ts</code> L369</td></tr><tr><td><strong>Patient Identity Lookup</strong></td><td><code>EXISTS</code></td><td><code>getPatientIdByIdentity()</code> dan <code>updateOrCreatePatient()</code> sudah ada.</td><td><code>repository.ts</code> L89–131</td></tr></tbody></table><h3 id="_3b-frontend-gaps" tabindex="-1">3b. Frontend Gaps <a class="header-anchor" href="#_3b-frontend-gaps" aria-label="Permalink to &quot;3b. Frontend Gaps&quot;">​</a></h3><table tabindex="0"><thead><tr><th>Fitur / Requirement</th><th>Status</th><th>Detail Gap</th><th>File yang Terdampak</th></tr></thead><tbody><tr><td><strong>Restricted Sequence Dropdown</strong> — Batasi opsi saat pasien ditemukan</td><td><code>MISSING</code></td><td>Hook <code>useGetRabiesSequences</code> fetch tanpa context pasien; tidak ada logika pembatasan.</td><td><code>useGetRabiesSequences.ts</code>, <code>ProtocolRabiesVaccine.tsx</code></td></tr><tr><td><strong>Insertion Detection UI</strong> — Deteksi &amp; komunikasikan ke user saat PEP 0 dipilih dan pasien sudah ada</td><td><code>MISSING</code></td><td>Tidak ada logika di <code>useProtocolRabiesVaccine</code> untuk mendeteksi skenario insertion.</td><td><code>useProtocolRabiesVaccine.ts</code></td></tr><tr><td><strong>Actual Date Field di Header</strong> — Field tanggal aktual transaksi wajib (PRD §4a)</td><td><code>MISSING</code></td><td>Perlu validasi bahwa tanggal aktual diisi dan digunakan untuk insertion date check.</td><td>Header form component</td></tr><tr><td><strong>PEP Insertion Confirmation Modal</strong> — Konfirmasi sebelum submit insertion</td><td><code>MISSING</code></td><td>Perlu modal peringatan: &quot;Anda akan menyisipkan PEP 0 dengan tanggal lebih awal, urutan existing akan bergeser.&quot;</td><td>Komponen baru</td></tr><tr><td><strong>Date Validation Error Display</strong> — Tampilkan error jika tanggal insertion ≥ tanggal existing</td><td><code>MISSING</code></td><td>Tidak ada komponen untuk menampilkan error validasi tanggal insertion.</td><td>Header form component, error state</td></tr><tr><td><strong>Restricted Sequences Response Type</strong> — Type untuk API response restricted sequences</td><td><code>MISSING</code></td><td><code>PatienVaccineSequence</code> tidak punya field <code>restricted_sequences</code> atau <code>is_insertion_available</code>.</td><td><code>transaction-consumption.type.ts</code></td></tr><tr><td><strong>is_pep_insertion Type</strong> — Type field untuk marking insertion transaction</td><td><code>MISSING</code></td><td>Tidak ada field di type definition untuk badge Transaction List.</td><td><code>transaction-consumption.type.ts</code></td></tr><tr><td><strong>Transaction List Badge</strong> — Tampilkan badge &quot;PEP Insertion&quot; di daftar transaksi</td><td><code>MISSING</code></td><td>List view tidak membaca atau menampilkan <code>is_pep_insertion</code> flag.</td><td>Transaction list page / table component</td></tr><tr><td><strong>Transaction Detail Insertion Note</strong> — Catatan &quot;Urutan diperbarui akibat sisipan PEP pada [tanggal]&quot;</td><td><code>MISSING</code></td><td>Detail view tidak punya komponen untuk menampilkan insertion note.</td><td>Transaction detail page</td></tr></tbody></table><hr><h2 id="_4-rencana-implementasi-backend" tabindex="-1">4. Rencana Implementasi Backend <a class="header-anchor" href="#_4-rencana-implementasi-backend" aria-label="Permalink to &quot;4. Rencana Implementasi Backend&quot;">​</a></h2><p>Urutan implementasi mengikuti dependency: database migration dulu, lalu repository, middleware, module, dan terakhir return + notifikasi. Setiap langkah harus diselesaikan dan ditest sebelum ke langkah berikutnya.</p><h3 id="langkah-1-—-database-migration-tambah-kolom-is-pep-insertion" tabindex="-1">Langkah 1 — Database Migration: Tambah Kolom <code>is_pep_insertion</code> <a class="header-anchor" href="#langkah-1-—-database-migration-tambah-kolom-is-pep-insertion" aria-label="Permalink to &quot;Langkah 1 — Database Migration: Tambah Kolom \`is_pep_insertion\`&quot;">​</a></h3><p><strong>File:</strong> <code>apps/main/src/.../migrations/</code>, <code>db.d.ts</code></p><p>Tambahkan kolom <code>is_pep_insertion</code> ke tabel <code>ws_consumptions</code> untuk menandai transaksi yang merupakan hasil sisipan PEP. Nilai <code>1</code> = insertion, <code>NULL</code> = transaksi reguler.</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// Migration: add-column-is_pep_insertion-ws_consumptions.ts</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">await</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> db.schema</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  .</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">alterTable</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;ws_consumptions&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  .</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">addColumn</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;is_pep_insertion&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;tinyint&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, (</span><span style="${ssrRenderStyle({
		"--shiki-light": "#E36209",
		"--shiki-dark": "#FFAB70"
	})}">col</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">) </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">=&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    col.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">defaultTo</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">null</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  )</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  .</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">execute</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">()</span></span></code></pre></div><p>Tambah juga tabel <code>ws_pep_insertion_logs</code> untuk audit trail (<code>patient_id</code>, <code>inserted_by</code>, <code>insertion_consumption_id</code>, <code>pre_shift_state</code> JSON, <code>inserted_at</code>).</p><hr><h3 id="langkah-2-—-repository-query-patient-pep-history-update-sequence" tabindex="-1">Langkah 2 — Repository: Query Patient PEP History &amp; Update Sequence <a class="header-anchor" href="#langkah-2-—-repository-query-patient-pep-history-update-sequence" aria-label="Permalink to &quot;Langkah 2 — Repository: Query Patient PEP History &amp; Update Sequence&quot;">​</a></h3><p><strong>File:</strong> <code>consumption-rabies.repository.ts</code></p><p>Method-method baru:</p><ul><li><strong><code>getPatientPepConsumptions(patientId, excludeId?)</code></strong> — Query semua rekam <code>ws_consumptions</code> + <code>ws_consumption_rabies</code> untuk pasien, diurutkan <code>actual_date</code> ascending.</li><li><strong><code>getEarliestPepDate(patientId)</code></strong> — Shortcut ambil tanggal <code>actual_date</code> terawal pasien.</li><li><strong><code>updateConsumptionRabiesSequence(consumptionId, newSequenceId)</code></strong> — UPDATE <code>vaccine_sequence</code> pada rekam tertentu.</li><li><strong><code>updateConsumptionNextVaccineDate(consumptionId, newNextVaccineDate)</code></strong> — UPDATE <code>next_vaccine_date</code> setelah shift.</li><li><strong><code>getSequenceAfterShift(currentSequenceId, steps, vaccineMethod)</code></strong> — Dari <code>rabies_vaccine_rules</code>, tentukan sequence tujuan shift. Harus memperhitungkan <code>vaccine_method</code> karena chain Zagreb vs Essen berbeda.</li><li><strong><code>getRestrictedSequencesForPatient(patientId)</code></strong> — Untuk endpoint dropdown aware pasien. Returns: <code>[start_sequence, next_from_last]</code>.</li></ul><hr><h3 id="langkah-3-—-middleware-deteksi-insertion-validasi-tanggal" tabindex="-1">Langkah 3 — Middleware: Deteksi Insertion &amp; Validasi Tanggal <a class="header-anchor" href="#langkah-3-—-middleware-deteksi-insertion-validasi-tanggal" aria-label="Permalink to &quot;Langkah 3 — Middleware: Deteksi Insertion &amp; Validasi Tanggal&quot;">​</a></h3><p><strong>File:</strong> <code>consumption-rabies.middleware.ts</code> (L340–357, L44–57)</p><h4 id="_3a-ubah-existing-sequence-check-l340–357" tabindex="-1">3a. Ubah &quot;existing sequence check&quot; (L340–357) <a class="header-anchor" href="#_3a-ubah-existing-sequence-check-l340–357" aria-label="Permalink to &quot;3a. Ubah &quot;existing sequence check&quot; (L340–357)&quot;">​</a></h4><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> isStartSequence</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> await</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> isStartSequenceId</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(patient.vaccine_sequence)</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">if</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> (existingSequence </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">&amp;&amp;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> isStartSequence) {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">  // Insertion scenario — lanjutkan ke date validation</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  patient.__is_insertion </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> true</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">} </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">else</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> if</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> (existingSequence) {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">  // Sequence non-PEP 0 yang sudah ada → tetap error</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">  conditionsMessage</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(ctx, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">t</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;validator.invalid_vaccine_sequence&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">), </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">true</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, [</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">...</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">])</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}</span></span></code></pre></div><h4 id="_3b-tambah-date-validation-untuk-insertion" tabindex="-1">3b. Tambah Date Validation untuk Insertion <a class="header-anchor" href="#_3b-tambah-date-validation-untuk-insertion" aria-label="Permalink to &quot;3b. Tambah Date Validation untuk Insertion&quot;">​</a></h4><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">if</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> (patient.__is_insertion) {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">  const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> earliestDate</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> await</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> repo.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">getEarliestPepDate</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(c, patientId)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">  const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> insertionDate</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> new</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> Date</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(data.actual_transaction_date)</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">  conditionsMessage</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    ctx,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">    t</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;validator.insertion_date_must_be_before_existing&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">),</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    insertionDate </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">&gt;=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> earliestDate,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    [</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;actual_transaction_date&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">]</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  )</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}</span></span></code></pre></div><hr><h3 id="langkah-4-—-module-implementasi-shift-logic-inti-fitur" tabindex="-1">Langkah 4 — Module: Implementasi Shift Logic (Inti Fitur) <a class="header-anchor" href="#langkah-4-—-module-implementasi-shift-logic-inti-fitur" aria-label="Permalink to &quot;Langkah 4 — Module: Implementasi Shift Logic (Inti Fitur)&quot;">​</a></h3><p><strong>File:</strong> <code>consumption-rabies.module.ts</code></p><p>Method <code>doProcessPepInsertion()</code> dipanggil setelah INSERT utama selesai, dalam satu database transaction:</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">async </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">doProcessPepInsertion</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(c, { patientId, insertedDoseQty, insertedConsumptionId, userId }) {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">  const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> existingConsumptions</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> await</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    repo.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">getPatientPepConsumptions</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(c, patientId, insertedConsumptionId)</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">  // 1 dosis → shift 1 step (Day 0→Day 3); 2 dosis → shift 2 step (Day 0→Day 7)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">  const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> shiftSteps</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> insertedDoseQty </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">===</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> 2</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> ?</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> 2</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> :</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> 1</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">  const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> vaccineMethod</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> existingConsumptions[</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">0</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">].vaccine_method</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">  for</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> (</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> consumption</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> of</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> existingConsumptions) {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">    const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> targetSeqId</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> await</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> repo.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">getSequenceAfterShift</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">      c, consumption.vaccine_sequence, shiftSteps, vaccineMethod</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    )</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">    await</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> repo.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">updateConsumptionRabiesSequence</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(c, consumption.id, targetSeqId)</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">    const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> newNextDate</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> calculateNextVaccineDate</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(consumption.actual_date, targetSeqId)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">    await</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> repo.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">updateConsumptionNextVaccineDate</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(c, consumption.consumption_id, newNextDate)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  }</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">  // Update ws_patient_rabies ke state terbaru (satu kali di akhir)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">  const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> latest</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> existingConsumptions.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">at</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">-</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">1</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">  await</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> repo.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">updateOrCreatePatientRabies</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(c, { patient_id: patientId, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">...</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> })</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">  // Audit log dengan pre_shift_state</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">  await</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> repo.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">createPepInsertionLog</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(c, {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    patient_id: patientId,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    inserted_by: userId,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    insertion_consumption_id: insertedConsumptionId,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    pre_shift_state: existingConsumptions.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">map</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#E36209",
		"--shiki-dark": "#FFAB70"
	})}">c</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> =&gt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> ({</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">      id: c.id, original_sequence: c.vaccine_sequence</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    }))</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  })</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}</span></span></code></pre></div><hr><h3 id="langkah-5-—-controller-endpoint-sequence-dropdown-yang-aware-pasien" tabindex="-1">Langkah 5 — Controller: Endpoint Sequence Dropdown yang Aware Pasien <a class="header-anchor" href="#langkah-5-—-controller-endpoint-sequence-dropdown-yang-aware-pasien" aria-label="Permalink to &quot;Langkah 5 — Controller: Endpoint Sequence Dropdown yang Aware Pasien&quot;">​</a></h3><p><strong>File:</strong> <code>consumption-rabies.controller.ts</code></p><p>Modifikasi endpoint sequence untuk menerima <code>identity_number</code> opsional:</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// GET /transactions/rabies-sequence?identity_number=&lt;NIK&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// Response ketika pasien ditemukan dengan last PEP = Day 3:</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">  &quot;restricted&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">true</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">  &quot;sequences&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: [</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    { </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;id&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">1</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;title&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;PEP Hari 0&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;is_insertion&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">true</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> },</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    { </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;id&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">5</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;title&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;PEP Hari 7&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;is_insertion&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">false</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> }</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  ]</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}</span></span></code></pre></div><hr><h3 id="langkah-6-—-notifikasi-stop-recalculate-setelah-shift" tabindex="-1">Langkah 6 — Notifikasi: Stop &amp; Recalculate Setelah Shift <a class="header-anchor" href="#langkah-6-—-notifikasi-stop-recalculate-setelah-shift" aria-label="Permalink to &quot;Langkah 6 — Notifikasi: Stop &amp; Recalculate Setelah Shift&quot;">​</a></h3><p><strong>File:</strong> <code>consumption-rabies.module.ts</code>, <code>consumption-rabies.repository.ts</code></p><p>Setelah shift dalam <code>doProcessPepInsertion</code>:</p><ul><li>Set <code>stop_notification = 1</code> pada rekam lama yang bergeser → cron berhenti kirim notif untuk sequence lama</li><li>Update <code>next_vaccine_date</code> pada rekam yang di-shift → cron pick-up tanggal baru</li><li>Set <code>stop_notification = 0</code> pada rekam insertion jika ada next sequence</li></ul><blockquote><p>Karena <code>patient.cron.ts</code> membaca <code>next_vaccine_date</code> secara real-time dari DB, tidak perlu mekanisme queue cancellation terpisah.</p></blockquote><hr><h3 id="langkah-7-—-return-transaction-revert-shift-logic" tabindex="-1">Langkah 7 — Return Transaction: Revert Shift Logic <a class="header-anchor" href="#langkah-7-—-return-transaction-revert-shift-logic" aria-label="Permalink to &quot;Langkah 7 — Return Transaction: Revert Shift Logic&quot;">​</a></h3><p><strong>File:</strong> <code>transaction.module.ts</code>, <code>transaction.repository.ts</code></p><p>Saat return transaction diproses:</p><ol><li>Cek apakah <code>ws_consumptions.is_pep_insertion = 1</code></li><li>Jika ya: query <code>ws_pep_insertion_logs.pre_shift_state</code> untuk daftar rekam yang pernah di-shift</li><li>Kembalikan <code>vaccine_sequence</code> ke nilai semula (dari <code>pre_shift_state</code>)</li><li>Recalculate <code>next_vaccine_date</code> untuk rekam yang di-revert</li><li>Update <code>ws_patient_rabies</code> kembali ke sequence sebelum insertion</li><li>Re-enable notifikasi (<code>stop_notification = 0</code>) jika relevan</li></ol><hr><h3 id="langkah-8-—-transaction-list-detail-badge-catatan-insertion" tabindex="-1">Langkah 8 — Transaction List &amp; Detail: Badge &amp; Catatan Insertion <a class="header-anchor" href="#langkah-8-—-transaction-list-detail-badge-catatan-insertion" aria-label="Permalink to &quot;Langkah 8 — Transaction List &amp; Detail: Badge &amp; Catatan Insertion&quot;">​</a></h3><p><strong>File:</strong> <code>transaction.repository.ts</code>, <code>detail.repository.ts</code></p><ul><li>Expose <code>is_pep_insertion</code> dalam response Transaction List</li><li>Di Transaction Detail, tambahkan <code>insertion_note</code> berisi: <em>&quot;Urutan diperbarui akibat sisipan PEP pada [tanggal]&quot;</em></li></ul><hr><h2 id="_5-rencana-implementasi-frontend" tabindex="-1">5. Rencana Implementasi Frontend <a class="header-anchor" href="#_5-rencana-implementasi-frontend" aria-label="Permalink to &quot;5. Rencana Implementasi Frontend&quot;">​</a></h2><h3 id="langkah-fe-1-—-type-definitions" tabindex="-1">Langkah FE-1 — Type Definitions <a class="header-anchor" href="#langkah-fe-1-—-type-definitions" aria-label="Permalink to &quot;Langkah FE-1 — Type Definitions&quot;">​</a></h3><p><strong>File:</strong> <code>packages/ui/src/pages/transaction/TransactionCreate/TransactionConsumption/transaction-consumption.type.ts</code></p><p>Tambahkan:</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// Response dari endpoint sequence yang restricted</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> type</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> RestrictedRabiesSequence</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#E36209",
		"--shiki-dark": "#FFAB70"
	})}">  id</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> number</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#E36209",
		"--shiki-dark": "#FFAB70"
	})}">  title</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> string</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#E36209",
		"--shiki-dark": "#FFAB70"
	})}">  is_insertion</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> boolean</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> type</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> RabiesSequenceResponse</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#E36209",
		"--shiki-dark": "#FFAB70"
	})}">  restricted</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> boolean</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#E36209",
		"--shiki-dark": "#FFAB70"
	})}">  sequences</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> RestrictedRabiesSequence</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">[]</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">} </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">|</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> RestrictedRabiesSequence</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">[] </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// fallback untuk pasien tidak ditemukan</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// Extend untuk badge di list view</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> type</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> TransactionListItem</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">  // ... existing fields ...</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#E36209",
		"--shiki-dark": "#FFAB70"
	})}">  is_pep_insertion</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">?:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> 0</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> |</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> 1</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> |</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> null</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}</span></span></code></pre></div><hr><h3 id="langkah-fe-2-—-service-update-endpoint-sequences" tabindex="-1">Langkah FE-2 — Service: Update Endpoint Sequences <a class="header-anchor" href="#langkah-fe-2-—-service-update-endpoint-sequences" aria-label="Permalink to &quot;Langkah FE-2 — Service: Update Endpoint Sequences&quot;">​</a></h3><p><strong>File:</strong> <code>transaction-consumption.service.ts</code></p><p>Modifikasi <code>getListRabiesSequence</code> untuk menerima optional <code>identity_number</code>:</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> async</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> function</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> getListRabiesSequence</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#E36209",
		"--shiki-dark": "#FFAB70"
	})}">identityNumber</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">?:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> string</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">) {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">  const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> response</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> await</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> axios.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">get</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">\`\${</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">MAIN_SERVICE</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">}/transactions/rabies-sequence\`</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    params: identityNumber </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">?</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> { identity_number: identityNumber } </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> undefined</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  })</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">  return</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> response?.data</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}</span></span></code></pre></div><hr><h3 id="langkah-fe-3-—-hook-update-usegetrabiessequences" tabindex="-1">Langkah FE-3 — Hook: Update <code>useGetRabiesSequences</code> <a class="header-anchor" href="#langkah-fe-3-—-hook-update-usegetrabiessequences" aria-label="Permalink to &quot;Langkah FE-3 — Hook: Update \`useGetRabiesSequences\`&quot;">​</a></h3><p><strong>File:</strong> <code>hooks/useGetRabiesSequences.ts</code></p><p>Hook ini perlu menerima <code>identityNumber</code> dan meneruskan ke service. Jika response <code>restricted: true</code>, store hanya menyimpan sequences yang diperbolehkan, dengan flag <code>is_insertion</code> pada PEP 0.</p><hr><h3 id="langkah-fe-4-—-hook-insertion-detection-di-useprotocolrabiesvaccine" tabindex="-1">Langkah FE-4 — Hook: Insertion Detection di <code>useProtocolRabiesVaccine</code> <a class="header-anchor" href="#langkah-fe-4-—-hook-insertion-detection-di-useprotocolrabiesvaccine" aria-label="Permalink to &quot;Langkah FE-4 — Hook: Insertion Detection di \`useProtocolRabiesVaccine\`&quot;">​</a></h3><p><strong>File:</strong> <code>hooks/useProtocolRabiesVaccine.ts</code></p><p>Tambahkan logika:</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> handleChangeSequence</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> (</span><span style="${ssrRenderStyle({
		"--shiki-light": "#E36209",
		"--shiki-dark": "#FFAB70"
	})}">selectedSeq</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> OptionType</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> &amp;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> { </span><span style="${ssrRenderStyle({
		"--shiki-light": "#E36209",
		"--shiki-dark": "#FFAB70"
	})}">is_insertion</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">?:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> boolean</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> }) </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">=&gt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">  if</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> (selectedSeq.is_insertion </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">&amp;&amp;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> historyVaccination) {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">    // Pasien sudah ada + pilih PEP 0 → trigger insertion warning</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">    setShowInsertionWarning</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">true</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  }</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">  // ... existing logic</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}</span></span></code></pre></div><hr><h3 id="langkah-fe-5-—-komponen-baru-pepinsertionconfirmationmodal" tabindex="-1">Langkah FE-5 — Komponen Baru: <code>PepInsertionConfirmationModal</code> <a class="header-anchor" href="#langkah-fe-5-—-komponen-baru-pepinsertionconfirmationmodal" aria-label="Permalink to &quot;Langkah FE-5 — Komponen Baru: \`PepInsertionConfirmationModal\`&quot;">​</a></h3><p><strong>File:</strong> Baru di <code>components/PepInsertionConfirmationModal.tsx</code></p><p>Modal yang muncul saat insertion terdeteksi:</p><ul><li>Tampilkan peringatan: &quot;Anda akan menyisipkan PEP 0 dengan tanggal lebih awal. Urutan vaksinasi pasien ini akan bergeser secara otomatis.&quot;</li><li>Ringkasan pergeseran yang akan terjadi (berdasarkan qty yang dipilih)</li><li>Tombol: <strong>Batalkan</strong> / <strong>Lanjutkan Sisipan</strong></li><li>Setelah konfirmasi → lanjutkan submit</li></ul><hr><h3 id="langkah-fe-6-—-restricted-dropdown-insertion-badge-di-protocolrabiesvaccine" tabindex="-1">Langkah FE-6 — Restricted Dropdown &amp; Insertion Badge di <code>ProtocolRabiesVaccine</code> <a class="header-anchor" href="#langkah-fe-6-—-restricted-dropdown-insertion-badge-di-protocolrabiesvaccine" aria-label="Permalink to &quot;Langkah FE-6 — Restricted Dropdown &amp; Insertion Badge di \`ProtocolRabiesVaccine\`&quot;">​</a></h3><p><strong>File:</strong> <code>components/protocols/ProtocolRabiesVaccine.tsx</code></p><ul><li>Jika sequence option punya <code>is_insertion: true</code> → tampilkan label &quot;(Sisipan)&quot; di dropdown</li><li>Jika <code>restricted: true</code> → tampilkan tooltip info &quot;Pilihan urutan dibatasi berdasarkan riwayat pasien&quot;</li></ul><hr><h3 id="langkah-fe-7-—-transaction-list-badge-detail-note" tabindex="-1">Langkah FE-7 — Transaction List Badge &amp; Detail Note <a class="header-anchor" href="#langkah-fe-7-—-transaction-list-badge-detail-note" aria-label="Permalink to &quot;Langkah FE-7 — Transaction List Badge &amp; Detail Note&quot;">​</a></h3><ul><li><strong>List view:</strong> Tampilkan chip/badge &quot;PEP Insertion&quot; pada baris transaksi dengan <code>is_pep_insertion = 1</code></li><li><strong>Detail view:</strong> Tampilkan section catatan insertion di bawah patient info: <em>&quot;Urutan diperbarui akibat sisipan PEP pada [tanggal]&quot;</em></li></ul><hr><h2 id="_6-perubahan-database" tabindex="-1">6. Perubahan Database <a class="header-anchor" href="#_6-perubahan-database" aria-label="Permalink to &quot;6. Perubahan Database&quot;">​</a></h2><table tabindex="0"><thead><tr><th>Tabel</th><th>Perubahan</th><th>Tipe</th><th>Default</th><th>Tujuan</th></tr></thead><tbody><tr><td><code>ws_consumptions</code></td><td>ADD COLUMN <code>is_pep_insertion</code></td><td><code>tinyint(1)</code></td><td><code>NULL</code></td><td>Flag insertion — digunakan di List &amp; Detail view dan Return logic</td></tr><tr><td><code>ws_pep_insertion_logs</code> <em>(baru)</em></td><td>CREATE TABLE</td><td>—</td><td>—</td><td>Audit trail: <code>patient_id</code>, <code>inserted_by</code>, <code>inserted_at</code>, <code>insertion_consumption_id</code>, <code>pre_shift_state</code> (JSON)</td></tr></tbody></table><blockquote><p><strong>Zero-downtime:</strong> Kedua migration di atas bersifat additive. Tidak ada perubahan pada kolom existing. Tidak memerlukan backfill data lama.</p></blockquote><hr><h2 id="_7-risiko-implementasi" tabindex="-1">7. Risiko Implementasi <a class="header-anchor" href="#_7-risiko-implementasi" aria-label="Permalink to &quot;7. Risiko Implementasi&quot;">​</a></h2><table tabindex="0"><thead><tr><th>Risiko</th><th>Level</th><th>Mitigasi</th></tr></thead><tbody><tr><td>Shift logic tidak atomik — crash di tengah UPDATE menyebabkan data inkonsisten</td><td><strong>Tinggi</strong></td><td>Seluruh operasi (INSERT + semua UPDATE shift) dalam satu database transaction via <code>c.var.trx</code>.</td></tr><tr><td>Logika <code>other_sequences</code> tumpang tindih dengan insertion detection di middleware</td><td><strong>Tinggi</strong></td><td>Pisahkan path secara eksplisit: insertion (PEP 0 saat pasien sudah ada) dan other_sequences (gap historis untuk pasien baru) adalah dua path berbeda dengan kondisi mutually exclusive.</td></tr><tr><td>Shift target sequence salah karena Zagreb vs Essen punya chain berbeda</td><td><strong>Tinggi</strong></td><td><code>getSequenceAfterShift()</code> harus memperhitungkan <code>vaccine_method</code> saat traversal chain.</td></tr><tr><td>Active duration validation memblokir insertion karena tanggal insertion lebih awal dari <code>last_vaccine_at</code></td><td><strong>Sedang</strong></td><td>Bypass active_duration check saat insertion terdeteksi (<code>__is_insertion = true</code>). Dokumentasikan kenapa bypass ini aman.</td></tr><tr><td>Notifikasi lama tidak berhenti setelah shift</td><td><strong>Sedang</strong></td><td>Set <code>stop_notification = 1</code> pada rekam lama sebelum shift diselesaikan.</td></tr><tr><td>Return transaction gagal revert karena audit log tidak menyimpan original sequence</td><td><strong>Sedang</strong></td><td><code>ws_pep_insertion_logs.pre_shift_state</code> harus menyimpan original sequence ID per <code>consumption_id</code> sebelum diubah.</td></tr><tr><td>FE: Actual date field tidak diisi user sebelum NIK lookup, insertion date validation terjadi terlambat</td><td><strong>Sedang</strong></td><td>Validasi actual_date field wajib diisi sebelum form submission; tampilkan error inline jika tanggal insertion ≥ tanggal existing.</td></tr><tr><td>FE: Restricted sequences tidak di-refresh jika user ganti NIK setelah sequence sudah dipilih</td><td><strong>Rendah</strong></td><td>Reset field <code>vaccine_sequence</code> setiap kali NIK berubah di form.</td></tr></tbody></table><hr><h2 id="_8-yang-tidak-perlu-diubah" tabindex="-1">8. Yang Tidak Perlu Diubah <a class="header-anchor" href="#_8-yang-tidak-perlu-diubah" aria-label="Permalink to &quot;8. Yang Tidak Perlu Diubah&quot;">​</a></h2><ul><li><strong>Dengue consumption flow</strong> — PRD eksplisit menyatakan PEP Insertion tidak berlaku untuk Dengue</li><li><strong>PrEP dan Booster flow</strong> — Tidak terdampak</li><li><strong>Non-NIK patients</strong> — Insertion hanya berlaku saat pasien ditemukan; Non-NIK = tidak ditemukan = flow biasa</li><li><strong>Schema <code>rabies_vaccine_rules</code></strong> — Tidak perlu perubahan; chain traversal sudah cukup</li><li><strong>CRON job di <code>patient.cron.ts</code></strong> — Cukup update <code>next_vaccine_date</code> dan <code>stop_notification</code> di DB, cron akan menyesuaikan otomatis</li></ul><hr><h2 id="referensi-file" tabindex="-1">Referensi File <a class="header-anchor" href="#referensi-file" aria-label="Permalink to &quot;Referensi File&quot;">​</a></h2><h3 id="backend" tabindex="-1">Backend <a class="header-anchor" href="#backend" aria-label="Permalink to &quot;Backend&quot;">​</a></h3><table tabindex="0"><thead><tr><th>File</th><th>Relevansi</th></tr></thead><tbody><tr><td><code>apps/main/src/modules/transaction/consumption-rabies/consumption-rabies.middleware.ts</code></td><td>Validasi utama — insertion detection &amp; date validation</td></tr><tr><td><code>apps/main/src/modules/transaction/consumption-rabies/consumption-rabies.module.ts</code></td><td>Shift logic — <code>doProcessPepInsertion()</code></td></tr><tr><td><code>apps/main/src/modules/transaction/consumption-rabies/consumption-rabies.repository.ts</code></td><td>Query methods baru untuk insertion</td></tr><tr><td><code>apps/main/src/modules/transaction/consumption-rabies/consumption-rabies.controller.ts</code></td><td>Endpoint sequence dropdown aware-pasien</td></tr><tr><td><code>apps/main/src/modules/transaction/transaction.module.ts</code></td><td>Return transaction revert logic</td></tr><tr><td><code>apps/main/src/modules/transaction/transaction.repository.ts</code></td><td>Query return + revert</td></tr><tr><td><code>apps/main/src/modules/transaction/detail/detail.repository.ts</code></td><td>Transaction detail — insertion note</td></tr><tr><td><code>apps/main/src/modules/transaction/patient/patient.cron.ts</code></td><td>Tidak diubah — cukup update DB</td></tr><tr><td><code>apps/main/src/common/infrastructure/database/migrations/</code></td><td>Migration baru: <code>is_pep_insertion</code>, <code>ws_pep_insertion_logs</code></td></tr><tr><td><code>apps/main/src/common/infrastructure/database/types/db.d.ts</code></td><td>Update types setelah migration</td></tr></tbody></table><h3 id="frontend" tabindex="-1">Frontend <a class="header-anchor" href="#frontend" aria-label="Permalink to &quot;Frontend&quot;">​</a></h3><table tabindex="0"><thead><tr><th>File</th><th>Relevansi</th></tr></thead><tbody><tr><td><code>packages/ui/src/pages/transaction/TransactionCreate/hooks/useGetRabiesSequences.ts</code></td><td>Update: terima <code>identityNumber</code>, teruskan ke service</td></tr><tr><td><code>packages/ui/src/pages/transaction/TransactionCreate/TransactionConsumption/hooks/useProtocolRabiesVaccine.ts</code></td><td>Update: insertion detection logic</td></tr><tr><td><code>packages/ui/src/pages/transaction/TransactionCreate/TransactionConsumption/components/protocols/ProtocolRabiesVaccine.tsx</code></td><td>Update: restricted dropdown + insertion badge</td></tr><tr><td><code>packages/ui/src/pages/transaction/TransactionCreate/TransactionConsumption/transaction-consumption.service.ts</code></td><td>Update: <code>getListRabiesSequence</code> terima optional <code>identity_number</code></td></tr><tr><td><code>packages/ui/src/pages/transaction/TransactionCreate/TransactionConsumption/transaction-consumption.type.ts</code></td><td>Update: tambah <code>RestrictedRabiesSequence</code>, <code>is_pep_insertion</code></td></tr><tr><td><code>packages/ui/src/pages/transaction/TransactionCreate/TransactionConsumption/components/PepInsertionConfirmationModal.tsx</code></td><td><strong>BARU</strong> — modal konfirmasi insertion</td></tr><tr><td>Transaction list page / table component</td><td>Update: tampilkan badge <code>is_pep_insertion</code></td></tr><tr><td>Transaction detail page</td><td>Update: tampilkan insertion note</td></tr></tbody></table></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("architecture/sad-pep-insertion.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var sad_pep_insertion_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, sad_pep_insertion_default as default };
