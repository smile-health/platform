import { GetWasteSpecificationDetailResponse } from '@/types/waste-specification';
import { RenderDetailValue } from '@repo/ui/components/modules/RenderDetailValue';
import { Spinner } from '@repo/ui/components/spinner';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import {
  formatAllowedVehicleTypes,
  getExternalTreatmentOptions,
  getInternalTreatmentOptions,
  getWasteBagColorOptions,
  toTitleCase,
} from '../utils/helper';

type WasteSpecificationDetailProps = {
  data?: GetWasteSpecificationDetailResponse;
  isLoading: boolean;
};

const WasteSpecificationDetailInfo: React.FC<WasteSpecificationDetailProps> = ({
  data,
  isLoading,
}) => {
  const { t, i18n } = useTranslation(['common', 'wasteSpecification']);

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="ui-w-full ui-flex ui-items-center ui-justify-center ui-my-20">
          <Spinner className="ui-h-8 ui-w-8" />
        </div>
      ) : (
        <RenderDetailValue
          data={[
            {
              label: t('wasteSpecification:detail.waste_code'),
              value: data?.data.wasteCode || '-',
            },
            {
              label: t('wasteSpecification:detail.waste_type'),
              value:
                i18n.language === 'id'
                  ? data?.data?.wasteType.name
                  : data?.data?.wasteType.nameEn || '-',
            },
            {
              label: t('wasteSpecification:detail.waste_group'),
              value:
                i18n.language === 'id'
                  ? data?.data?.wasteGroup.name
                  : data?.data?.wasteGroup.nameEn || '-',
            },
            {
              label: t('wasteSpecification:detail.waste_characteristic'),
              value:
                i18n.language === 'id'
                  ? data?.data?.wasteCharacteristics.name
                  : data?.data?.wasteCharacteristics.nameEn || '-',
            },
            {
              label: t('wasteSpecification:detail.waste_bag_color'),
              value:
                getWasteBagColorOptions().find(
                  (opt) => opt.value === data?.data.wasteBagColorCode
                )?.label || '-',
            },
            {
              label: t('wasteSpecification:detail.minimum_decay_time_process'),
              value: `${data?.data.minimunDecayDay || 0} ${t('common:days')}`,
              hidden: data?.data.wasteCharacteristicsId !== 54,
            },
            {
              label: t('wasteSpecification:detail.multiple_transporters'),
              value: data?.data.hasMultipleTransporters
                ? t('common:yes')
                : t('common:no'),
            },
            {
              label: t('wasteSpecification:detail.use_cold_storage'),
              value: data?.data.useColdStorage
                ? t('common:yes')
                : t('common:no'),
            },
            {
              label: t('wasteSpecification:detail.cold_storage_max_processing'),
              value: `${(data?.data.coldStorageMaxHours || 0) / 24} ${t(
                'common:days'
              )}`,
            },
            {
              label: t(
                'wasteSpecification:detail.temporary_storage_max_processing'
              ),
              value: `${(data?.data.tempStorageMaxHours || 0) / 24} ${t(
                'common:days'
              )}`,
            },
            {
              label: t('wasteSpecification:detail.internal_treatment'),
              value: (() => {
                if (!data?.data.treatmentMethod) return '-';

                const treatmentOptions = getInternalTreatmentOptions();

                const treatments = data?.data.treatmentMethod
                  .split(',')
                  .map((item) => item.trim())
                  .map(
                    (item) =>
                      treatmentOptions.find((opt) => opt.value === item)
                        ?.label || item
                  );

                return treatments.length > 0 ? treatments.join(', ') : '-';
              })(),
            },
            {
              label: t('wasteSpecification:detail.external_treatment'),
              value: (() => {
                if (!data?.data.disposalMethod) return '-';
                const disposalOptions = getExternalTreatmentOptions();

                const formatted = data?.data.disposalMethod
                  .split(',')
                  .map((item) => item.trim().toUpperCase())
                  .map((item) => {
                    const matchedEnumValue = disposalOptions.find(
                      (enumValue) => enumValue.value.toUpperCase() === item
                    );

                    return matchedEnumValue
                      ? matchedEnumValue.label
                      : toTitleCase(item);
                  })
                  .join(', ');

                return formatted || '-';
              })(),
            },
            {
              label: t('wasteSpecification:detail.vehicle_type'),
              value: formatAllowedVehicleTypes(data?.data.allowedVehicleTypes),
            },
            {
              label: t('wasteSpecification:detail.created_at'),
              value: data?.data.createdAt
                ? dayjs(data?.data.createdAt).format('DD/MM/YYYY')
                : '-',
            },
            {
              label: t('wasteSpecification:detail.updated_at'),
              value: data?.data.updatedAt
                ? dayjs(data?.data.updatedAt).format('DD/MM/YYYY')
                : '-',
            },
            {
              label: t('wasteSpecification:detail.updated_by'),
              value: data?.data.userName || '-',
            },
          ]}
        />
      )}
    </div>
  );
};

export default WasteSpecificationDetailInfo;
