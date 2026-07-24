import { useFormatWasteBagWeight } from '@/utils/hooks/useFormatWeight';
import { useTranslation } from 'react-i18next';
import { numberFormatter } from '@/utils/formatter';

export default function useTransactionMonitoring() {
  const { t } = useTranslation('transactionMonitoring');
  const { formatWasteBagWeight, unit } = useFormatWasteBagWeight();

  const handleInformationType = (isBags: string, value?: string | number) => {
    if (isBags === '1') {
      return {
        title: t('data.information_type.bag'),
        value: numberFormatter(Number(value)),
      };
    }
    return {
      title: unit,
      value: formatWasteBagWeight(value ?? 0),
    };
  };

  return {
    handleInformationType,
  };
}
