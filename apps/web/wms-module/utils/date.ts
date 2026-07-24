import { CalendarDate, DateValue, parseDate } from '@internationalized/date';
import dayjs from 'dayjs';

export function dateValueToDate(
  value: DateValue | null | undefined
): Date | null {
  if (!value) return null;
  return new Date(value.toString());
}

export function dateToDateValue(
  date: Date | null | undefined
): DateValue | null {
  if (!date) return null;
  const isoString = dayjs(date).format('YYYY-MM-DD');
  return parseDate(isoString);
}

export const parseDateTime = (
  date?: string,
  format: string = 'DD/MM/YYYY HH:mm',
  lang: string = 'en',
  isWithoutUTC?: boolean
) => {
  if (!date) return '-';

  if (dayjs(date).isValid()) {
    if (isWithoutUTC) {
      const offsetInMinutes = new Date().getTimezoneOffset(); // returns in minutes
      const offsetInHours = -offsetInMinutes / 60;

      date = dayjs(date).add(offsetInHours, 'hour').locale(lang).format(format);
    }

    date = dayjs(date).locale(lang).format(format);
  }

  return date;
};

export const isValidDate = (date: any) => dayjs(date).isValid();

export const parseValidDate = (
  value: string | undefined | null = null
): CalendarDate | null => {
  return value && isValidDate(value) ? parseDate(value) : null;
};

export const handleDateChange = (onChange: Function) => (date: any) => {
  const newDate = new Date(date?.toString());
  onChange(isValidDate(newDate) ? dayjs(newDate).format('YYYY-MM-DD') : null);
};
