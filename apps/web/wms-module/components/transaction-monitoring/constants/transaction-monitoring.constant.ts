import { ColumnDef } from '@tanstack/react-table';
import { TFunction } from 'i18next';

import { TEntity } from '@/types/transaction-monitoring';
import { TDashboardTabs } from '@/types/transaction-monitoring';
import { formatDate } from '@/utils/formatter';
import DashboardTransactionMonitoringEntityTable from '../components/sections/DashboardTransactionMonitoringEntityTable';
import DashboardWasteBagProvinceChart from '../components/sections/DashboardWasteBagProvinceChart';
import DashboardWasteBagRegencyChart from '../components/sections/DashboardWasteBagRegencyChart';
import useTransactionMonitoring from '../hooks/useTransactionMonitoring';

export const DEFAULT_DOWNLOAD_EXTENSIONS = ['png', 'jpg', 'pdf'];

export const WASTE_GROUP_COLORS: Record<string, string> = {
  Domestik: '#000000',
  Domestic: '#000000',
  'Klinis/Medis': '#FFD700',
  'Clinical/Medical': '#FFD700',
  'Limbah B3': '#D32F2F',
  'Hazardous and Toxic Waste (B3)': '#D32F2F',
};

export enum InformationType {
  Bag = '1',
  Weight = '0',
}

export const informationTypeList = (t: TFunction<'transactionMonitoring'>) => [
  {
    id: 'radio-information-bag',
    label: t('data.information_type.bag'),
    value: '1',
  },
  {
    id: 'radio-information-weight',
    label: t('data.information_type.weight'),
    value: '0',
  },
];

export enum TransactionChartType {
  Province = 'province',
  Regency = 'regency',
  Entity = 'entity',
  Entity_Group = 'entity-group',
  Entity_Complete = 'entity-complete',
}

export const transactionChartTabs = (
  t: TFunction<'transactionMonitoring'>
): Array<TDashboardTabs<TransactionChartType>> => [
  {
    id: TransactionChartType.Province,
    label: t('title.province'),
  },
  {
    id: TransactionChartType.Regency,
    label: t('title.regency'),
  },
  {
    id: TransactionChartType.Entity,
    label: t('title.entity.main'),
  },
  {
    id: TransactionChartType.Entity_Group,
    label: t('title.entity.group'),
  },
  {
    id: TransactionChartType.Entity_Complete,
    label: t('title.entity.complete'),
  },
];

export const tableEntityColumns = (
  t: TFunction<'transactionMonitoring'>,
  page: number,
  paginate: number,
  isBags: string,
  handleInformationType: (
    isBags: string,
    value?: string | number
  ) => {
    title: string;
    value: string | number | undefined;
  }
) => {
  const schema: Array<ColumnDef<any>> = [
    {
      header: 'No.',
      accessorKey: 'no',
      size: 20,
      maxSize: 20,
      cell: ({ row }) => (page - 1) * paginate + (row?.index + 1),
    },
    {
      header: t('column.province'),
      accessorKey: 'provinceName',
      size: 100,
      minSize: 100,
    },
    {
      header: t('column.regency'),
      accessorKey: 'regencyName',
      size: 100,
      minSize: 100,
    },
    {
      header: t('column.entity.name'),
      accessorKey: 'healthcareFacilityName',
      size: 100,
      minSize: 100,
    },
    {
      header: t('column.total'),
      accessorKey: 'value',
      size: 100,
      minSize: 100,
      cell: ({ getValue }) => {
        const value = getValue<number>();
        return handleInformationType(isBags, value)?.value;
      },
    },
  ];

  return schema;
};

export const tableEntityGroupColumns = (
  t: TFunction<'transactionMonitoring'>,
  page: number,
  paginate: number,
  isBags: string,
  handleInformationType: (
    isBags: string,
    value?: string | number
  ) => {
    title: string;
    value: string | number | undefined;
  }
) => {
  const schema: Array<ColumnDef<any>> = [
    {
      header: 'No.',
      accessorKey: 'no',
      size: 20,
      maxSize: 20,
      cell: ({ row }) => (page - 1) * paginate + (row?.index + 1),
    },
    {
      header: t('column.province'),
      accessorKey: 'provinceName',
      size: 100,
      minSize: 100,
    },
    {
      header: t('column.regency'),
      accessorKey: 'regencyName',
      size: 100,
      minSize: 100,
    },
    {
      header: t('column.entity.name'),
      accessorKey: 'healthcareFacilityName',
      size: 100,
      minSize: 100,
    },
    {
      header: t('column.waste_group'),
      accessorKey: 'wasteGroupName',
      size: 100,
      minSize: 100,
    },
    {
      header: t('column.total'),
      accessorKey: 'value',
      size: 100,
      minSize: 100,
      cell: ({ getValue }) => {
        const value = getValue<number>();
        return handleInformationType(isBags, value)?.value;
      },
    },
  ];

  return schema;
};

