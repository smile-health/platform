import { useMemo, useState } from 'react'
import { InformationCircleIcon } from '@heroicons/react/24/solid'
import { useQuery } from '@tanstack/react-query'
import { DataTable } from '#components/data-table'
import DashboardBox from '#pages/dashboard/components/DashboardBox'
import { useTranslation } from 'react-i18next'

import DashboardRabiesRadioFilter from '../components/DashboardRabiesRadioFilter'
import DashboardRabiesRegencyDrawer from '../components/DashboardRabiesRegencyDrawer'
import { handleFilter } from '../dashboard-rabies.helper'
import { getDashboardRabiesProvinces } from '../dashboard-rabies.service'
import {
  TDashboardRabiesFilter,
  TInformation,
  TProvinceItem,
} from '../dashboard-rabies.type'
import { MainColumn } from './DashboardRabiesLocationColumns'
import { useMediaQuery } from '#hooks/useMediaQuery'
import { VACCINE_METHOD } from '../dashboard-rabies.constant'

type Props = Readonly<{
  enabled?: boolean
  filter: TDashboardRabiesFilter
  setInformation: (information: TInformation) => void
}>

export default function DashboardRabiesLocation({
  enabled,
  filter,
  setInformation,
}: Props) {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'dashboardRabies'])

  const [method, setMethod] = useState<string>('0')
  const [gender, setGender] = useState<string>('0')
  const [selectedProvince, setSelectedProvince] =
    useState<TProvinceItem | null>(null)

  const params = handleFilter({
    ...filter,
    vaccine_method: method,
    gender,
  })

  const {
    data: provinces,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['rabies-province', params, language],
    queryFn: () =>
      getDashboardRabiesProvinces({ ...params, page: 1, paginate: 1000 }),
    enabled,
  })

  const sequences = useMemo(
    () => provinces?.headers ?? [],
    [provinces?.headers]
  )

  const isBigDekstop = useMediaQuery('(min-width: 1920px)')

  const widthColumn: undefined | number = useMemo(() => {
    if (isBigDekstop && method === VACCINE_METHOD.INTRA_DERMAL) return undefined
    return 110
  }, [isBigDekstop, method])

  return (
    <DashboardBox.Root id="dashboard-rabies-location">
      <DashboardBox.Header bordered size="small">
        <div className="ui-flex ui-justify-center ui-items-center ui-gap-1.5">
          <h4>
            <strong>
              {t('dashboardRabies:title.injection_by_location_and_treatment')}
            </strong>
          </h4>

          <button
            onClick={() =>
              setInformation({
                title: t(
                  'dashboardRabies:title.injection_by_location_and_treatment'
                ),
                description: t('dashboardRabies:description.location'),
              })
            }
          >
            <InformationCircleIcon className="ui-size-5" />
          </button>
        </div>
      </DashboardBox.Header>
      <div className="ui-relative ui-bg-white ui-rounded-b-[inherit] ui-space-y-4">
        <div className="ui-bg-gray-50 ui-p-4">
          <DashboardRabiesRadioFilter
            activeMethod={method}
            activeGender={gender}
            onChangeMethod={setMethod}
            onChangeGender={setGender}
          />
        </div>
        <div className="ui-p-4 !ui-mt-0">
          <DashboardBox.Body padded={false} rounded>
            <DashboardRabiesRegencyDrawer
              key={JSON.stringify(selectedProvince)}
              open={Boolean(selectedProvince?.id)}
              params={{
                ...params,
                page: 1,
                paginate: 1000,
                ...(Boolean(selectedProvince?.id) && {
                  province_ids: String(selectedProvince?.id),
                }),
              }}
              sequences={sequences}
              province={selectedProvince}
              onLeave={() => setSelectedProvince(null)}
            />
            <DashboardBox.Content>
              <DataTable
                isSticky
                isStickyFooter
                withFooter
                isLoading={isLoading || isFetching}
                className="ui-h-[500px]"
                columns={MainColumn({
                  t,
                  sequences,
                  language,
                  onSelectProvince: (province) => setSelectedProvince(province),
                  grandTotals: provinces?.grand_total,
                  widthColumn,
                })}
                data={provinces?.data}
              />
              <div className='ui-mb-4' />
            </DashboardBox.Content>
          </DashboardBox.Body>
        </div>
      </div>
    </DashboardBox.Root>
  )
}
