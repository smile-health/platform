import { TFunction } from 'i18next'

import DashboardDiscardEntity from './sections/DashboardDiscardEntity'
import DashboardDiscardLocation from './sections/DashboardDiscardLocation'
import DashboardDiscardMaterial from './sections/DashboardDiscardMaterial'
import DashboardDiscardOverall from './sections/DashboardDiscardOverall'

export enum DashboardDiscardTabType {
  All = 'overall',
  Material = 'material',
  Entity = 'entity',
  Location = 'location',
}

export function getDashboardTabs(t: TFunction<'dashboardDiscard'>) {
  return [
    {
      id: DashboardDiscardTabType.All,
      label: t('tabs.all'),
    },
    {
      id: DashboardDiscardTabType.Material,
      label: 'Material',
    },
    {
      id: DashboardDiscardTabType.Entity,
      label: t('tabs.entity'),
    },
    {
      id: DashboardDiscardTabType.Location,
      label: t('tabs.location'),
    },
  ]
}

export const DASHBOARD_DISCARD_CONTENT = {
  [DashboardDiscardTabType.All]: DashboardDiscardOverall,
  [DashboardDiscardTabType.Material]: DashboardDiscardMaterial,
  [DashboardDiscardTabType.Entity]: DashboardDiscardEntity,
  [DashboardDiscardTabType.Location]: DashboardDiscardLocation,
}
