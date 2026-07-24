import { THealthcare } from '@/types/healthcare';
import { RenderDetailValue } from '@repo/ui/components/modules/RenderDetailValue';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { getAssetTypeOptions } from '../../utils/helper';

type HealthcareDetailProps = {
  data?: THealthcare;
  isLoading: boolean;
};

const HealthcareInfo: React.FC<HealthcareDetailProps> = ({
  data,
  isLoading,
}) => {
  const { t } = useTranslation(['common', 'healthCare']);

  return (
    <div className="ui-p-4 ui-border ui-border-neutral-300 ui-rounded ui-space-y-4">
      <div className="ui-flex ui-justify-between ui-items-start ui-gap-4">
        <h5 className="ui-font-bold ui-text-dark-blue">
          {t('healthCare:detail.title')}
        </h5>
      </div>
      <RenderDetailValue
        loading={isLoading}
        data={[
          {
            label: t('healthCare:list.column.healthcare_facility'),
            value: data?.healthcareFacilityName ?? '-',
          },
          {
            label: t('healthCare:list.column.asset_type'),
            value: (() => {
              const assetType = data?.assetModel?.assetType;
              if (!assetType) return '-';
              const typeOption = getAssetTypeOptions(t).find(
                (opt) => opt.value === assetType
              );
              return typeOption?.label ?? assetType;
            })(),
          },
          {
            label: t('healthCare:list.column.manufacture'),
            value: data?.assetModel?.manufacturer?.name ?? '-',
          },
          {
            label: t('healthCare:list.column.model'),
            value: data?.assetModel?.name ?? '-',
          },
          {
            label: t('healthCare:list.column.asset_id'),
            value: data?.assetId ?? '-',
          },
          {
            label: t('healthCare:list.column.sync_status'),
            value: data?.isIotEnable ? 'Enabled' : 'Disabled',
          },
          {
            label: t('healthCare:list.column.asset_status'),
            value: data?.assetStatus ?? '-',
          },
          {
            label: t('healthCare:list.column.year_production'),
            value: data?.yearOfProduction ?? '-',
          },
          {
            label: t('healthCare:list.column.warranty_start'),
            value: data?.warrantyStartDate
              ? dayjs(data?.warrantyStartDate).format('DD/MM/YYYY')
              : '-',
          },
          {
            label: t('healthCare:list.column.warranty_end'),
            value: data?.warrantyEndDate
              ? dayjs(data?.warrantyEndDate).format('DD/MM/YYYY')
              : '-',
          },
        ]}
      />
    </div>
  );
};

export default HealthcareInfo;