export const tableEntityCompleteColumns = (
  t: TFunction<'transactionMonitoring'>,
  page: number,
  paginate: number,
  isBags: string,
  handleInformationType: (
    isBags: string,
    value?: string | number
  ) => {
    title: string;
    value: string | number | undefined;
  }
) => {
  const schema: Array<ColumnDef<TEntity>> = [
    {
      header: 'No.',
      accessorKey: 'no',
      size: 20,
      maxSize: 100,
      cell: ({ row }) => (page - 1) * paginate + (row?.index + 1),
    },
    {
      header: t('column.province'),
      accessorKey: 'provinceName',
      size: 100,
      minSize: 100,
    },
    {
      header: t('column.regency'),
      accessorKey: 'regencyName',
      size: 100,
      minSize: 100,
    },
    {
      header: t('column.entity.name'),
      accessorKey: 'healthcareFacilityName',
      size: 100,
      minSize: 100,
    },
    {
      header: t('column.waste_characteristic'),
      accessorKey: 'wasteFullName',
      size: 100,
      minSize: 100,
    },
    {
      header: t('column.total'),
      accessorKey: 'value',
      size: 100,
      minSize: 100,
      cell: ({ getValue }) => {
        const value = getValue<number>();
        return handleInformationType(isBags, value)?.value;
      },
    },
    {
      header: t('column.projection_waste_bag'),
      accessorKey: 'avgValue',
      size: 100,
      minSize: 100,
      cell: ({ getValue }) => {
        const value = getValue<number>();
        return handleInformationType(isBags, value)?.value;
      },
    },
    {
      header: t('column.max_waste_bag'),
      accessorKey: 'maxValue',
      size: 100,
      minSize: 100,
      cell: ({ getValue }) => {
        const value = getValue<number>();
        return handleInformationType(isBags, value)?.value;
      },
    },
    {
      header: t('column.gap_waste_bag'),
      accessorKey: 'gapValue',
      size: 100,
      minSize: 100,
      cell: ({ getValue }) => {
        const value = getValue<number>();
        return handleInformationType(isBags, value)?.value;
      },
    },
  ];

  return schema;
};

interface TabContent {
  title: string;
  subtitle: string;
  exportFileName: string;
}

export const transactionDataElementTab = (
  t: TFunction<'transactionMonitoring'>,
  informationType: InformationType
): Record<TransactionChartType, TabContent> => {
  const titleProvince = t('title.province');
  const titleRegency = t('title.regency');
  const titleEntity = t('title.entity.main');
  const titleEntityComplete = t('title.entity.complete');
  const titleEntityGroup = t('title.entity.group');

  return {
    [TransactionChartType.Province]: {
      title: titleProvince,
      subtitle: t('description.information', {
        title: titleProvince?.toLowerCase(),
      }),
      exportFileName: 'Dashboard Transaction Monitoring - By Province',
    },
    [TransactionChartType.Regency]: {
      title: titleRegency,
      subtitle: t('description.information', {
        title: titleRegency?.toLowerCase(),
      }),
      exportFileName: 'Dashboard Transaction Monitoring - By City',
    },
    [TransactionChartType.Entity]: {
      title: titleEntity,
      subtitle: t('description.information', {
        title: titleEntity?.toLowerCase(),
      }),
      exportFileName: 'Dashboard Transaction Monitoring - By Entity',
    },
    [TransactionChartType.Entity_Group]: {
      title: titleEntityGroup,
      subtitle: t('description.information', {
        title: titleEntityGroup?.toLowerCase(),
      }),
      exportFileName: 'Dashboard Transaction Monitoring - By Entity Group',
    },
    [TransactionChartType.Entity_Complete]: {
      title: titleEntityComplete,
      subtitle: t('description.information', {
        title: titleEntityComplete?.toLowerCase(),
      }),
      exportFileName: 'Dashboard Transaction Monitoring - By Entity Complete',
    },
  };
};

export const TRANSACTION_MONITORING_TAB_CONTENT = {
  [TransactionChartType.Province]: DashboardWasteBagProvinceChart,
  [TransactionChartType.Regency]: DashboardWasteBagRegencyChart,
  [TransactionChartType.Entity]: DashboardTransactionMonitoringEntityTable,
  [TransactionChartType.Entity_Group]:
    DashboardTransactionMonitoringEntityTable,
  [TransactionChartType.Entity_Complete]:
    DashboardTransactionMonitoringEntityTable,
};
