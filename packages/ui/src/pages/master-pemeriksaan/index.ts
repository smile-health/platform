// Components
export { default as MasterPemeriksaanTable } from './components/MasterPemeriksaanTable'
export { default as MasterPemeriksaanForm } from './components/MasterPemeriksaanForm'
export { default as MasterPemeriksaanFormMainInfo } from './components/Form/MasterPemeriksaanFormMainInfo'

// Hooks
export { useMasterPemeriksaanTable } from './hooks/useMasterPemeriksaanTable'

// Schema
export {
  masterPemeriksaanFormSchema,
  type MasterPemeriksaanFormType,
} from './schema/MasterPemeriksaanSchemaForm'
export { masterPemeriksaanFilterSchema } from './schema/MasterPemeriksaanSchemaList'

// Utils
export {
  DUMMY_TEMPLATES,
  DUMMY_JENIS_PEMERIKSAAN,
  DUMMY_PARAMETERS,
  DUMMY_SASARAN,
  DUMMY_METODE,
  DUMMY_MASTER_PEMERIKSAAN,
  type MasterPemeriksaan,
} from './utils/dummyData'
export { MASTER_PEMERIKSAAN_PERMISSION } from './utils/constants'

// Pages
export { default as MasterPemeriksaanListPage } from './MasterPemeriksaanListPage'
export { default as MasterPemeriksaanCreatePage } from './MasterPemeriksaanCreatePage'
export { default as MasterPemeriksaanEditPage } from './MasterPemeriksaanEditPage'
export { default as MasterPemeriksaanDetailPage } from './MasterPemeriksaanDetailPage'

// Locales
export { default as masterPemeriksaanLocaleId } from './locales/id.json'
export { default as masterPemeriksaanLocaleEn } from './locales/en.json'
