import Link from 'next/link'
import { ColumnDef, Row } from '@tanstack/react-table'
import { Button } from '#components/button'
import ActiveLabel from '#components/modules/ActiveLabel'
import { DetailPopulation, YearPopulation } from '#types/population'
import { parseDateTime } from '#utils/date'
import { formatNominal } from '#utils/number'
import { TFunction } from 'i18next'

type TColumns = {
  t: TFunction<['common', 'population']>
  size: number
  page: number
  lang: string
  setLinkGlobal: (link: string) => string
}

export const columnsListYearPopulation = ({
  t,
  size,
  page,
  lang,
  setLinkGlobal,
}: TColumns): ColumnDef<YearPopulation>[] => [
  {
    header: 'No.',
    accessorKey: 'no',
    size: 40,
    minSize: 40,
    cell: ({ row: { index } }) => (page - 1) * size + (index + 1),
  },
  {
    header: t('common:date.year'),
    accessorKey: 'year',
    minSize: 200,
  },
  {
    header: 'Status',
    accessorKey: 'status',
    size: 160,
    cell: ({ row }) => <ActiveLabel isActive={row.original.status === 1} />,
  },
  {
    header: t('common:updated_by'),
    size: 240,
    cell: ({ row }) => (
      <div>
        <p>{row.original.user_updated_by.fullname}</p>
        <p className="ui-uppercase">
          {parseDateTime(row.original.updated_at, 'DD MMM YYYY HH:mm', lang)}
        </p>
      </div>
    ),
  },
  {
    header: t('common:action'),
    accessorKey: 'action',
    size: 40,
    maxSize: 40,
    cell: ({ row }) => {
      return (
        <div className="ui-flex ui-gap-2">
          <Button
            asChild
            id="btn-link-population-detail"
            size="sm"
            variant="subtle"
          >
            <Link
              href={setLinkGlobal(
                `/v5/global-settings/population/${row.original.year}`
              )}
            >
              Detail
            </Link>
          </Button>
        </div>
      )
    },
  },
]

export const columnsDetailPopulation = ({
  t,
  targetGroups,
}: {
  t: TFunction<['common', 'population']>
  targetGroups: string[]
}): ColumnDef<DetailPopulation>[] => [
  {
    header: 'No.',
    accessorKey: 'no',
    size: 40,
    cell: ({ row: { index } }) => index + 1,
  },
  {
    header: t('common:form.city.label'),
    accessorKey: 'entity',
    size: 220,
    cell: ({ row }) => {
      if (row.original.entity.name) {
        return (
          <div className="ui-space-y-1">
            <p className="ui-font-bold">{row.original.entity.name}</p>
            <p className="ui-text-[#737373] ui-truncate">
              {row.original.entity.province}, {row.original.entity.regency}
            </p>
          </div>
        )
      }

      return (
        <div>
          <p className="ui-font-bold">{row.original.entity.province}</p>
        </div>
      )
    },
  },
  ...targetGroups.map((target, index) => ({
    header: target,
    cell: ({ row }: { row: Row<DetailPopulation> }) => {
      const population = row.original.population[index]
      if (!population) return '0'

      const total = formatNominal(population.population_number)
      return total
    },
  })),
  {
    header: t('common:updated_by'),
    cell: ({ row }) =>
      row.original.user_updated_at ? (
        <div>
          <p>{row.original.user_updated_by.fullname}</p>
          <p className="ui-uppercase">
            {parseDateTime(row.original.user_updated_at, 'DD/MM/YYYY HH:mm')}
          </p>
        </div>
      ) : (
        '-'
      ),
    size: 180,
  },
]
