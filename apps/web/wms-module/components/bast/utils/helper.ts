import i18n from '@/locales/i18n';

export const mapBastStatus = (status: string): string => {
  if (!status) return '-';
  return i18n.t(`bast:bast_status.${status}`, status);
};
