import { useEffect, useState } from 'react'
import { TabsList, TabsRoot, TabsTrigger } from '#components/tabs'
import DashboardBox from './DashboardBox'
import cx from '#lib/cx'

import { TDashboardTabs } from '../dashboard.type'
import DashboardMicroplanningTargetConsumption from '../dashboard-microplanning/sections/DashboardMicroplanningTargetConsumption'
import MicroplanningDashboardTable from '../dashboard-microplanning/schemas/dashboardMicroplanningListTable'
import { MicroplanningDashboardType } from '../dashboard-microplanning/dashboard-microplanning.constant'

type Props<T extends string> = Readonly<{
    id: string
    title: string
    subtitle?: string

    tabList?: TDashboardTabs<T>[]
    setTab?: (tab: T) => void
    defaultActiveTab?: string

    appearance?: boolean
    targetConsumptionVaccinationData?: any

    dataTable?: {
        name?: string
        columns?: any
        dataSource?: any
        pagination?: any
    }

    filter?: any
}>

export default function DashboardMicroplanningTabs<T extends string>({
    id,
    title,
    subtitle,
    tabList = [],
    setTab,
    defaultActiveTab,
    appearance,
    targetConsumptionVaccinationData,
    dataTable = {},
    filter,
}: Props<T>) {
    /* ================= helpers ================= */

    const isTabDisabled = (id: string) => {
        if (!filter) return false

        switch (id) {
            case 'province':
                return false
            case 'city':
                return !filter.province?.length
            case 'district':
                return !filter.city?.length
            case 'village':
                return !filter['sub_district']?.length
            default:
                return false
        }
    }

    const getValidDefaultTab = () => {
        const firstEnabledTab = tabList.find(
            (tab) => !isTabDisabled(tab.id),
        )

        return (
            firstEnabledTab?.id ??
            tabList[0]?.id ??
            ''
        )
    }

    const getTabFromFilter = () => {
        if (!filter) return defaultActiveTab ?? getValidDefaultTab()

        if (filter.village?.length) return MicroplanningDashboardType.Village
        if (filter['sub_district']?.length) return MicroplanningDashboardType.Subdistrict
        if (filter.city?.length) return MicroplanningDashboardType.Regency

        return MicroplanningDashboardType.Province
    }

    /* ================= state ================= */

    const [activeTab, setActiveTab] = useState<string>(
        defaultActiveTab ?? getValidDefaultTab(),
    )

    /* ================= effects ================= */

    // sync tab with filter
    useEffect(() => {
        const nextTab = getTabFromFilter()

        if (!nextTab || nextTab === activeTab) return

        setActiveTab(nextTab)
        setTab?.(nextTab as T)
    }, [filter])

    // reset pagination when filter changes
    useEffect(() => {
        if (dataTable.pagination?.page !== 1) {
            dataTable.pagination?.onChangePage?.(1)
        }
    }, [filter, activeTab])

    /* ================= render ================= */

    if (appearance) {
        return (
            <DashboardMicroplanningTargetConsumption
                id={id}
                title={title}
                subtitle={subtitle}
                tabList={tabList}
                setTab={setTab}
                defaultActiveTab={defaultActiveTab}
                name={dataTable.name}
                columns={dataTable.columns}
                dataTable={dataTable.dataSource}
                pagination={dataTable.pagination}
                filter={filter}
                targetConsumptionVaccinationData={
                    targetConsumptionVaccinationData
                }
            />
        )
    }

    return (
        <DashboardBox.Root id={id}>
            <DashboardBox.Header bordered>
                <h4>{title}</h4>
                {subtitle && (
                    <p className={cx('ui-text-base', 'ui-text-dark-teal')}>
                        {subtitle}
                    </p>
                )}
            </DashboardBox.Header>

            <div className="ui-relative ui-p-4 ui-bg-gray-50">
                <TabsRoot
                    variant="pills"
                    value={activeTab}
                    align="stretch"
                    onValueChange={(value) => {
                        if (isTabDisabled(value)) return

                        setActiveTab(value)
                        setTab?.(value as T)
                    }}
                >
                    <div className="ui-flex ui-items-center ui-gap-4 mb-5">
                        <TabsList className="ui-grid-cols-4 ui-grow">
                            {tabList.map((item) => {
                                const disabled = isTabDisabled(item.id)

                                return (
                                    <TabsTrigger
                                        key={item.id}
                                        value={item.id}
                                        disabled={disabled}
                                        className="ui-justify-center ui-text-sm ui-px-2 ui-h-10"
                                    >
                                        {item.label}
                                    </TabsTrigger>
                                )
                            })}
                        </TabsList>
                    </div>

                    <MicroplanningDashboardTable
                        name={dataTable.name}
                        columns={dataTable.columns}
                        data={dataTable.dataSource}
                        pagination={dataTable.pagination}
                    />
                </TabsRoot>
            </div>
        </DashboardBox.Root>
    )
}