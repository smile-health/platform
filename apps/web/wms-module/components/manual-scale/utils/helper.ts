import i18n from '@/locales/i18n';
import { BadgeColor } from '@repo/ui/components/badge';
import { OptionType } from '@repo/ui/components/react-select';
import { ManualScaleStatusValues } from '../constants/manual-scale';

type ScaleStatusType = OptionType & {
  color?: BadgeColor;
};

export const getManualScaleStatusOptions = (): ScaleStatusType[] => {
  return ManualScaleStatusValues.map((type) => ({
    value: type.value,
    color: type.color,
    label: i18n.t(`manual_scale_status.${type.value}`, {
      ns: 'manualScale',
    }),
  }));
};
