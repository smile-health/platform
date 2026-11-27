import dayjs from 'dayjs'
import arLocale from 'dayjs/locale/ar'

// Nama bulan/hari bahasa Arab untuk dayjs. Locale `ar` bawaan dayjs mengubah
// angka ke digit Arab-Hindi lewat preparse/postformat, sedangkan BA-949
// memutuskan digit Latin, jadi dua fungsi itu dibuang sebelum didaftarkan.
// Dipanggil sekali dari locales/i18n.ts.
const {
  preparse: _preparse,
  postformat: _postformat,
  ...arLatinDigits
} = arLocale as typeof arLocale & {
  preparse?: unknown
  postformat?: unknown
}

export function registerDayjsLocales() {
  dayjs.locale({ ...arLatinDigits, name: 'ar' }, undefined, true)
}

registerDayjsLocales()
