import i18n from '@/locales/i18n';
import { TEntityItem } from '@/types/user-activity';
import { removeEmptyObject } from '@/utils/object';
import { getReactSelectValue } from '@repo/ui/utils/react-select';
import { Values } from 'nuqs';

export function handleFilter(filter: Values<Record<string, any>>) {
  const newFilter = {
    page: filter?.page,
    limit: filter?.limit,
    startDate: filter?.periode?.start,
    endDate: filter?.periode?.end,
    wasteTypeId: getReactSelectValue(filter?.wasteTypeId),
    wasteGroupId: getReactSelectValue(filter?.wasteGroupId),
    entityTag: getReactSelectValue(filter?.entityTag),
    provinceId: getReactSelectValue(filter?.provinceActivity),
    regencyId: getReactSelectValue(filter?.regencyActivity),
    healthcareFacilityId: getReactSelectValue(
      filter?.healthcareFacilityActivity
    ),
    typeOfProcessing: getReactSelectValue(filter?.typeOfProcessing),
  };

  return removeEmptyObject(newFilter);
}

export function getLabelOptions(isActive = false) {
  return {
    formatter: '  {label|{b}: }{count|{c}}  {percent|{d}%}  ',
    backgroundColor: isActive ? '#F0FDF4' : '#FEF2F2',
    borderColor: '#073B4C',
    borderWidth: 1,
    borderRadius: 4,
    rich: {
      label: {
        color: '#073B4C',
        fontSize: 14,
        fontWeight: 'bold',
        lineHeight: 33,
      },
      count: {
        fontSize: 14,
        color: '#073B4C',
      },
      percent: {
        color: '#fff',
        backgroundColor: isActive ? '#22C55E' : '#EF4444',
        padding: [3, 4],
        borderRadius: 4,
      },
    },
  };
}

type AnyObj = { [k: string]: any };

interface DayData {
  value: number;
  isManualScale: number; // 1 atau 0
}

interface TransformedDataItem {
  id: string | number;
  entitas: string;
  provinceName: string;
  regencyName: string;
  days: DayData[];
  jumlahHariAktif: number;
  jumlahHariTidakAktif: number;
  jumlahHariManualScale: number;
  jumlahFrekuensi: number;
  rataRataFrekuensi: number;
}

export const transformData = (
  iotData: TEntityItem[],
  manualData: TEntityItem[],
  sortedDatesInput: string[]
): TransformedDataItem[] => {
  const sortedDates = [...sortedDatesInput].sort((a, b) => a.localeCompare(b));

  const extractDay = (dateStr: string) => {
    const parts = dateStr.split('-');
    const dayPart = parts[parts.length - 1];
    return dayPart.replace(/^0+/, '');
  };

  const findValue = (obj: AnyObj, dateKey: string): number => {
    if (!obj) return 0;
    const variants = [
      dateKey,
      `${dateKey.toString().replace(/^0+/, '')}`,
      extractDay(dateKey),
    ];

    for (const k of variants) {
      if (k in obj && obj[k] != null && obj[k] !== '') {
        const v = Number(obj[k]);
        if (!Number.isNaN(v)) return v;
      }
    }
    return 0;
  };

  return iotData.map((iotItem, index) => {
    const manualItem = manualData.find(
      (m) => m.healthcareFacilityId === iotItem.healthcareFacilityId
    );

    let jumlahHariAktif = 0;
    let jumlahHariTidakAktif = 0;
    let jumlahHariManualScale = 0;
    let jumlahFrekuensi = 0;

    const days: DayData[] = sortedDates.map((dateKey) => {
      const iotValue = findValue(iotItem, dateKey);
      const manualValue = manualItem ? findValue(manualItem, dateKey) : 0;

      const isManualActive = manualValue > 0;
      const isAktif = iotValue > 0 || isManualActive;

      if (isManualActive) jumlahHariManualScale++;
      if (isAktif) {
        jumlahHariAktif++;
        jumlahFrekuensi += iotValue;
      } else {
        jumlahHariTidakAktif++;
      }

      return {
        value: iotValue,
        isManualScale: isManualActive ? 1 : 0,
      };
    });

    const rataRataFrekuensi =
      sortedDates.length > 0
        ? parseFloat((jumlahFrekuensi / sortedDates.length).toFixed(2))
        : 0;

    return {
      id: iotItem.healthcareFacilityId ?? index,
      entitas: iotItem.healthcareFacilityName ?? '-',
      provinceName: iotItem.provinceName ?? '-',
      regencyName: iotItem.regencyName ?? '-',
      days,
      jumlahHariAktif,
      jumlahHariTidakAktif,
      jumlahHariManualScale,
      jumlahFrekuensi,
      rataRataFrekuensi,
    };
  });
};

const tagMappings = {
  hospital: 'tag.hospital',
  clinic: 'tag.clinic',
  puskesmas: 'tag.health_center',
  posyandu: 'tag.health_post',
  pharmacy: 'tag.pharmacy',
  lab: 'tag.laboratory',
} as const;

type TagKey = keyof typeof tagMappings;

export const getTranslatedTagLabel = (tag: string): string => {
  if (!tag) return '';

  const lowerTag = tag.toLowerCase();
  const matchedKey = (Object.keys(tagMappings) as TagKey[]).find((key) =>
    lowerTag.includes(key)
  );

  return matchedKey
    ? i18n.t(tagMappings[matchedKey], { ns: 'userActivity' })
    : tag;
};
