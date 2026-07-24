'use client'

import React, { useMemo } from 'react'
import { DataTable } from '#components/data-table'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid'
import { parseAsInteger, useQueryStates } from 'nuqs'
import { useTranslation } from 'react-i18next'

import BmhpApprovalProvinceDetailTabs from '../../components/BmhpApprovalProvinceDetailTabs'
import { useCompletenessMonitoring } from '../../tabs/completeness-monitoring/hooks/useCompletenessMonitoring'
import { useCompletenessTableColumns } from '../../tabs/completeness-monitoring/hooks/useCompletenessTableColumns'
import {
    TCompletenessItem,
    TExaminationColumn,
} from '../../tabs/completeness-monitoring/libs/completeness-monitoring.type'

// ── Page Content ──────────────────────────────────────────────────────────────

const CompletenessMonitoringProvinceDetailPageContent: React.FC = () => {
    const { t } = useTranslation(['bmhpApproval'])
    const { query } = useSmileRouter()
    const idFromUrl = query.year_id ? Number(query.year_id) : undefined

    // ── Pagination ─────────────────────────────────────────────────────────────
    const [pagination] = useQueryStates(
        {
            page: parseAsInteger.withDefault(1),
            item_per_page: parseAsInteger.withDefault(10),
        },
        { history: 'push' }
    )

    // ── Query params ───────────────────────────────────────────────────────────
    const params = useMemo(
        () => ({
            program_plan_id: idFromUrl ?? 0,
        }),
        [idFromUrl]
    )

    const { data, isLoading, isFetching } = useCompletenessMonitoring({
        params,
        enabled: !!idFromUrl,
    })

    useSetLoadingPopupStore(isLoading || isFetching)

    // ── Inject si_no & derive unique examination columns ───────────────────────
    const { dataWithNo, examinationColumns } = useMemo<{
        dataWithNo: TCompletenessItem[]
        examinationColumns: TExaminationColumn[]
    }>(() => {
        const rows = data?.data ?? []
        const offset = (pagination.page - 1) * pagination.item_per_page
        const dataWithNo = rows.map((row, idx) => ({
            ...row,
            si_no: offset + idx + 1,
        }))

        const columnMap = new Map<number, TExaminationColumn>()
        rows.forEach((row) => {
            row.screenings.forEach((s) => {
                if (!columnMap.has(s.examination_id)) {
                    columnMap.set(s.examination_id, {
                        examination_id: s.examination_id,
                        examination_name: s.examination_name,
                    })
                }
            })
        })

        return {
            dataWithNo,
            examinationColumns: Array.from(columnMap.values()).sort(
                (a, b) => a.examination_id - b.examination_id
            ),
        }
    }, [data, pagination.page, pagination.item_per_page])

    const tableColumns = useCompletenessTableColumns(examinationColumns)

    return (
        <div className="ui-mt-6">
            <DataTable
                data={dataWithNo}
                columns={tableColumns}
                isLoading={isLoading || isFetching}
                isSticky
                stickyColumns={[0, 1, 2 + examinationColumns.length]}
            />

            {/* Status Legend */}
            <div className="ui-flex ui-items-center ui-gap-6 ui-mt-3 ui-text-sm">
                <span className="ui-font-semibold">
                    {t('bmhpApproval:completeness.legend_status')}:
                </span>
                <span className="ui-flex ui-items-center ui-gap-1.5">
                    <XCircleIcon className="ui-w-5 ui-h-5 ui-text-danger-500" />
                    {t('bmhpApproval:completeness.legend_not_submitted')}
                </span>
                <span className="ui-flex ui-items-center ui-gap-1.5">
                    <CheckCircleIcon className="ui-w-5 ui-h-5 ui-text-success-500" />
                    {t('bmhpApproval:completeness.legend_done')}
                </span>
                <span className="ui-flex ui-items-center ui-gap-1.5">
                    <span className="ui-inline-flex ui-items-center ui-justify-center ui-w-9 ui-h-6 ui-rounded-full ui-bg-neutral-100 ui-text-neutral-400 ui-text-xs ui-font-medium">
                        N/A
                    </span>
                    {t('bmhpApproval:completeness.legend_na')}
                </span>
            </div>
        </div>
    )
}

// ── Wrapped with province detail tabs ─────────────────────────────────────────

const CompletenessMonitoringProvinceDetailPage: React.FC = () => {
    return (
        <BmhpApprovalProvinceDetailTabs>
            <CompletenessMonitoringProvinceDetailPageContent />
        </BmhpApprovalProvinceDetailTabs>
    )
}

export default CompletenessMonitoringProvinceDetailPage
