import { hasPermission } from '@/utils/permission';
import { TFunction } from 'i18next';

export const staticMenuWMS = (t: TFunction) => [
  {
    link: '/',
    title: t('menu.home.title'),
    id: 'navbar-home-wms',
    isExist: hasPermission('homepage-view'),
  },
];

export const logisticKeslingMenuWMS = (t: TFunction) => [
  {
    link: '/kesling/v5/transaction',
    title: t('menu.logistic_kesling.title'),
    id: 'navbar-logistic-kesling-wms',
    isExist: hasPermission('logistic-kesling-view'),
  },
];

export const menuWasteWMS = (t: TFunction) => {
  return [
    {
      link: '/waste-hierarchy',
      title: t('menu.waste.item.waste_hierarchy'),
      className: 'text-left',
      isExist: hasPermission('waste-hierarchy-view'),
    },
    {
      link: '/waste-specification',
      title: t('menu.waste.item.waste_specification'),
      className: 'text-left',
      isExist: hasPermission('waste-specification-view'),
    },
    {
      link: '/waste-source',
      title: t('menu.waste.item.waste_source'),
      className: 'text-left',
      isExist: hasPermission('waste-source-view'),
    },
    {
      link: '/print-label',
      title: t('menu.waste.item.print_label'),
      className: 'text-left',
      isExist: hasPermission('print-label-view'),
    },
    {
      link: '/manual-scale',
      title: t('menu.waste.item.manual_scale'),
      className: 'text-left',
      isExist: hasPermission('manual-scale-view'),
    },
    {
      link: '/bast',
      title: t('menu.waste.item.bast'),
      className: 'text-left',
      isExist: hasPermission('bast-view'),
    },
  ];
};

export const menuAssetWMS = (t: TFunction) => {
  return [
    {
      link: '/healthcare-asset',
      title: t('menu.asset.item.healthcare'),
      className: 'text-left',
      isExist: hasPermission('healthcare-asset-view'),
    },
  ];
};

export const menuReportWMS = (t: TFunction) => {
  return [
    {
      link: '/tracking',
      title: t('menu.reporting.item.tracking'),
      className: 'text-left',
      id: 'navbar-tracking-wms',
      isExist: hasPermission('tracking-view'),
    },
    {
      link: '/logbook',
      title: t('menu.reporting.item.waste_disposal'),
      className: 'text-left',
      id: 'navbar-logbook-wms',
      isExist: hasPermission('logbook-view'),
    },
    {
      link: '/transaction',
      title: t('menu.reporting.item.logbook'),
      className: 'text-left',
      id: 'navbar-transaction-wms',
      isExist: hasPermission('transaction-view'),
    },
    {
      link: '/transaction-monitoring',
      title: t('menu.reporting.item.transaction_monitoring'),
      className: 'text-left',
      id: 'navbar-transaction-monitoring-wms',
      isExist: hasPermission('transaction-monitoring-view'),
    },
    {
      link: '/user-activity',
      title: t('menu.reporting.item.user_activity'),
      className: 'text-left',
      id: 'navbar-user-activity-wms',
      isExist: hasPermission('user-activity-view'),
    },
  ];
};

export const menuSettingWMS = (t: TFunction) => {
  return [
    {
      link: '/about',
      title: t('menu.setting.item.about'),
      className: 'text-left',
      isExist: hasPermission('about-query'),
    },

    {
      link: '/distance',
      title: t('menu.setting.item.distance'),
      className: 'text-left',
      isExist:
        hasPermission('global-distance-limit-mutate') ||
        hasPermission('distance-limit-mutate'),
    },
    {
      link: '/entity',
      title: t('menu.setting.item.entity'),
      className: 'text-left',
      isExist: hasPermission('entity-view'),
    },
    {
      link: '/asset-dongle',
      title: t('menu.setting.item.asset_dongle'),
      className: 'text-left',
      isExist: hasPermission('asset-dongle-view'),
    },
    {
      link: '/user-setting',
      title: t('menu.setting.item.user_setting'),
      className: 'text-left',
      isExist: hasPermission('user-setting-view'),
    },
    {
      link: '/user-operator',
      title: t('menu.setting.item.user_operator'),
      className: 'text-left',
      isExist: hasPermission('user-operator-view'),
    },
    {
      link: '/partnership',
      title: t('menu.setting.item.partnership'),
      className: 'text-left',
      isExist: hasPermission('partnership-view'),
    },
    {
      link: '/healthcare-partner',
      title: t('menu.setting.item.healthcare_partner'),
      className: 'text-left',
      isExist: hasPermission('healthcare-partner-view'),
    },
    {
      link: '/treatment-location',
      title: t('menu.setting.item.treatment_location'),
      className: 'text-left',
      isExist: hasPermission('treatment-location-view'),
    },
    {
      link: '/third-party-partner',
      title: t('menu.setting.item.third_party_partner'),
      className: 'text-left',
      isExist: hasPermission('thirdparty-partner-view'),
    },
    {
      link: '/healthcare-storage-location',
      title: t('menu.setting.item.healthcare_storage_location'),
      className: 'text-left',
      isExist: hasPermission('healthcare-storage-location-mutate'),
    },
    {
      link: '/partnership-vehicle',
      title: t('menu.setting.item.transport_vehicle'),
      className: 'text-left',
      isExist: hasPermission('transport-vehicle-view'),
    },
  ];
};
