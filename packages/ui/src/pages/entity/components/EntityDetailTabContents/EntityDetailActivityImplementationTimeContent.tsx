import { useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { useQuery } from '@tanstack/react-query'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { listEntityActivitiesDate } from '#services/entity'
import type { TDetailActivityDate } from '#types/entity'
import { TDetailEntity } from '#types/entity'
import moment from 'moment'
import { useTranslation } from 'react-i18next'

import EntityDetailToEditContext from '../../utils/entity-detail-to-edit-context'
import EntityDetailActivityImplementationTimeData from '../EntityDetailActivityImplementationTimeData'
import EntityDetailActivityImplementationTimeEmptyData from '../EntityDetailActivityImplementationTimeEmptyData'
import EntityDetailLabel from '../EntityDetailLabel'
import EntityDetailTitleBox from '../EntityDetailTitleBox'
import EntityActivityImplementationTimeForm from '../Form/EntityActivityImplementationTimeForm'

type Props = {
  entity?: TDetailEntity
}
const EntityDetailActivityImplementationTimeContent: React.FC<Props> = ({
  entity,
}): JSX.Element => {
  const router = useRouter()
  const [isEdit, setIsEdit] = useState(false)
  const { id } = router.query

  const contextValue = useMemo(
    () => ({ setIsEdit, isEdit, entity: entity ?? null }),
    [setIsEdit, isEdit, entity]
  )

  const {
    data: activitiesDateData,
    isError: isErrorActivities,
    isFetching: isFetchingActivities,
  } = useQuery({
    queryKey: ['entity__activities_date', id],
    queryFn: () => listEntityActivitiesDate(id as string),
    enabled: !!id,
    refetchOnWindowFocus: false,
  })

  useSetLoadingPopupStore(isFetchingActivities)

  const existActivityData =
    activitiesDateData
      ?.toSorted((a, b) => {
        if (!a.start_date && !b.start_date) return 0
        return Number(a.id) - Number(b.id)
      })
      ?.map((item) => ({
        id: item.id,
        activity_id: item.id,
        is_expired:
          !!item?.end_date &&
          moment(item?.end_date)?.valueOf() < moment().startOf('day').valueOf(),
        ...item,
      })) || []

  const processedActivityData = Object.values(
    existActivityData?.reduce(
      (acc, item) => {
        const dataKey = Number(item.activity_id)
        if (!acc[dataKey]) acc[dataKey] = []
        acc[dataKey].push(item as TDetailActivityDate)
        return acc
      },
      {} as Record<string, TDetailActivityDate[]>
    )
  )

  const { t } = useTranslation(['common', 'entity'])

  const renderContent = () => {
    if (isEdit)
      return (
        <EntityActivityImplementationTimeForm
          existingData={processedActivityData}
        />
      )

    return (
      <EntityDetailToEditContext.Provider value={contextValue}>
        <EntityDetailTitleBox
          title={t('entity:detail.tabs_title.activity_implementation_time')}
          useEditButton={processedActivityData?.length > 0}
          isSubmitting={isErrorActivities}
        />
        {processedActivityData?.length === 0 ? (
          <EntityDetailActivityImplementationTimeEmptyData />
        ) : (
          <EntityDetailActivityImplementationTimeData
            existingData={processedActivityData}
          />
        )}
      </EntityDetailToEditContext.Provider>
    )
  }

  return (
    <EntityDetailToEditContext.Provider value={contextValue}>
      <EntityDetailLabel
        title={t('entity:list.column.name')}
        subTitle={entity?.name}
      />
      <div className="ui-p-4 ui-mt-6 ui-border ui-rounded ui-border-neutral-300">
        {renderContent()}
      </div>
    </EntityDetailToEditContext.Provider>
  )
}

export default EntityDetailActivityImplementationTimeContent
