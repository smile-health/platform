import { useMemo } from 'react'
import { DataTable } from '#components/data-table'
import {
    Pagination,
    PaginationContainer,
    PaginationInfo,
    PaginationSelectLimit,
} from '#components/pagination'

/* ================= types ================= */

interface Column {
    header: string
    accessorKey?: string
    meta?: any
}

interface PaginationProps {
    page: number
    paginate: number
    total: number
    onChangePage: (page: number) => void
    onChangePaginate: (limit: number) => void
}

interface MicroplanningDashboardTableProps {
    name: any
    columns: Column[]
    data?: any[] | null
    pagination: PaginationProps
}

/* ================= helpers ================= */

function computeRegionRowSpan(rows: any[]) {
    const result = rows.map((row) => ({
        ...row,
        regionRowSpan: 1,
    }))

    let i = 0
    while (i < result.length) {
        const region = result[i].region
        let j = i + 1

        while (j < result.length && result[j].region === region) {
            j++
        }

        const span = j - i

        if (span > 1) {
            result[i].regionRowSpan = span
            for (let k = i + 1; k < j; k++) {
                result[k].regionRowSpan = 0
            }
        }

        i = j
    }

    return result
}

function withRegionColumnMeta(meta?: any) {
    return {
        ...(meta ?? {}),
        rowSpan: (row: any) =>
            row.original?.regionRowSpan ?? 1,
        cellClassName: (row: any) =>
            row.original?.regionRowSpan === 0
                ? 'ui-hidden'
                : 'ui-text-left ui-font-semibold ui-align-middle',
    }
}

function withTypeColumnMeta(meta?: any) {
    return {
        ...(meta ?? {}),
        headerClassName:
            meta?.headerClassName ?? 'ui-text-left',
    }
}

function withCenteredColumnMeta(meta?: any) {
    return {
        ...(meta ?? {}),
        headerClassName:
            meta?.headerClassName ?? 'ui-text-center',
    }
}

/* ================= component ================= */

export default function MicroplanningDashboardTable({
    name,
    columns,
    data,
    pagination,
}: Readonly<MicroplanningDashboardTableProps>) {
    const {
        page,
        paginate,
        total,
        onChangePage,
        onChangePaginate,
    } = pagination

    const safeData = Array.isArray(data) ? data : []

    /* preprocess rowspan */
    const tableData = useMemo(
        () => computeRegionRowSpan(safeData),
        [safeData],
    )

    const totalPages = Math.ceil(total / paginate)

    /* enhance column meta */
    const enhancedColumns = useMemo(
        () =>
            columns.map((col) => {
                if (col.accessorKey === 'region') {
                    return {
                        ...col,
                        meta: withRegionColumnMeta(col.meta),
                    }
                }

                if (col.accessorKey === 'type') {
                    return {
                        ...col,
                        meta: withTypeColumnMeta(col.meta),
                    }
                }

                return {
                    ...col,
                    meta: withCenteredColumnMeta(col.meta),
                }
            }),
        [columns],
    )

    const stickyColumns = useMemo(() => {
        if (name === 'vaccine') return [0, 1]
        return [0]
    }, [name])

    return (
        <>
            <DataTable
                id="immunization-table"
                columns={enhancedColumns as any}
                data={tableData}
                isStriped
                isSticky
                isHighlightedOnHover
                withColspan
                withBorderRight
                stickyColumns={stickyColumns}
            />

            <PaginationContainer className="ui-mt-4">
                <PaginationSelectLimit
                    size={paginate}
                    onChange={onChangePaginate}
                />

                <PaginationInfo
                    size={paginate}
                    currentPage={page}
                    total={total}
                />

                <Pagination
                    totalPages={totalPages}
                    currentPage={page}
                    onPageChange={onChangePage}
                />
            </PaginationContainer>
        </>
    )
}
