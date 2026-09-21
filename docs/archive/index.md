# Archive

Dokumen di folder ini **tidak lagi menggambarkan kode manapun di repo ini**. Disimpan
sebagai rujukan historis — jangan dipakai sebagai acuan implementasi.

Tiga hal yang membuat dokumen-dokumen ini usang:

| Penyebab | Dokumen |
|---|---|
| `apps/sync-service` dihapus | [Timeout troubleshooting](./timeout-troubleshooting-sync-service.md), [migrasi DB sync-service](./database-migrations-sync-service.md) |
| `apps/3.0/*` (SMILE 3.0, Sequelize) dihapus | [Database models](./database-models-sequelize.md), [Database models — transaction](./database-models-transaction-sequelize.md), [processDataColdstorage](./process-data-coldstorage-analysis.md), [Count Transaction API](./count-transaction-api.md), [Dashboard Routine API](./dashboard-routine-api.md), [Biofarma order v3](./biofarma-order-v3/biofarma-order-v3-to-v5.id.md) |
| Modul Indonesia-only dicabut | [Monev API](./monev-api.md), [SIHA/SITB](./siha-sitb/siha-sitb-api-v1.0.md) |

Selain itu: [audit dokumentasi 2025](./documentation-audit-2025.md) digantikan oleh konsolidasi
`adr/` → `docs/`, dan [papan status service](./service-statuses.md) adalah snapshot manual
tanpa sumber kebenaran.

Jalur SIHA/SITB masih punya sisa yang **aktif** — routing rules di
`apps/openhim-mediators/rule-router/db-scripts/`. Lihat [interop layer](../architecture/interop-layer/index.md).
