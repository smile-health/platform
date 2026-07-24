import { InformationCircleIcon } from '@heroicons/react/24/solid'
import { useQuery } from '@tanstack/react-query'
import DashboardBox from '#pages/dashboard/components/DashboardBox'
import DashboardDataTable from '#pages/dashboard/components/DashboardDataTable'
import { useTranslation } from 'react-i18next'

import usePagination from '../../hooks/usePagination'
import { handleFilter } from '../dashboard-rabies.helper'
import { getDashboardRabiesEntities } from '../dashboard-rabies.service'
import { TDashboardRabiesFilter, TInformation } from '../dashboard-rabies.type'
import { MainColumn } from './DashboardRabiesEntityColumns'

type Props = Readonly<{
  enabled?: boolean
  filter: TDashboardRabiesFilter
  setInformation: (information: TInformation) => void
}>

export default function DashboardRabiesEntity({
  filter,
  enabled = false,
  setInformation,
}: Props) {
  const {
    t,
    i18n: { language },
  } = useTranslation('dashboardRabies')

  const { page, paginate, handleChangePage, handleChangePaginate } =
    usePagination()

  const params = handleFilter(filter)
  const {
    data: entities,
    isFetching,
  } = useQuery({
    queryKey: ['rabies-detail', params, page, paginate, language],
    queryFn: () => getDashboardRabiesEntities({ ...params, page, paginate }),
    enabled,
  })

  return (
    <DashboardBox.Root id="dashboard-rabies-details">
      <DashboardBox.Header bordered size="small">
        <div className="ui-flex ui-justify-center ui-items-center ui-gap-1.5">
          <h4>
            <strong>{t('title.detail')}</strong>
          </h4>
          <button
            onClick={() =>
              setInformation({
                title: t('title.detail'),
                description: t('description.detail'),
              })
            }
          >
            <InformationCircleIcon className="ui-size-5" />
          </button>
        </div>
      </DashboardBox.Header>
      <DashboardBox.Body className="ui-bg-gray-50">
        <div className="ui-mb-4 ui-mx-auto ui-w-fit">
          <h6 className="ui-text-sm ui-text-center">
            {t('title.subtitle_detail')}
          </h6>
        </div>
        <DashboardBox.Content isLoading={isFetching}>
          <DashboardDataTable
            columns={MainColumn({ t, language })}
            data={entities?.data ?? []}
            page={page}
            paginate={paginate}
            totalItem={entities?.total_item}
            totalPage={entities?.total_page}
            listPagination={entities?.list_pagination}
            onChangePage={handleChangePage}
            onChangePaginate={handleChangePaginate}
            isLoading={isFetching}
          />
        </DashboardBox.Content>
      </DashboardBox.Body>
    </DashboardBox.Root>
  )
}
