import { hasPermission } from '#shared/permission/index'
import { isDevelopment } from '#utils/env'
import { getUserStorage } from '#utils/storage/user'
import { TFunction } from 'i18next'

import { USER_ROLE } from './roles'

// items commented on as useless in smile 3.0

export const menuDashboardCovidChilds = (t: TFunction, isExist = true) => [
  // {
  //   link: '/dashboard/covid-19/simple',
  //   title: 'Transaksi Utama',
  //   className: 'ui-hover:ui-bg-gray-200 ui:text-start',
  //   isExist: false,
  // },
  {
    link: '/dashboard/covid-19/big-data',
    title: t('menu.dashboard.item.transaction.item.general'),
    className: 'ui-hover:ui-bg-gray-200 ui:text-start',
    isExist,
  },
  // {
  //   link: '/dashboard/covid-19/v2',
  //   title: 'Transaksi Detail V1',
  //   className: 'ui-hover:ui-bg-gray-200 ui:text-start',
  //   isExist: false,
  // },
  {
    link: '/dashboard/covid-19/v3/big-data',
    title: t('menu.dashboard.item.transaction.item.detail'),
    className: 'ui-hover:ui-bg-gray-200 ui:text-start',
    isExist,
  },
  {
    link: '/dashboard/cascade-transaction/big-data',
    title: 'Cascade',
    className: 'ui-hover:ui-bg-gray-200 ui:text-start',
    isExist,
  },
]

export const menuConsumedChilds = (t: TFunction) => [
  // {
  //   link: '/dashboard/consumed',
  //   title: 'Consumed SMILE',
  //   className: 'ui-hover:bg-gray-200 ui:text-start ui:hidden',
  //   isExist: false,
  // },
]

export const menuDashboardChilds = (t: TFunction) => {
  const user = getUserStorage()
  return [
    // {
    //   link: '/dashboard/monev/big-data',
    //   title: t('menu.dashboard.item.in_transit'),
    //   className: 'ui:text-start',
    //   isExist: user?.role !== USER_ROLE.DISTRIBUTOR_COVID,
    // },
    // {
    //   link: '/dashboard/asset-ownership',
    //   title: t('menu.dashboard.item.asset_ownership'),
    //   className: 'ui:text-start',
    //   isExist: user?.role !== USER_ROLE.DISTRIBUTOR_COVID,
    // },
    {
      link: '/v5/dashboard/download',
      title: t('menu.dashboard.item.download'),
      className: 'ui:text-start',
      isExist: user?.role !== USER_ROLE.DISTRIBUTOR_COVID,
    },
    // {
    //   link: '/dashboard/cold-storage-capacity',
    //   title: t('menu.dashboard.item.storage_capacity'),
    //   className: 'ui:text-start',
    //   isExist: isDevelopment({ isAlsoStaging: true }),
    // },
    {
      link: '/v5/dashboard/transaction-monitoring',
      title: t('menu.dashboard.item.monitoring'),
      className: 'ui:text-start',
      isExist: user?.role !== USER_ROLE.DISTRIBUTOR_COVID,
    },
    // {
    //   link: '/dashboard/planning',
    //   title: t('menu.dashboard.item.planning'),
    //   className: 'ui:text-start',
    //   isExist:
    //     user?.role !== USER_ROLE.DISTRIBUTOR_COVID &&
    //     isDevelopment({ isAlsoStaging: false }),
    // },
    {
      link: '/v5/dashboard/stock',
      title: t('menu.dashboard.item.stock'),
      className: 'ui:text-start',
      isExist: user?.role !== USER_ROLE.DISTRIBUTOR_COVID,
    },
    {
      link: '/v5/dashboard/stock-taking',
      title: t('menu.dashboard.item.stock_taking'),
      className: 'ui:text-start',
      isExist: user?.role !== USER_ROLE.DISTRIBUTOR_COVID,
    },
    // {
    //   link: '/smile-vs-smdv',
    //   title: 'SMILE VS SMDV',
    //   className: 'ui:text-start',
    //   isExist:
    //     user?.role &&
    //     [
    //       USER_ROLE.SUPERADMIN,
    //       USER_ROLE.MANAGER,
    //       USER_ROLE.DISTRIBUTOR_COVID,
    //     ].includes(user?.role),
    // },
    // {
    //   link: '/dashboard/compliance-transaction-input',
    //   title: t('menu.dashboard.item.compliance_transaction_input'),
    //   className: 'ui:text-start',
    //   isExist:
    //     user?.role &&
    //     [
    //       USER_ROLE.SUPERADMIN,
    //       USER_ROLE.MANAGER,
    //       USER_ROLE.DISTRIBUTOR_COVID,
    //     ].includes(user?.role) &&
    //     isDevelopment({ isAlsoStaging: true }),
    // },
  ]
}

