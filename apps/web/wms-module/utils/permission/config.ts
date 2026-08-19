import { ROLE_LABEL } from '@/types/roles';

import { FeatureName } from './features';

const {
  SUPER_ADMIN,
  FACILITY_ADMIN,
  SANITARIAN,
  THIRD_PARTY_ADMIN,
} = ROLE_LABEL;

export type Permission = {
  [K in FeatureName]?: 'query' | 'mutation';
};

export type RoleLabel = keyof typeof ROLE_LABEL;

export type RolePermission = Partial<Record<RoleLabel, Permission>>;

export const rolePermission: Partial<Record<ROLE_LABEL, Permission>> = {
  [SUPER_ADMIN]: {
    /** homepage */
    'homepage-view': 'query',

    // ---- Waste Management Menu ----
    /** waste hierarchy setting */
    'waste-hierarchy-view': 'query',
    'waste-hierarchy-mutate': 'mutation',
    /** waste specification setting */
    'waste-specification-view': 'query',
    'waste-specification-mutate': 'mutation',
    /** manual scale */
    'manual-scale-view': 'query',
    /** bast */
    // 'bast-view': 'query',

    // ---- Asset Inventory Menu ----
    /** manufacture asset management */
    'manufacture-view': 'query',
    'manufacture-mutate': 'mutation',
    /** healthcare asset management */
    'healthcare-view': 'query',
    'healthcare-mutate': 'mutation',
    /** asset type management */
    'asset-type-view': 'query',
    'asset-type-mutate': 'mutation',
    /** budget source management */
    'budget-source-view': 'query',
    'budget-source-mutate': 'mutation',

    // ---- Report and Analitics Menu ----
    /** waste transaction */
    'transaction-view': 'query',
    /** waste tracking */
    'tracking-view': 'query',
    /** logbook */
    'logbook-view': 'query',
    /** transaction monitoring */
    'transaction-monitoring-view': 'query',
    /** user activity */
    'user-activity-view': 'query',

    // ---- Setting Menu ----
    /** entity setting */
    'entity-view': 'query',
    /** user setting */
    'user-setting-view': 'query',
    /** global distance limit setting */
    'global-distance-limit-mutate': 'mutation',
    /** healthcare storage setting */
    'healthcare-storage-location-mutate': 'mutation',
    /** treatment location setting */
    'treatment-location-view': 'query',
    'treatment-location-mutate': 'mutation',
    /** partnership setting */
    'partnership-view': 'query',
    'partnership-mutate': 'mutation',
    // asset dongle setting,
    'asset-dongle-view': 'query',
    'asset-dongle-mutate': 'mutation',
    /** new healthcare asset  */
    'healthcare-asset-view': 'query',
    'healthcare-asset-mutate': 'mutation',
  },
  [FACILITY_ADMIN]: {
    /** homepage */
    'homepage-view': 'query',
    'logistic-kesling-view': 'query',
    // ---- Waste Management Menu ----
    /** waste source setting */
    'waste-source-view': 'query',
    'waste-source-mutate': 'mutation',
    /** printlabel setting */
    'print-label-view': 'query',
    'print-label-mutate': 'mutation',
    /** manual scale */
    'manual-scale-view': 'query',
    /** bast */
    'bast-view': 'query',

    // ---- Asset Inventory Menu ----
    /** healthcare asset management */
    'healthcare-view': 'query',
    'healthcare-mutate': 'mutation',
    'healthcare-activity-mutate': 'mutation',
    /** new healthcare asset  */
    'healthcare-asset-view': 'query',
    'healthcare-asset-mutate': 'mutation',

    // ---- Report and Analitics Menu ----
    /** waste transaction */
    'transaction-view': 'query',
    /** waste tracking */
    'tracking-view': 'query',
    /** logbook */
    'logbook-view': 'query',
    /** transaction monitoring */
    'transaction-monitoring-view': 'query',
    /** user activity */
    'user-activity-view': 'query',

    // ---- Setting Menu ----
    /** about setting */
    'about-query': 'query',
    'about-mutate': 'mutation',
    /** distance limit setting */
    'distance-limit-mutate': 'mutation',
    /** partnership setting */
    'partnership-view': 'query',
    'partnership-mutate': 'mutation',
    /** healthcare storage setting */
    'healthcare-storage-location-mutate': 'mutation',
  },
  [SANITARIAN]: {
    /** homepage */
    'homepage-view': 'query',
    'logistic-kesling-view': 'query',

    // ---- Waste Management Menu ----
    /** waste source setting */
    'waste-source-view': 'query',
    'waste-source-mutate': 'mutation',
    /** printlabel setting */
    'print-label-view': 'query',
    'print-label-mutate': 'mutation',
    /** bast */
    'bast-view': 'query',

    /** healthcare asset management */
    'healthcare-view': 'query',
    'healthcare-mutate': 'mutation',
    'healthcare-activity-mutate': 'mutation',
    /** new healthcare asset  */
    'healthcare-asset-view': 'query',
    'healthcare-asset-mutate': 'mutation',

    // ---- Report and Analitics Menu ----
    /** waste transaction */
    'transaction-view': 'query',
    /** waste tracking */
    'tracking-view': 'query',
    /** logbook */
    'logbook-view': 'query',
    /** transaction monitoring */
    'transaction-monitoring-view': 'query',
    /** user activity */
    'user-activity-view': 'query',

    // ---- Setting Menu ----
    /** about setting */
    'about-query': 'query',
    'about-mutate': 'mutation',
    /** distance limit setting */
    'distance-limit-mutate': 'mutation',
    /** partnership setting */
    'partnership-view': 'query',
    'partnership-mutate': 'mutation',
    /** healthcare storage setting */
    'healthcare-storage-location-mutate': 'mutation',
  },
  [THIRD_PARTY_ADMIN]: {
    /** homepage */
    'homepage-view': 'query',

    // ---- Setting Menu ----
    /** about setting */
    'about-query': 'query',
    'about-mutate': 'mutation',
    /** healthcare partner setting */
    'healthcare-partner-view': 'query',
    /** thirdparty partner setting */
    'thirdparty-partner-view': 'query',
    'thirdparty-partner-mutate': 'mutation',

    /** treatment location setting */
    'treatment-location-view': 'query',
    'treatment-location-mutate': 'mutation',
    /** transport vehicle setting */
    'transport-vehicle-view': 'query',
    'transport-vehicle-mutate': 'mutation',
    /** user operator setting */
    'user-operator-view': 'query',
    'user-operator-mutate': 'mutation',
  },
};
