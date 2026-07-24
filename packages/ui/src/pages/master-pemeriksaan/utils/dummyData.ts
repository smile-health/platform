// Dummy data for dropdowns
export const DUMMY_TEMPLATES = [
  { value: 1, label: 'Template Pemeriksaan Fisik' },
  { value: 2, label: 'Template Pemeriksaan Kimia' },
  { value: 3, label: 'Template Pemeriksaan Mikrobiologi' },
  { value: 4, label: 'Template Pemeriksaan Farmakologi' },
]

export const DUMMY_JENIS_PEMERIKSAAN = [
  { value: 1, label: 'Kualitas' },
  { value: 2, label: 'Kuantitas' },
  { value: 3, label: 'Keamanan' },
  { value: 4, label: 'Sterilitas' },
]

export const DUMMY_PARAMETERS = [
  { value: 1, label: 'pH Level' },
  { value: 2, label: 'Suhu' },
  { value: 3, label: 'Kelembaban' },
  { value: 4, label: 'Kadar Air' },
  { value: 5, label: 'Kontaminasi' },
  { value: 6, label: 'Kemurnian' },
  { value: 7, label: 'Stabilitas' },
  { value: 8, label: 'Kelarutan' },
]

export const DUMMY_SASARAN = [
  { value: 1, label: 'Obat Tablet' },
  { value: 2, label: 'Obat Sirup' },
  { value: 3, label: 'Obat Injeksi' },
  { value: 4, label: 'Alat Kesehatan Steril' },
  { value: 5, label: 'Alat Kesehatan Non-Steril' },
  { value: 6, label: 'Bahan Baku Obat' },
  { value: 7, label: 'Vaksin' },
]

export const DUMMY_METODE = [
  { value: 1, label: 'Visual' },
  { value: 2, label: 'Spektrofotometri' },
  { value: 3, label: 'Kromatografi' },
  { value: 4, label: 'Titrasi' },
  { value: 5, label: 'Mikrobiologi' },
]

// Dummy table data
export const DUMMY_MASTER_PEMERIKSAAN = [
  {
    id: 1,
    nama_material: 'Paracetamol 500mg',
    template_ids: [1, 2],
    templates: ['Template Pemeriksaan Fisik', 'Template Pemeriksaan Kimia'],
    jenis_pemeriksaan_id: 1,
    jenis_pemeriksaan_name: 'Kualitas',
    parameter_ids: [1, 6, 7],
    parameters: ['pH Level', 'Kemurnian', 'Stabilitas'],
    sasaran_ids: [1],
    sasarans: ['Obat Tablet'],
    metode_id: 2,
    metode_name: 'Spektrofotometri',
    created_at: '2025-01-15T10:00:00',
    updated_at: '2025-01-15T10:00:00',
  },
  {
    id: 2,
    nama_material: 'Amoxicillin Syrup',
    template_ids: [3],
    templates: ['Template Pemeriksaan Mikrobiologi'],
    jenis_pemeriksaan_id: 4,
    jenis_pemeriksaan_name: 'Sterilitas',
    parameter_ids: [5, 6],
    parameters: ['Kontaminasi', 'Kemurnian'],
    sasaran_ids: [2, 7],
    sasarans: ['Obat Sirup', 'Vaksin'],
    metode_id: 5,
    metode_name: 'Mikrobiologi',
    created_at: '2025-01-16T11:30:00',
    updated_at: '2025-01-16T11:30:00',
  },
  {
    id: 3,
    nama_material: 'Insulin Injection',
    template_ids: [4, 2],
    templates: ['Template Pemeriksaan Farmakologi', 'Template Pemeriksaan Kimia'],
    jenis_pemeriksaan_id: 3,
    jenis_pemeriksaan_name: 'Keamanan',
    parameter_ids: [1, 2, 6, 7],
    parameters: ['pH Level', 'Suhu', 'Kemurnian', 'Stabilitas'],
    sasaran_ids: [3],
    sasarans: ['Obat Injeksi'],
    metode_id: 3,
    metode_name: 'Kromatografi',
    created_at: '2025-01-17T09:15:00',
    updated_at: '2025-01-17T09:15:00',
  },
  {
    id: 4,
    nama_material: 'Surgical Mask',
    template_ids: [1],
    templates: ['Template Pemeriksaan Fisik'],
    jenis_pemeriksaan_id: 1,
    jenis_pemeriksaan_name: 'Kualitas',
    parameter_ids: [3, 4],
    parameters: ['Kelembaban', 'Kadar Air'],
    sasaran_ids: [5],
    sasarans: ['Alat Kesehatan Non-Steril'],
    metode_id: 1,
    metode_name: 'Visual',
    created_at: '2025-01-18T14:00:00',
    updated_at: '2025-01-18T14:00:00',
  },
  {
    id: 5,
    nama_material: 'Syringe 3ml',
    template_ids: [2, 3],
    templates: ['Template Pemeriksaan Kimia', 'Template Pemeriksaan Mikrobiologi'],
    jenis_pemeriksaan_id: 4,
    jenis_pemeriksaan_name: 'Sterilitas',
    parameter_ids: [5],
    parameters: ['Kontaminasi'],
    sasaran_ids: [4],
    sasarans: ['Alat Kesehatan Steril'],
    metode_id: 5,
    metode_name: 'Mikrobiologi',
    created_at: '2025-01-19T08:45:00',
    updated_at: '2025-01-19T08:45:00',
  },
]

// Types
export type MasterPemeriksaan = {
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