export const menuInventarisChilds = (t: TFunction) => [
  {
    link: '/v5/transaction',
    title: t('menu.inventory.item.transaction'),
    className: 'ui:text-start',
  },
  {
    link: '/v5/stock',
    title: t('menu.inventory.item.stock.view'),
    className: 'ui:text-start',
  },
  {
    link: '/v5/reconciliation',
    title: t('menu.inventory.item.reconciliation'),
    className: 'ui:text-start',
  },
  {
    link: '/v5/stock-opname',
    title: t('menu.inventory.item.stock.opname'),
    className: 'ui:text-start',
  },
]

export const menuExterminationChilds = (t: TFunction) => [
  {
    link: '/v5/stock-pemusnahan',
    title: t('menu.disposal.item.view'),
    className: 'ui:text-start',
  },
  {
    link: '/v5/disposal-shipment',
    title: t('menu.disposal.item.distribution'),
    className: 'text-start',
  },
  {
    link: '/v5/self-disposal',
    title: t('menu.disposal.item.self'),
    className: 'ui:text-start',
  },
]

export const menuReportChilds = (t: TFunction) => ({
  activity: {
    title: t('menu.report.item.activity.title'),
    menus: [
      {
        variant: 'item',
        link: '/v5/report/user-activity',
        title: t('menu.report.item.activity.item.user'),
        show: true,
      },
      {
        variant: 'item',
        link: '/dashboard/consumed/big-data',
        title: t('menu.report.item.activity.item.immunization'),
        show: false,
      },
      {
        variant: 'link',
        link: '/report/count-transaction/big-data',
        title: t('menu.report.item.activity.item.count_transaction'),
        show: false,
      },
      {
        variant: 'link',
        link: '/report/count-stock/big-data',
        title: t('menu.report.item.activity.item.adjust_stock'),
        show: false,
      },
      {
        variant: 'item',
        link: '/v5/report/reconciliation',
        title: t('menu.report.item.activity.item.reconciliation'),
        show: true,
      },
    ],
  },
  inventory: {
    title: t('menu.report.item.inventory.title'),
    menus: [
      {
        link: '/report/consumption-supply/big-data',
        title: t('menu.report.item.inventory.item.supply_consumption'),
      },
      {
        link: '/report/abnormal-stock/big-data',
        title: t('menu.report.item.inventory.item.stock.abnormal'),
      },
      {
        link: '/report/zero-stock/big-data',
        title: t('menu.report.item.inventory.item.stock.zero'),
      },
      {
        link: '/report/filling-stock/big-data',
        title: t('menu.report.item.inventory.item.stock.filling'),
      },
      {
        link: '/report/stock-availability/big-data',
        title: t('menu.report.item.inventory.item.stock.availability'),
      },
      {
        link: '/report/discard/big-data',
        title: t('menu.report.item.inventory.item.discard'),
      },
    ],
  },
  order: {
    title: t('menu.report.item.order.title'),
    menus: [
      {
        link: '/report/order-response/big-data',
        title: t('menu.report.item.order.item.time'),
      },
      {
        link: '/report/order-difference/big-data',
        title: t('menu.report.item.order.item.difference'),
      },
    ],
  },
  asset: {
    title: t('menu.report.item.asset.title'),
    menus: [
      {
        link: '/report/asset-excursion/big-data',
        title: t('menu.report.item.asset.item.excursion'),
      },
    ],
  },
  report: {
    title: t('menu.report.title'),
    menus: [
      {
        link: '/report/monthly/big-data',
        title: t('menu.report.item.monthly'),
        show: false,
      },
      {
        link: '/report/yearly/big-data',
        title: t('menu.report.item.yearly'),
        show: false,
      },
      {
        link: '/v5/report/stock-book',
        title: t('menu.report.item.stock_book'),
        show: true,
      },
    ],
  },
  planning: {
    title: t('menu.report.item.planning.title'),
    menus: [
      {
        link: '/perencanaan-tahunan/v2',
        title: t('menu.report.item.planning.item.annual'),
      },
    ],
  },
})

