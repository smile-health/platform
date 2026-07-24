export const entityTypeList = [
  { value: 1, label: 'Provinsi' },
  { value: 2, label: 'Kota' },
  { value: 3, label: 'Faskes' },
  { value: 4, label: 'PKC' },
  { value: 5, label: 'Penyedia Utama' },
  { value: 6, label: 'Third Party' },
]

export enum ENTITY_TYPE {
  PROVINSI = 1,
  KOTA = 2,
  FASKES = 3,
  VACCINE_CENTER = 4,
  PRIMARY_VENDOR = 5,
  TNIPOLRI = 30,
  BIOFARMA = 97,
  GUDANG_VAKSIN = 98,
}

export enum ENTITY_TAG {
  PRIMARY_VENDOR = 1,
  PRODUSEN = 2,
  KEMENTRIAN_LEMbAGA = 3,
  KESEHATAN_PELABUHAN = 4,
  DINKES_PROVINSI = 5,
  DINKES_KABKO = 6,
  PUSKESMAS = 9,
  DALAM_GEDUNG = 10,
  RUMAH_SAKIT = 11,
  KLINIK = 12,
}
