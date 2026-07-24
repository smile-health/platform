import { RootState } from '@/redux/store';
import i18n from 'i18next';
import { useSelector } from 'react-redux';

export const useFormatWasteBagWeight = () => {
  const isTon = useSelector((state: RootState) => state.app.isTon);

  const formatWasteBagWeight = (value: string | number): string => {
    const num = Number(value);
    if (isNaN(num) || num === 0) return '0';

    const displayValue = isTon ? num / 1000 : num;

    return new Intl.NumberFormat(i18n.language === 'id' ? 'id-ID' : 'en-US', {
      minimumFractionDigits: isTon ? 6 : 3,
      maximumFractionDigits: isTon ? 6 : 3,
    }).format(displayValue);
  };

  const unit = isTon ? 'Ton' : 'Kg';

  return { formatWasteBagWeight, unit };
};
