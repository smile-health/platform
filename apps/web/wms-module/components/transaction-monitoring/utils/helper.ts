import { removeEmptyObject } from '@/utils/object';
import { getReactSelectValue } from '@repo/ui/utils/react-select';

import { Values } from 'nuqs';
import { DataValue } from '@/types/transaction-monitoring';
import dayjs from 'dayjs';

export function handleFilter(filter: Values<Record<string, any>>) {
  const newFilter = {
    page: filter?.page,
    paginate: filter?.paginate,
    startDate: filter?.dateRange?.start?.toString(),
    endDate: filter?.dateRange?.end?.toString(),
    provinceId: getReactSelectValue(filter?.provinceMonitoring),
    regencyId: getReactSelectValue(filter?.regencyMonitoring),
    entityTag: getReactSelectValue(filter?.entityTag),
    healthcareFacilityId: getReactSelectValue(
      filter?.healthcareFacilityMonitoring
    ),
    isBags: filter?.isBags,
    wasteTypeId: getReactSelectValue(filter?.wasteTypeId),
    wasteGroupId: getReactSelectValue(filter?.wasteGroupId),
    wasteCharacteristicsId: getReactSelectValue(filter?.wasteCharacteristicsId),
    orderBy: filter?.orderBy,
  };

  return removeEmptyObject(newFilter);
}

export function dataMapping(
  data: any[],
  labelKey: string | ((item: any) => string),
  valueKey = 'value'
): DataValue {
  const res = data?.map((item) => {
    const label =
      typeof labelKey === 'string'
        ? (eval(`item.${labelKey}`) ?? '-')
        : labelKey(item);

    return {
      label,
      value: item?.[valueKey] ?? 0,
    };
  });

  return res;
}

export function formatMonthYear(date: string, language: string = 'en') {
  if (!date) return '-';

  let isoDate = date;

  if (date.includes('-')) {
    const [monthPart, yearPart] = date.split('-');
    if (monthPart && yearPart && /^\d{4}$/.test(yearPart)) {
      isoDate = `${yearPart}-${monthPart.padStart(2, '0')}-01`;
    }
  }

  const formattedDate = dayjs(isoDate);
  if (!formattedDate.isValid()) return '-';

  return formattedDate.locale(language).format('MMM YYYY');
}

export function getYAxisConfig(data?: number[]) {
  if (!data?.length) return {};

  const minValue = Math.min(...data);
  const maxValue = Math.max(...data);
  const range = maxValue - minValue || 1;

  let min = 0;
  let max = 0;
  let interval = 0;

  if (maxValue >= 100_000) {
    const step =
      range > 30_000_000
        ? 10_000_000
        : range > 5_000_000
          ? 2_000_000
          : range > 1_000_000
            ? 500_000
            : 100_000;

    min = Math.floor(minValue / step) * step;
    max = Math.ceil(maxValue / step) * step;
    interval = Math.ceil((max - min) / 5);
  } else {
    const buffer = range * 0.1;
    min = Math.max(0, Math.floor((minValue - buffer) / 10) * 10);
    max = Math.ceil((maxValue + buffer) / 10) * 10;

    const dynamicRange = max - min;
    if (dynamicRange <= 50) interval = 10;
    else if (dynamicRange <= 200) interval = 20;
    else if (dynamicRange <= 500) interval = 50;
    else if (dynamicRange <= 1000) interval = 100;
    else interval = Math.ceil(dynamicRange / 5);
  }

  return {
    min,
    max,
    interval,
    splitNumber: 5,
  };
}