export const menuSettingChilds = (t: TFunction) => {
  const user = getUserStorage()

  return [
    {
      link: '/account',
      title: t('menu.setting.item.account'),
      className: 'text-start',
      isExist: true,
    },
    {
      link: '/v5/user',
      title: t('menu.setting.item.user'),
      className: 'text-start',
      isExist: hasPermission('user-view'),
    },
    {
      link: '/v5/activity',
      title: t('menu.setting.item.activity'),
      className: 'text-start',
      isExist: hasPermission('activity-view'),
    },
    {
      link: '/v5/entity',
      title: t('menu.setting.item.entity'),
      className: 'text-start',
      isExist: hasPermission('entity-view'),
    },
    {
      link: '/v5/material',
      title: 'Material Data',
      className: 'text-start',
      isExist: hasPermission('material-view'),
    },
    {
      link: '/v5/model-asset-management',
      title: t('menu.setting.item.asset.model'),
      className: 'text-start',
      isExist:
        user?.role &&
        [USER_ROLE.SUPERADMIN, USER_ROLE.ADMIN].includes(user?.role),
    },
    {
      link: '/v5/asset-type',
      title: t('menu.setting.item.asset.type'),
      className: 'text-start',
      isExist:
        user?.role &&
        [USER_ROLE.SUPERADMIN, USER_ROLE.ADMIN].includes(user?.role),
    },
    {
      link: '/v5/material-volume-management',
      title: t('menu.setting.item.material_volume'),
      className: 'text-start',
      isExist:
        user?.role &&
        [USER_ROLE.SUPERADMIN, USER_ROLE.ADMIN].includes(user?.role),
    },
    {
      link: '/v5/manufacturer',
      title: t('menu.setting.item.manufacturer'),
      className: 'text-start',
      isExist: hasPermission('manufacturer-view'),
    },
    {
      link: '/communication-provider',
      title: t('menu.setting.item.communication_provider'),
      className: 'text-start',
      isExist:
        user?.role &&
        [USER_ROLE.SUPERADMIN, USER_ROLE.ADMIN].includes(user?.role),
    },
    {
      link: '/v5/asset-vendor',
      title: t('menu.setting.item.asset.vendor'),
      className: 'text-start',
      isExist:
        user?.role &&
        [USER_ROLE.SUPERADMIN, USER_ROLE.ADMIN].includes(user?.role),
    },
    {
      link: '/asset-management',
      title: t('menu.setting.item.temperature_device'),
      className: 'text-start',
      isExist: user?.role && [USER_ROLE.SUPERADMIN].includes(user?.role),
    },
    {
      link: '/v5/budget-source',
      title: t('menu.setting.item.budget_source'),
      className: 'text-start',
      isExist: hasPermission('budget-source-view'),
    },
    {
      link: '/v5/period-of-stock-taking',
      title: t('menu.setting.item.stocktacking_period'),
      className: 'text-start',
      isExist:
        user?.role &&
        [USER_ROLE.SUPERADMIN, USER_ROLE.ADMIN].includes(user?.role),
    },
    {
      variant: 'rightMenu',
      link: null,
      title: t('menu.setting.item.annual_planning.title'),
      className: 'text-start',
      isExist:
        user?.role &&
        [USER_ROLE.SUPERADMIN, USER_ROLE.ADMIN].includes(user?.role),
      rNavChild: [
        {
          link: '/master-perencanaan-tahunan/sasaran',
          title: t('menu.setting.item.annual_planning.item.pusdatin_target'),
          className: 'hover:bg-gray-200 text-start',
        },
        {
          link: '/master-perencanaan-tahunan/ip',
          title: t('menu.setting.item.annual_planning.item.national_ip'),
          className: 'hover:bg-gray-200 text-start',
        },
        {
          link: '/master-perencanaan-tahunan/kelompok-sasaran',
          title: t('menu.setting.item.annual_planning.item.group_target'),
          className: 'hover:bg-gray-200 text-start',
        },
        {
          link: '/master-perencanaan-tahunan/jumlah-pemberian',
          title: t('menu.setting.item.annual_planning.item.amount_of_giving'),
          className: 'hover:bg-gray-200 text-start',
        },
      ],
    },
    {
      link: '/freeze-transaction',
      title: t('menu.setting.item.freeze_transaction'),
      className: 'text-start',
      isExist: user?.role && [USER_ROLE.ADMIN_FREEZE].includes(user?.role),
    },
    {
      link: '/cold-chain-equipment',
      title: 'Cold Chain Equipment',
      className: 'text-start',
      isExist:
        user?.role &&
        [USER_ROLE.SUPERADMIN, USER_ROLE.ADMIN].includes(user?.role),
    },
    {
      link: '/v5/entity-material-bulk',
      title: t('menu.setting.item.import_material_entity'),
      className: 'text-start',
      isExist: hasPermission('entity-mutate'),
    },
  ]
}


export const menuAssetChilds = (t: TFunction) => [
  {
    link: '/v5/asset',
    title: t('menu.asset.item.temperature'),
    className: 'ui:text-start',
  },
  {
    link: '/v5/asset-inventory',
    title: t('menu.asset.item.inventory'),
    className: 'ui:text-start',
  },
  {
    link: '/dashboard/cold-storage-capacity/v2',
    title: t('menu.asset.item.storage_capacity_dashboard'),
    className: 'ui:text-start',
    isExist: isDevelopment({ isAlsoStaging: true }),
  },
  {
    link: '/capacity-annual-planning',
    title: t('menu.asset.item.capacity_annual_planning'),
    className: 'ui:text-start',
    isExist: isDevelopment({ isAlsoStaging: true }),
  },
]
