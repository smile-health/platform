import { ColumnDef } from '@tanstack/react-table'
import { TFunction } from 'i18next'
import { TMicroplanning } from './dashboard-microplanning.type'
import { TDashboardTabs } from '../dashboard.type'

export enum MicroplanningDashboardType {
  Province = 'province',
  Regency = 'city',
  Subdistrict = 'district',
  Village = 'village',
}

export const microplanningRegionTabs = (
  t: TFunction<'dashboardMicroplanning'>
): Array<TDashboardTabs<MicroplanningDashboardType>> => [
    {
      id: MicroplanningDashboardType.Province,
      label: t('title.tabs.province'),
    },
    {
      id: MicroplanningDashboardType.Regency,
      label: t('title.tabs.regency'),
    },
    {
      id: MicroplanningDashboardType.Subdistrict,
      label: t('title.tabs.subdistrict'),
    },
    {
      id: MicroplanningDashboardType.Village,
      label: t('title.tabs.village'),
    },
  ]

export const tableTargetConsumptionVaccineColumns = (
  t: TFunction<'dashboardMicroplanning'>,
  ageColumns?: any
) => {
  const schema: Array<ColumnDef<TMicroplanning>> = [
    {
      accessorKey: 'region',
      header: t('column.region'),
      minSize: 300,
    },
    {
      accessorKey: 'type',
      header: t('title.dashboard.target-consumption-age'),
    },
    {
      header: t("column.vaccine"),
      columns: ageColumns.map((c: any) => ({
        header: c.header,
        accessorKey: c.accessorKey,
        meta: {
          headerClassName: 'ui-bg-slate-200'
        }
      })),
    },
  ]

  return schema
}

export const tableTotalTargetColumns = (
  t: TFunction<'dashboardMicroplanning'>,
  apiColumns: any[],
) => {
  const schema: Array<ColumnDef<TMicroplanning>> = [
    { header: t('column.region'), accessorKey: 'region', minSize: 300 },
    ...apiColumns.map((group) => ({
      header: t(`column.${group.group}` as unknown as any), // langsung pakai dari response
      columns: group.vaccines.map((vaccine: any) => ({
        header: vaccine.name,       // nama vaksin
        accessorKey: vaccine.key,   // key sesuai API
        meta: {
          headerClassName: 'ui-bg-slate-200',
          headerSubComponent: (
            <div className="ui-text-xs ui-text-gray-500 ui-font-normal" >
              {t(`column.group.${vaccine.ageGroup}` as unknown as any)}
            </div>
          ),
        },
      })),
    })),
  ]

  return schema
}