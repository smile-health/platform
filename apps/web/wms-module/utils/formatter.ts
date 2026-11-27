import i18n from '@/locales/i18n';
import dayjs from 'dayjs';
import { toIntlLocale } from '@repo/ui/utils/locale';

export function getCurrencySymbol() {
  return i18n.language === 'id' ? 'Rp' : '';
}

export function numberFormatter(value: number | undefined | null) {
  if (value === undefined) return '-';
  return value ? new Intl.NumberFormat(toIntlLocale(i18n.language)).format(value) : '0';
}


export function formatDate(date: string, format = 'DD/MM/YYYY') {
  if (!date) return '-';
  return dayjs(date).isValid() ? dayjs(date).format(format) : '-';
}