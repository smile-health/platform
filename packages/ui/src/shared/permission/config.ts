import { USER_ROLE } from '#constants/roles'
import { RequestloginResponse } from '#types/auth'

import { FeatureName } from './features'

const {
  SUPERADMIN,
  ADMIN,
  MANAGER,
  OPERATOR,
  OPERATOR_COVID,
  DISTRIBUTOR_COVID,
  MANAGER_COVID,
  CONTACT_CENTER,
  THIRD_PARTY,
  PKC,
  ASIK,
  VENDOR_IOT,
  ADMIN_FREEZE,
  MANUFACTURE,
} = USER_ROLE

type Permission = {
  [K in FeatureName]?: 'query' | 'mutation'
} & {
  [key: string]: 'query' | 'mutation' | undefined
}

const smileRolePermission: {
  [key in USER_ROLE]: Permission
} = {
  [SUPERADMIN]: {
    /* can view global asset dashboard */
    'global-asset-dashboard-view': 'query',
    /* can view global asset management */
    'global-asset-management-view': 'query',
    /* Settings (global)    */
    'global-settings-menu': 'query',
    'global-asset-managements-menu': 'query',
    'population-view': 'query',
    'population-mutate': 'mutation',
    'task-view': 'query',
    'task-mutate': 'mutation',
    /* can view global entity */
    'entity-global-view': 'query',
    /* can create,update,delete global entity, must have entity-global-view permission */
    'entity-global-mutate': 'mutation',
    /* can view global user */
    'user-global-view': 'query',
    /* can create,update,delete global user, must have user-global-view permission */
    'user-global-mutate': 'mutation',
    /* can create,update,delete global user, must have user-view permission */
    'user-mutate': 'mutation',
    /* can view global material */
    'material-global-view': 'query',
    /* can create,update,delete global material, must have material-global-view permission */
    'material-global-mutate': 'mutation',
    /* can view global budget source */
    'budget-source-global-view': 'query',
    /* can create,update,delete global budget source, must have budget-source-global-view permission */
    'budget-source-global-mutate': 'mutation',
    /* can view global manufacturer */
    'manufacturer-global-view': 'query',
    /* can create,update,delete global manufacturer, must have manufacturer-global-view permission */
    'manufacturer-global-mutate': 'mutation',
    /* can create,update,delete global manufacturer, must have manufacturer-global-view permission */
    'model-asset-management-global-view': 'query',
    /* can view global model asset */
    'model-asset-management-global-mutate': 'mutation',
    /* can create,update,delete global model asset, must have asset-vendor-global-view permission */
    'asset-vendor-global-view': 'query',
    /* can view global asset-vendor */
    'asset-vendor-global-mutate': 'mutation',
    /* can create,update,delete global asset-vendor, must have asset-vendor-global-view permission */
    /* can create,update,delete global model asset, must have model-asset-management-global-view permission */
    'asset-type-global-view': 'query',
    /* can view global asset type */
    'asset-type-global-mutate': 'mutation',
    /* can create,update,delete global asset type, must have asset-type-global-view permission */
    'account-view': 'query',

    /* Settings (program) */
    /* can view user */
    'user-view': 'query',
    /* can upaate user status */
    'user-change-status': 'mutation',
    /* can view activity */
    'activity-view': 'query',
    /* can create,update,delete activity, must have activity-view permission */
    'activity-mutate': 'mutation',
    /* can view entity */
    'entity-view': 'query',
    /* can create,update,delete entity, must have entity-view permission */
    'entity-mutate': 'mutation',
    /* can view material */
    'material-view': 'query',
    /* can create,update,delete material, must have material-view permission */
    'material-mutate': 'mutation',
    /* can view manufacturer */
    'manufacturer-view': 'query',
    /* can upaate manufacturer status */
    'manufacturer-change-status': 'mutation',
    /* can view budget source */
    'budget-source-view': 'query',
    /* can view program global */
    'program-global-view': 'query',
    /* can create,update,delete program global, must have program-global-view permission */
    'program-global-mutate': 'mutation',
    /* can view activity program global */
    'activity-global-view': 'query',
    /* can create,update,delete activity program global, must have program-global-view permission */
    'activity-global-mutate': 'mutation',
    'model-asset-management-view': 'query',
    /* can view model asset */
    'model-asset-management-mutate': 'mutation',
    /* can create,update,delete model asset, must have model-asset-management-view permission */
    'asset-vendor-view': 'query',
    /* can view asset-vendor */
    'asset-vendor-mutate': 'mutation',
    /* can create,update,delete asset-vendor, must have asset-vendor-view permission */
    'asset-type-view': 'query',
    /* can view asset type */
    'asset-type-mutate': 'mutation',
    /* can create,update,delete asset-type, must have asset-type-view permission */
    'material-volume-management-global-view': 'query',
    /* can view material volume */
    'material-volume-management-global-mutate': 'mutation',
    /* can create,update,delete material volume, must have material-volume-management-global-view permission */

    /* Annual Planning */
    'annual-planning-target-group-view': 'query',
    'annual-planning-target-group-global-mutate': 'mutation',
    'annual-planning-target-group-mutate': 'mutation',
    'program-plan-view': 'query',
    'program-plan-mutate': 'mutation',
    'annual-planning-substitution-view': 'query',
    'annual-planning-substitution-mutate': 'mutation',
    'annual-planning-process-view-superadmin': 'query',
    'annual-planning-process-mutate-superadmin': 'mutation',
    'annual-planning-process-view': 'query',
    'annual-planning-process-mutate': 'mutation',
    'program-plan-material-ratio-view': 'query',
    'program-plan-material-ratio-mutate': 'mutation',

    'asset-management-view': 'query',
    'communication-provider-view': 'query',
    'coldchain-equipment-view': 'query',

    /** Monitoring Device */
    'monitoring-device-inventory-global-view': 'query',
    'monitoring-device-inventory-global-mutate': 'mutation',

    /** Storage Temperature Monitoring */
    'storage-temperature-monitoring-global-view': 'query',
    'storage-temperature-monitoring-global-cce-view': 'query',
    'storage-temperature-monitoring-global-warehouse-view': 'query',
    'storage-temperature-monitoring-global-mutate': 'mutation',

    /* Period of Stock Taking */
    'period-of-stock-taking-view': 'query',
    'period-of-stock-taking-mutate': 'mutation',

    /* Protocol */
    'protocol-view': 'query',
    'protocol-mutate': 'mutation',

    /* Order */
    'order-list-all': 'query',
    'order-list-filter-entity-type-1': 'query',
    'order-list-filter-entity-type-2': 'query',
    'order-mutate': 'mutation',
    'order-central-mutate': 'mutation',
    'order-enable-select-vendor': 'query',
    'order-enable-select-customer': 'query',
    'stock-view': 'query',
    'stock-opname-view': 'query',
    'stock-opname-enable-select-entity': 'query',
    'stock-opname-mutate': 'mutation',
    'ticketing-system-view': 'query',
    'ticketing-system-create': 'mutation',
    'ticketing-system-location-filter': 'query',
    'ticketing-system-access-packing-link': 'query',
    'ticketing-system-report-canceled': 'query',
    'ticketing-system-vccm-check': 'query',
    'ticketing-system-biofarma-report-submitted': 'query',
    'ticketing-system-hit-manually': 'query',
    'ticketing-system-biofarma-review': 'query',
    'ticketing-system-revised': 'query',
    'ticketing-system-check-revision': 'query',
    'ticketing-system-complete': 'query',
    'ticketing-system-province-report': 'query',
    'ticketing-system-pfizer-report': 'query',

    /*Transaction*/
    'transaction-enable-select-entity': 'query',
    'transaction-enable-select-entity-type-1': 'query',
    'transaction-enable-select-entity-type-2': 'query',
    'transaction-view': 'query',
    'transaction-create': 'mutation',
    'settings-menu': 'query',

    /*Disposal*/
    'disposal-list-view': 'query',
    'disposal-distribution-view': 'query',
    'disposal-distribution-enable-select-entity': 'query',
    'disposal-distribution-mutate': 'mutation',
    'disposal-distribution-process-himself': 'mutation',
    'disposal-self-view': 'query',
    'disposal-self-enable-select-entity': 'query',

    /** Asset */
    'asset-temperature-view': 'query',
    'asset-temperature-mutate': 'mutation',
    'asset-inventory-view': 'query',
    'asset-inventory-mutate': 'mutation',

    /**Notification */
    'notification-global-view': 'query',

    /** Dashboard */
    'dashboard-rabies-main-filter': 'query',
    'dashboard-stock-view': 'query',
    'dashboard-monitoring-transaction-view': 'query',
    'dashboard-stock-taking-view': 'query',
    'dashboard-download-view': 'query',
    'dashboard-order-response-view': 'query',
    'dashboard-order-difference-view': 'query',
    'dashboard-consumption-supply-view': 'query',
    'dashboard-abnormal-stock-view': 'query',
    'dashboard-count-stock-view': 'query',
    'dashboard-stock-availability-view': 'query',
    'dashboard-filling-stock-view': 'query',
    'dashboard-discard-view': 'query',
    'dashboard-monthly-report-view': 'query',
    'dashboard-yearly-report-view': 'query',
    'dashboard-inventory-overview-view': 'query',
    'dashboard-rabies-view': 'query',
    'dashboard-asset-ownership-inventory-view': 'query',
    'dashboard-microplanning-view': 'query',
    'dashboard-annual-commitment-vs-realization-view': 'query',
    'dashboard-asset-cold-storage-capacity-view': 'query',
    'dashboard-enable-select-entity': 'query',

    /** Report */
    'user-activity-view': 'query',
    'stock-book-view': 'query',
    'reconciliation-activity-view': 'query',
    'lplpo-view': 'query',

    /**Reconciliation */
    'reconciliation-view': 'query',
    'reconciliation-mutate': 'mutation',
    'reconciliation-enable-select-entity-type-1': 'query',
    'reconciliation-enable-select-entity-type-2': 'query',
    'reconciliation-enable-select-entity': 'query',

    /**Self Disposal */
    'self-disposal-view': 'query',
    'self-disposal-mutate': 'mutation',
    'self-disposal-enable-select-entity-type-1': 'query',
    'self-disposal-enable-select-entity-type-2': 'query',
    'self-disposal-enable-select-entity': 'query',

    /** Disposal Instruction */
    'disposal-instruction-view': 'query',
    'disposal-instruction-mutate': 'mutation',

    /** PQS */
    'pqs-global-view': 'query',
    'pqs-global-mutate': 'mutation',

    'annual-commitment-view': 'query',
    'annual-commitment-mutate': 'mutation',

    'dashboard-asset-temperature-monitoring-view': 'query',
  },
  [ADMIN]: {
    /* can view global asset dashboard */
    'global-asset-dashboard-view': 'query',
    /* can view global asset management */
    'global-asset-management-view': 'query',

    /* Settings (program) */
    'global-asset-managements-menu': 'query',
    'population-view': 'query',
    'population-mutate': 'mutation',
    'user-view': 'query',
    'user-change-status': 'mutation',
    'activity-view': 'query',
    'activity-mutate': 'mutation',
    'entity-view': 'query',
    'entity-mutate': 'mutation',
    'material-view': 'query',
    'material-mutate': 'mutation',
    'manufacturer-view': 'query',
    'manufacturer-change-status': 'mutation',
    'budget-source-view': 'query',
    'stock-view': 'query',
    'stock-opname-view': 'query',
    'stock-opname-enable-select-entity': 'query',
    'stock-opname-mutate': 'mutation',
    'ticketing-system-view': 'query',
    'ticketing-system-create': 'mutation',
    'ticketing-system-location-filter': 'query',
    'ticketing-system-access-packing-link': 'query',
    'model-asset-management-view': 'query',
    /* can view model asset */
    'model-asset-management-mutate': 'mutation',
    /* can create,update,delete model asset, must have model-asset-management-view permission */
    'asset-vendor-view': 'query',
    /* can view asset-vendor */
    'asset-vendor-mutate': 'mutation',
    /* can create,update,delete asset-vendor, must have asset-vendor-view permission */
    'asset-type-view': 'query',
    /* can view asset type */
    'asset-type-mutate': 'mutation',
    /* can create,update,delete asset-type, must have asset-type-view permission */
    'account-view': 'query',
    'material-volume-management-global-view': 'query',
    /* can view material volume */
    'material-volume-management-global-mutate': 'mutation',
    /* can create,update,delete material volume, must have material-volume-management-global-view permission */

    'asset-type-global-view': 'query',
    'asset-management-view': 'query',
    'communication-provider-view': 'query',
    'coldchain-equipment-view': 'query',

    /* Period of Stock Taking */
    'period-of-stock-taking-view': 'query',
    'period-of-stock-taking-mutate': 'mutation',

    /*Transaction*/
    'transaction-view': 'query',
    'transaction-create': 'mutation',
    'settings-menu': 'query',
    'transaction-enable-select-entity': 'query',
    'transaction-enable-select-entity-type-1': 'query',
    'transaction-enable-select-entity-type-2': 'query',

    /** Asset */
    'asset-temperature-view': 'query',
    'asset-temperature-mutate': 'mutation',
    'asset-inventory-view': 'query',
    'asset-inventory-mutate': 'mutation',

    /* Annual Planning */
    'annual-planning-target-group-view': 'query',
    'annual-planning-target-group-global-mutate': 'mutation',
    'annual-planning-target-group-mutate': 'mutation',
    'program-plan-view': 'query',
    'program-plan-mutate': 'mutation',
    'annual-planning-substitution-view': 'query',
    'annual-planning-substitution-mutate': 'mutation',
    'annual-planning-process-view': 'query',
    'annual-planning-process-mutate': 'mutation',
    'program-plan-material-ratio-view': 'query',
    'program-plan-material-ratio-mutate': 'mutation',

    /** Monitoring Device */
    'monitoring-device-inventory-global-view': 'query',
    'monitoring-device-inventory-global-mutate': 'mutation',

    /** Storage Temperature Monitoring */
    'storage-temperature-monitoring-global-view': 'query',
    'storage-temperature-monitoring-global-cce-view': 'query',
    'storage-temperature-monitoring-global-warehouse-view': 'query',
    'storage-temperature-monitoring-global-mutate': 'mutation',

    /**Notification */
    'notification-global-view': 'query',

    /** Dashboard */
    'dashboard-rabies-main-filter': 'query',
    'dashboard-stock-view': 'query',
    'dashboard-monitoring-transaction-view': 'query',
    'dashboard-stock-taking-view': 'query',
    'dashboard-download-view': 'query',
    'dashboard-order-response-view': 'query',
    'dashboard-order-difference-view': 'query',
    'dashboard-consumption-supply-view': 'query',
    'dashboard-abnormal-stock-view': 'query',
    'dashboard-count-stock-view': 'query',
    'dashboard-stock-availability-view': 'query',
    'dashboard-filling-stock-view': 'query',
    'dashboard-discard-view': 'query',
    'dashboard-monthly-report-view': 'query',
    'dashboard-yearly-report-view': 'query',
    'dashboard-inventory-overview-view': 'query',
    'dashboard-rabies-view': 'query',
    'dashboard-microplanning-view': 'query',
    'dashboard-annual-commitment-vs-realization-view': 'query',
    'dashboard-asset-ownership-inventory-view': 'query',
    'dashboard-asset-temperature-monitoring-view': 'query',
    'dashboard-asset-cold-storage-capacity-view': 'query',
    'dashboard-enable-select-entity': 'query',

    /** Report */
    'user-activity-view': 'query',
    'stock-book-view': 'query',
    'reconciliation-activity-view': 'query',
    'lplpo-view': 'query',

    /**Reconciliation */
    'reconciliation-view': 'query',
    'reconciliation-mutate': 'mutation',
    'reconciliation-enable-select-entity-type-1': 'query',
    'reconciliation-enable-select-entity-type-2': 'query',
    'reconciliation-enable-select-entity': 'query',

    /**Self Disposal */
    'self-disposal-view': 'query',
    'self-disposal-mutate': 'mutation',
    'self-disposal-enable-select-entity-type-1': 'query',
    'self-disposal-enable-select-entity-type-2': 'query',
    'self-disposal-enable-select-entity': 'query',

    /*Disposal*/
    'disposal-list-view': 'query',
    'disposal-distribution-view': 'query',
    'disposal-distribution-enable-select-entity': 'query',
    'disposal-distribution-mutate': 'mutation',
    'disposal-distribution-process-himself': 'mutation',
    'disposal-self-view': 'query',

    /* Protocol */
    'protocol-view': 'query',
    'protocol-mutate': 'mutation',

    /* Order */
    'order-list-all': 'query',
    'order-list-filter-entity-type-1': 'query',
    'order-list-filter-entity-type-2': 'query',
    'order-mutate': 'mutation',
    'order-central-mutate': 'mutation',
    'order-enable-select-vendor': 'query',
    'order-enable-select-customer': 'query',

    /** Disposal Instruction */
    'disposal-instruction-view': 'query',
    'disposal-instruction-mutate': 'mutation',

    /** PQS */
    'pqs-global-view': 'query',
    'pqs-global-mutate': 'mutation',

    'annual-commitment-view': 'query',
    'annual-commitment-mutate': 'mutation',

    /* can create,update,delete global user, must have user-view permission */
    'user-mutate': 'mutation',
  },
  [MANAGER]: {
    /* can view global asset dashboard */
    'global-asset-dashboard-view': 'query',
    /* can view global asset management */
    'global-asset-management-view': 'query',

    'global-asset-managements-menu': 'query',
    'account-view': 'query',
    'stock-opname-view': 'query',
    'stock-opname-mutate': 'mutation',
    'stock-opname-entity-create': 'mutation',
    'ticketing-system-view': 'query',
    'ticketing-system-create': 'mutation',
    'ticketing-system-access-packing-link': 'query',
    'asset-management-view': 'query',
    'communication-provider-view': 'query',
    'coldchain-equipment-view': 'query',
    'stock-view': 'query',
    'stock-view-filter-entity': 'query',
    'order-list-filter-entity-type-1': 'query',
    'order-list-filter-entity-type-2': 'query',

    /** Monitoring Device */
    'monitoring-device-inventory-global-view': 'query',

    /** Storage Temperature Monitoring */
    'storage-temperature-monitoring-global-view': 'query',
    'storage-temperature-monitoring-global-cce-view': 'query',
    'storage-temperature-monitoring-global-warehouse-view': 'query',
    'storage-temperature-monitoring-global-mutate': 'mutation',

    /*Transaction*/
    'transaction-view': 'query',
    'transaction-create': 'mutation',
    /** Asset */
    'asset-temperature-view': 'query',
    'asset-temperature-mutate': 'mutation',
    'asset-inventory-view': 'query',
    'asset-inventory-mutate': 'mutation',

    /**Notification */
    'notification-global-view': 'query',

    /** Dashboard */
    'dashboard-rabies-main-filter': 'query',
    'dashboard-manager-location-filter': 'query',
    'dashboard-stock-view': 'query',
    'dashboard-monitoring-transaction-view': 'query',
    'dashboard-stock-taking-view': 'query',
    'dashboard-download-view': 'query',
    'dashboard-order-response-view': 'query',
    'dashboard-order-difference-view': 'query',
    'dashboard-consumption-supply-view': 'query',
    'dashboard-abnormal-stock-view': 'query',
    'dashboard-count-stock-view': 'query',
    'dashboard-stock-availability-view': 'query',
    'dashboard-filling-stock-view': 'query',
    'dashboard-discard-view': 'query',
    'dashboard-monthly-report-view': 'query',
    'dashboard-yearly-report-view': 'query',
    'dashboard-inventory-overview-view': 'query',
    'dashboard-rabies-view': 'query',
    'dashboard-asset-ownership-inventory-view': 'query',
    'dashboard-microplanning-view': 'query',
    'dashboard-annual-commitment-vs-realization-view': 'query',
    'dashboard-asset-cold-storage-capacity-view': 'query',

    /** Report */
    'report-manager-location-filter': 'query',
    'user-activity-view': 'query',
    'stock-book-view': 'query',
    'reconciliation-activity-view': 'query',
    'lplpo-view': 'query',
    'lplpo-filter': 'query',

    /** Reconciliation */
    'reconciliation-view': 'query',
    'reconciliation-mutate': 'mutation',

    /** Self Disposal */
    'self-disposal-view': 'query',
    'self-disposal-mutate': 'mutation',

    /** Order */
    'order-mutate': 'mutation',

    /**Disposal */
    'disposal-list-view': 'query',
    'disposal-distribution-view': 'query',
    'disposal-distribution-mutate': 'mutation',

    /** Disposal Instruction */
    'disposal-instruction-view': 'query',

    /** Annual Planning */
    'annual-planning-process-view': 'query',
    'annual-planning-process-mutate': 'mutation',

    'dashboard-asset-temperature-monitoring-view': 'query',

    'asset-type-global-view': 'query',
    'asset-type-global-mutate': 'mutation',
  },
  [OPERATOR]: {
    'ticketing-system-access-packing-link': 'query',
    /**Notification */
    'notification-global-view': 'query',
    'stock-opname-mutate': 'mutation',
    'stock-opname-entity-create': 'mutation',
  },
  [OPERATOR_COVID]: {
    'ticketing-system-access-packing-link': 'query',
    /**Notification */
    'notification-global-view': 'query',
  },
  [DISTRIBUTOR_COVID]: {
    'ticketing-system-access-packing-link': 'query',
    'settings-menu': 'query',
    /**Notification */
    'notification-global-view': 'query',
  },
  [MANAGER_COVID]: {
    'order-mutate': 'mutation',
    'ticketing-system-access-packing-link': 'query',
    'settings-menu': 'query',
    /**Notification */
    'notification-global-view': 'query',
  },
  [CONTACT_CENTER]: {
    'ticketing-system-location-filter': 'query',
    'ticketing-system-biofarma-review': 'query',
    'ticketing-system-revised': 'query',
    'ticketing-system-province-report': 'query',
    'ticketing-system-pfizer-report': 'query',
    'settings-menu': 'query',
    /**Notification */
    'notification-global-view': 'query',
  },
  [THIRD_PARTY]: {
    'ticketing-system-access-packing-link': 'query',
    'settings-menu': 'query',
    /**Notification */
    'notification-global-view': 'query',
  },
  [PKC]: {
    'ticketing-system-access-packing-link': 'query',
    'settings-menu': 'query',
    /**Notification */
    'notification-global-view': 'query',
  },
  [VENDOR_IOT]: {
    'global-asset-managements-menu': 'query',
    'monitoring-device-inventory-global-view': 'query',
    'monitoring-device-inventory-global-mutate': 'mutation',
    'annual-commitment-view': 'query',
    'annual-commitment-mutate': 'mutation',
  },
  [MANUFACTURE]: {
    // 'order-enable-select-vendor': 'query',
    'ticketing-system-access-packing-link': 'query',
    'settings-menu': 'query',
    'order-manufacturer-central-mutate': 'mutation',

    /**Notification */
    'notification-global-view': 'query',

    'annual-commitment-view': 'query',
    'annual-commitment-mutate': 'mutation',
  },
  [ASIK]: {
    'ticketing-system-access-packing-link': 'query',
    'settings-menu': 'query',
    /**Notification */
    'notification-global-view': 'query',
  },
  [ADMIN_FREEZE]: {
    'ticketing-system-access-packing-link': 'query',
    'settings-menu': 'query',
    /**Notification */
    'notification-global-view': 'query',
  },
}

export const getRolePermission = (
  user: RequestloginResponse
): Permission | undefined => {
  if (!user.role) return undefined

  return smileRolePermission[user.role]
}
