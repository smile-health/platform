# Master Pemeriksaan Module

Module untuk mengelola Master Pemeriksaan (Inspection Master) yang berisi informasi tentang pemeriksaan material, template, parameter, sasaran, dan metode.

## Struktur Data

Master Pemeriksaan memiliki field-field berikut:

- **Nama Material** (String, Required): Nama material yang akan diperiksa
- **Pilihan Template** (Multiple Select, Required): Multiple template pemeriksaan dari master template
- **Jenis Pemeriksaan** (Single Select, Required): Jenis pemeriksaan dari master jenis pemeriksaan
- **Parameter** (Multiple Select, Required): Multiple parameter pemeriksaan dari master parameter
- **Sasaran** (Multiple Select, Required): Multiple sasaran pemeriksaan dari master sasaran
- **Metode** (Single Select, Required): Metode pemeriksaan dari master metode

## Fitur

- ✅ List/Table dengan pagination
- ✅ Create form dengan validasi
- ✅ Edit form dengan pre-filled data
- ✅ Detail view
- ✅ Dummy data untuk development
- ✅ Internationalization (EN/ID)
- ✅ Multiple select untuk Template, Parameter, dan Sasaran
- ✅ Single select untuk Jenis Pemeriksaan dan Metode
- ✅ Form validation dengan Yup

## Penggunaan

### 1. Import Pages

```tsx
// List Page
import { MasterPemeriksaanListPage } from '@repo/ui/pages/master-pemeriksaan'

export default function Page() {
  return <MasterPemeriksaanListPage />
}
```

```tsx
// Create Page
import { MasterPemeriksaanCreatePage } from '@repo/ui/pages/master-pemeriksaan'

export default function Page() {
  return <MasterPemeriksaanCreatePage />
}
```

```tsx
// Edit Page
import { MasterPemeriksaanEditPage } from '@repo/ui/pages/master-pemeriksaan'

export default function Page({ params }: { params: { id: string } }) {
  return <MasterPemeriksaanEditPage id={parseInt(params.id)} />
}
```

```tsx
// Detail Page
import { MasterPemeriksaanDetailPage } from '@repo/ui/pages/master-pemeriksaan'

export default function Page({ params }: { params: { id: string } }) {
  return <MasterPemeriksaanDetailPage id={parseInt(params.id)} />
}
```

### 2. Import Components Individually

Jika Anda ingin custom layout:

```tsx
import {
  MasterPemeriksaanTable,
  MasterPemeriksaanForm,
} from '@repo/ui/pages/master-pemeriksaan'

export default function CustomPage() {
  return (
    <div>
      <h1>Custom Master Pemeriksaan</h1>
      <MasterPemeriksaanTable />
    </div>
  )
}
```

### 3. Setup Translations

Add the locale files to your i18next configuration:

```typescript
import {
  masterPemeriksaanLocaleId,
  masterPemeriksaanLocaleEn,
} from '@repo/ui/pages/master-pemeriksaan'

i18n.use(initReactI18next).init({
  resources: {
    en: {
      'master-pemeriksaan': masterPemeriksaanLocaleEn,
      // ... other namespaces
    },
    id: {
      'master-pemeriksaan': masterPemeriksaanLocaleId,
      // ... other namespaces
    },
  },
  // ... other configs
})
```

## Struktur Folder

```
master-pemeriksaan/
├── components/
│   ├── Form/
│   │   └── MasterPemeriksaanFormMainInfo.tsx  # Form fields
│   ├── MasterPemeriksaanForm.tsx              # Form wrapper with validation
│   └── MasterPemeriksaanTable.tsx             # Data table
├── hooks/
│   └── useMasterPemeriksaanTable.ts           # Table hook with columns
├── locales/
│   ├── en.json                                # English translations
│   └── id.json                                # Indonesian translations
├── schema/
│   ├── MasterPemeriksaanSchemaForm.ts         # Form validation schema
│   └── MasterPemeriksaanSchemaList.ts         # List filter schema
├── utils/
│   ├── constants.ts                           # Permission constants
│   └── dummyData.ts                           # Dummy data for development
├── MasterPemeriksaanListPage.tsx              # List page component
├── MasterPemeriksaanCreatePage.tsx            # Create page component
├── MasterPemeriksaanEditPage.tsx              # Edit page component
├── MasterPemeriksaanDetailPage.tsx            # Detail page component
├── index.ts                                   # Main exports
└── README.md                                  # This file
```

## Dummy Data

Module ini menggunakan dummy data untuk development. Data tersedia di:

```typescript
import {
  DUMMY_TEMPLATES,
  DUMMY_JENIS_PEMERIKSAAN,
  DUMMY_PARAMETERS,
  DUMMY_SASARAN,
  DUMMY_METODE,
  DUMMY_MASTER_PEMERIKSAAN,
} from '@repo/ui/pages/master-pemeriksaan'
```

### Contoh Data:

- **Templates**: Template Pemeriksaan Fisik, Kimia, Mikrobiologi, Farmakologi
- **Jenis Pemeriksaan**: Kualitas, Kuantitas, Keamanan, Sterilitas
- **Parameters**: pH Level, Suhu, Kelembaban, Kadar Air, Kontaminasi, Kemurnian, Stabilitas, Kelarutan
- **Sasaran**: Obat Tablet, Sirup, Injeksi, Alat Kesehatan Steril/Non-Steril, Bahan Baku, Vaksin
- **Metode**: Visual, Spektrofotometri, Kromatografi, Titrasi, Mikrobiologi

## Permissions

Permission keys tersedia di `MASTER_PEMERIKSAAN_PERMISSION`:

```typescript
import { MASTER_PEMERIKSAAN_PERMISSION } from '@repo/ui/pages/master-pemeriksaan'

// Usage
const hasViewPermission = usePermission(MASTER_PEMERIKSAAN_PERMISSION.VIEW)
const hasCreatePermission = usePermission(MASTER_PEMERIKSAAN_PERMISSION.CREATE)
const hasUpdatePermission = usePermission(MASTER_PEMERIKSAAN_PERMISSION.UPDATE)
const hasDeletePermission = usePermission(MASTER_PEMERIKSAAN_PERMISSION.DELETE)
```

## Next Steps

Untuk production:

1. **Replace Dummy Data**: Ganti `DUMMY_*` data dengan API calls yang sebenarnya
2. **Add API Integration**: Implement service functions di `packages/ui/src/services/`
3. **Update Hooks**: Modify `useMasterPemeriksaanTable` untuk menggunakan React Query
4. **Add Filters**: Implement filter functionality menggunakan `masterPemeriksaanFilterSchema`
5. **Add Permissions**: Implement permission checks pada actions
6. **Add Loading States**: Add proper loading states untuk API calls
7. **Error Handling**: Add comprehensive error handling

## Type Definitions

```typescript
type MasterPemeriksaan = {
  id: number
  nama_material: string
  template_ids: number[]
  templates: string[]
  jenis_pemeriksaan_id: number
  jenis_pemeriksaan_name: string
  parameter_ids: number[]
  parameters: string[]
  sasaran_ids: number[]
  sasarans: string[]
  metode_id: number
  metode_name: string
  created_at: string
  updated_at: string
}

type MasterPemeriksaanFormType = {
  nama_material: string
  template_ids: number[]
  jenis_pemeriksaan_id: number | null
  parameter_ids: number[]
  sasaran_ids: number[]
  metode_id: number | null
}
```

## Contributing

Saat menambahkan fitur baru:

1. Update schema validation jika ada perubahan field
2. Update dummy data untuk testing
3. Update translations di en.json dan id.json
4. Update README dengan perubahan yang dilakukan
