import {
  getLocalizedProgramName,
  getLocalizedRoleName,
  normalizeLabel,
} from '#utils/localized-name'

describe('normalizeLabel', () => {
  it('lowercases and joins words with underscore', () => {
    expect(normalizeLabel('  Super Admin ')).toBe('super_admin')
    expect(normalizeLabel('ESSENTIAL MEDICHINES')).toBe('essential_medichines')
    expect(normalizeLabel('Vendor-IoT')).toBe('vendor_iot')
  })
})

describe('getLocalizedProgramName', () => {
  it('translates by program key first', () => {
    expect(
      getLocalizedProgramName({ key: 'immunization', name: 'IMUNISASI' }, 'ar')
    ).toBe('التحصين')
    expect(
      getLocalizedProgramName(
        { key: 'immunization_beneficiaries', name: 'IMMUNIZATION' },
        'ar'
      )
    ).toBe('تحصين المستفيدين')
  })

  it('falls back to the label when the key is missing or unknown', () => {
    expect(getLocalizedProgramName({ name: 'MALARIA' }, 'ar')).toBe('الملاريا')
    expect(
      getLocalizedProgramName({ key: 'custom', name: 'Essential Medichines' }, 'ar')
    ).toBe('الأدوية الأساسية')
    expect(getLocalizedProgramName('WASTE MANAGEMENT', 'ar')).toBe(
      'إدارة النفايات'
    )
  })

  it('accepts regional language codes', () => {
    expect(getLocalizedProgramName({ key: 'tb', name: 'TB' }, 'ar-SA')).toBe(
      'السل'
    )
  })

  it('returns the original name for unknown programs', () => {
    expect(getLocalizedProgramName({ key: 'x', name: 'NEW PROGRAM' }, 'ar')).toBe(
      'NEW PROGRAM'
    )
  })

  it('returns the original name for languages without a dictionary', () => {
    expect(getLocalizedProgramName({ key: 'tb', name: 'TB' }, 'en')).toBe('TB')
    expect(getLocalizedProgramName({ key: 'tb', name: 'TB' }, 'id')).toBe('TB')
    expect(getLocalizedProgramName({ key: 'tb', name: 'TB' }, undefined)).toBe(
      'TB'
    )
  })

  it('handles empty input', () => {
    expect(getLocalizedProgramName(null, 'ar')).toBe('')
    expect(getLocalizedProgramName(undefined, 'ar')).toBe('')
    expect(getLocalizedProgramName({ key: null, name: null }, 'ar')).toBe('')
  })
})

describe('getLocalizedRoleName', () => {
  it('translates SMILE and WMS role labels', () => {
    expect(getLocalizedRoleName('Super Admin', 'ar')).toBe('المسؤول العام')
    expect(getLocalizedRoleName('SUPERADMIN', 'ar')).toBe('المسؤول العام')
    expect(getLocalizedRoleName('Manufaktur', 'ar')).toBe('مُصنِّع')
    expect(getLocalizedRoleName('Operator Pengangkut', 'ar')).toBe(
      'مشغّل النقل'
    )
    expect(getLocalizedRoleName('Operator Transporter', 'ar')).toBe(
      'مشغّل النقل'
    )
  })

  it('keeps unknown roles and other languages unchanged', () => {
    expect(getLocalizedRoleName('Auditor', 'ar')).toBe('Auditor')
    expect(getLocalizedRoleName('Manager', 'en')).toBe('Manager')
  })

  it('handles empty input', () => {
    expect(getLocalizedRoleName(null, 'ar')).toBe('')
    expect(getLocalizedRoleName(undefined, 'ar')).toBe('')
    expect(getLocalizedRoleName('', 'ar')).toBe('')
  })
})
