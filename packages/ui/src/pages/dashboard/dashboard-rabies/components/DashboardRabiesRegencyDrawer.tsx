import { useQuery } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '#components/button'
import { DataTable } from '#components/data-table'
import { Drawer, DrawerContent, DrawerHeader } from '#components/drawer'
import XMark from '#components/icons/XMark'
import { numberFormatter } from '#utils/formatter'
import { useTranslation } from 'react-i18next'

import { getGenderList, getMethodList } from '../dashboard-rabies.constant'
import { getDashboardRabiesRegencies } from '../dashboard-rabies.service'
import {
  DashboardRabiesLocationParams,
  TProvinceItem,
} from '../dashboard-rabies.type'

const DashboardRabiesRegencyTitleBox = ({
  title,
  value,
  className,
}: {
  title: string
  value: string | number
  className?: string
}) => (
  <div className={className}>
    <p className="ui-text-neutral-500">{title}</p>
    <p className="ui-font-bold">{value}</p>
  </div>
)

type Props = Readonly<{
  open?: boolean
  onLeave?: VoidFunction
  sequences: Array<string>
  params: DashboardRabiesLocationParams
  province?: TProvinceItem | null
}>

export default function DashboardRabiesRegencyDrawer({
  open = false,
  onLeave,
  province,
  sequences,
  params,
}: Props) {
  const {
    t,
    i18n: { language },
  } = useTranslation('dashboardRabies')
  const selectedMethod = getMethodList(t).find(
    (m) => Number(m.value) === Number(params.vaccine_method)
  )
  const selectedGender = getGenderList(t).find(
    (g) => Number(g.value) === Number(params.gender)
  )
  const {
    data: regencies,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['rabies-regency', params],
    queryFn: () => getDashboardRabiesRegencies(params),
    enabled: Boolean(province?.id),
  })

  const formatNumber = (value?: number) => {
    return numberFormatter(value ?? 0, language)
  }

  const regencySequences = regencies?.headers ?? []

  const {
    id: provinceId,
    name: provinceName,
    values: provinceData,
  } = province ?? {}
  const vaccineData = provinceData

  return (
    <Drawer
      open={open}
      closeOnOverlayClick={false}
      placement="bottom"
      size="full"
      sizeHeight="lg"
    >
      <DrawerHeader className="ui-text-center ui-relative">
        <div className="ui-flex ui-flex-col ui-gap-2">
          <h6 className="ui-text-xl ui-text-primary-800 ui-font-medium">
            {t('title.vaccination_detail')}
          </h6>
          <p className="ui-text-sm ui-text-neutral-500">
            {t('title.gender_with_method', {
              gender: selectedGender
                ? selectedGender.label
                : t('label.all_gender'),
              method: selectedMethod ? selectedMethod.label : t('label.all'),
            })}
          </p>
        </div>
        <Button
          variant="subtle"
          type="button"
          color="neutral"
          className="ui-absolute ui-top-1 ui-right-3"
          onClick={onLeave}
        >
          <XMark />
        </Button>
      </DrawerHeader>
      <DrawerContent className="ui-p-4 ui-space-y-6 ui-border-y ui-border-zinc-200">
        <div className="ui-flex ui-items-start ui-justify-between">
          <DashboardRabiesRegencyTitleBox
            title={t('label.province')}
            value={provinceName ?? ''}
          />
          {sequences.length > 0 &&
            sequences.map((seq, idx) => (
              <DashboardRabiesRegencyTitleBox
                key={`${provinceId}_${seq}`}
                title={seq}
                value={formatNumber(Number(vaccineData?.[idx]?.value ?? 0))}
              />
            ))}
        </div>

        <DataTable
          isSticky
          isLoading={isLoading || isFetching}
          className="ui-h-full ui-max-h-[331px]"
          columns={[
            {
              header: 'No.',
              accessorKey: 'row',
              size: 20,
              maxSize: 20,
            },
            {
              header: t('label.regency'),
              accessorKey: 'name',
            },
            ...regencySequences.map(
              (seq: string): ColumnDef<TProvinceItem> => ({
                header: seq,
                accessorKey: seq,
                cell: ({ row: { original } }) => {
                  const value = original.values.find(
                    (item) => item.label === seq
                  )?.value as number | undefined
                  return numberFormatter(value ?? 0, language)
                },
              })
            ),
          ]}
          data={regencies?.data}
        />
      </DrawerContent>
    </Drawer>
  )
}
