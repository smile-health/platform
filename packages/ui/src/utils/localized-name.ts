/**
 * Nama program dan nama role berasal dari data backend (kolom `workspaces.name`
 * dan `roles.name`), bukan teks UI, jadi tidak ikut kamus i18next. Untuk bahasa
 * yang belum didukung backend (saat ini `ar`) nama diterjemahkan di klien.
 * Pencarian memakai `key` program dulu, lalu label yang dinormalisasi. Kalau
 * tidak ada terjemahan, nama asli dikembalikan apa adanya.
 *
 * Hanya untuk tampilan. Jangan dipakai pada nilai form yang dikirim balik ke API.
 */

type NameDictionary = {
  byKey?: Record<string, string>
  byLabel: Record<string, string>
}

const PROGRAM_NAMES: Record<string, NameDictionary> = {
  ar: {
    byKey: {
      waste_management: 'إدارة النفايات',
      immunization_beneficiaries: 'تحصين المستفيدين',
      immunization: 'التحصين',
      malaria: 'الملاريا',
      tb: 'السل',
      hiv: 'فيروس نقص المناعة البشرية',
      logistic: 'الأدوية الأساسية',
    },
    byLabel: {
      waste_management: 'إدارة النفايات',
      immunization: 'تحصين المستفيدين',
      imunisasi: 'التحصين',
      malaria: 'الملاريا',
      tb: 'السل',
      tuberculosis: 'السل',
      tuberkulosis: 'السل',
      hiv: 'فيروس نقص المناعة البشرية',
      essential_medichines: 'الأدوية الأساسية',
      essential_medicines: 'الأدوية الأساسية',
      logistic: 'الأدوية الأساسية',
      global: 'عام',
    },
  },
}

const ROLE_NAMES: Record<string, NameDictionary> = {
  ar: {
    byLabel: {
      super_admin: 'المسؤول العام',
      superadmin: 'المسؤول العام',
      admin: 'مسؤول',
      manager: 'مدير',
      operator: 'مشغّل',
      third_party: 'طرف ثالث',
      vendor_iot: 'مورّد إنترنت الأشياء',
      manufaktur: 'مُصنِّع',
      manufacture: 'مُصنِّع',
      manufacturer: 'مُصنِّع',
      operator_covid: 'مشغّل كوفيد',
      distributor_covid: 'موزّع كوفيد',
      manager_covid: 'مدير كوفيد',
      contact_center: 'مركز الاتصال',
      admin_so: 'مسؤول الجرد',
      // Role WMS (waste management)
      sanitarian: 'مفتش الصحة البيئية',
      operator_pengangkut: 'مشغّل النقل',
      operator_transporter: 'مشغّل النقل',
      operator_pengolah: 'مشغّل المعالجة',
      operator_treatment: 'مشغّل المعالجة',
      operator_penimbus: 'مشغّل الطمر',
      operator_landfill: 'مشغّل الطمر',
      operator_pemanfaat: 'مشغّل إعادة التدوير',
      operator_recycler: 'مشغّل إعادة التدوير',
      operator_pengangkut_khusus: 'مشغّل النقل المتخصص',
      operator_specialized_transport: 'مشغّل النقل المتخصص',
      pengangkut_limbah_lokal: 'ناقل النفايات المحلي',
      operator_local_transporter: 'ناقل النفايات المحلي',
      operator_bank_sampah: 'مشغّل بنك النفايات',
      operator_waste_bank: 'مشغّل بنك النفايات',
    },
  },
}

export const normalizeLabel = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')

const baseLanguage = (language?: string | null) =>
  (language ?? '').toLowerCase().split('-')[0] ?? ''

type ProgramLike = { key?: string | null; name?: string | null }

export function getLocalizedProgramName(
  program: ProgramLike | string | null | undefined,
  language?: string | null
): string {
  if (!program) return ''
  const name = typeof program === 'string' ? program : (program.name ?? '')
  const key = typeof program === 'string' ? undefined : program.key
  const dictionary = PROGRAM_NAMES[baseLanguage(language)]
  if (!dictionary) return name

  if (key && dictionary.byKey?.[key]) return dictionary.byKey[key]
  return dictionary.byLabel[normalizeLabel(name)] ?? name
}

export function getLocalizedRoleName(
  roleLabel: string | null | undefined,
  language?: string | null
): string {
  if (!roleLabel) return roleLabel ?? ''
  const dictionary = ROLE_NAMES[baseLanguage(language)]
  if (!dictionary) return roleLabel
  return dictionary.byLabel[normalizeLabel(roleLabel)] ?? roleLabel
}

/**
 * Label statis yang ditulis langsung di kode (header kolom `'No.'`, label
 * filter `'Material'`, dst.), bukan lewat i18next. Dipakai terpusat di
 * DataTable dan Filter supaya ratusan definisi kolom tidak perlu diubah satu
 * per satu. Akhiran titik dua (`'Status :'`) dipertahankan.
 */
const STATIC_LABELS: Record<string, Record<string, string>> = {
  ar: {
    no: 'رقم',
    si_no: 'رقم',
    status: 'الحالة',
    item: 'العنصر',
    min: 'الحد الأدنى',
    max: 'الحد الأقصى',
    total: 'الإجمالي',
    program: 'البرنامج',
    material: 'المادة',
    batch: 'الدفعة',
    tag: 'الوسم',
    name: 'الاسم',
    phone: 'الهاتف',
    email: 'البريد الإلكتروني',
    action: 'إجراء',
    quantity: 'الكمية',
    qty: 'الكمية',
    entity: 'الكيان',
    activity: 'النشاط',
    type: 'النوع',
    date: 'التاريخ',
    data: 'بيانات',
  },
}

export function getLocalizedStaticLabel<T>(
  label: T,
  language?: string | null
): T | string {
  if (typeof label !== 'string' || !label) return label
  const dictionary = STATIC_LABELS[baseLanguage(language)]
  if (!dictionary) return label
  const match = /^(.*?)(\s*:\s*)?$/.exec(label)
  const core = match?.[1] ?? label
  const suffix = match?.[2] ? ' :' : ''
  const translated = dictionary[normalizeLabel(core)]
  return translated ? `${translated}${suffix}` : label
}
