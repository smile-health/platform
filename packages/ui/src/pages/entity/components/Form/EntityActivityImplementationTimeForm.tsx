import { useCallback, useContext, useEffect } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { Spinner } from '#components/spinner'
import { toast } from '#components/toast'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import type {
  TDetailActivityDate,
  TUpdateActivityImplementationTimeBody,
} from '#types/entity'
import { FormProvider, useFieldArray, useForm } from 'react-hook-form'
import type { SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import useEntityActivityDataFormProcessing from '../../hooks/useEntityActivityDataFormProcessing'
import { useEntityActivityImplementationForm } from '../../hooks/useEntityActivityImplementationForm'
import { activityImpelemtationTimeSchema } from '../../schema/EntitySchemaForm'
import EntityDetailToEditContext from '../../utils/entity-detail-to-edit-context'
import EntityDetailTitleBox from '../EntityDetailTitleBox'
import EntityActivityImplementationTimeInputDates from './EntityActivityImplementationTimeInputDates'

type Props = {
  existingData: TDetailActivityDate[][] | []
}

const EntityActivityImplementationTimeForm: React.FC<Props> = ({
  existingData,
}) => {
  const { setIsEdit } = useContext(EntityDetailToEditContext)
  const { t } = useTranslation(['common', 'entity'])

  const methods = useForm<TUpdateActivityImplementationTimeBody>({
    resolver: yupResolver(activityImpelemtationTimeSchema(t)),
    mode: 'onChange',
    defaultValues: { activities: existingData },
  })

  const { handleSubmit, control, watch, formState: { errors } } = methods

  useFieldArray({ control, name: 'activities' })

  const {
    isFetchingNextPage,
    fetchNextPage,
    isLoadingActivities,
    hasNextPage,
  } = useEntityActivityDataFormProcessing({ existingData, methods })

  const handleScroll = useCallback(() => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement
    const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100

    if (scrollPercentage >= 100 && hasNextPage) {
      fetchNextPage()
    }
  }, [hasNextPage, fetchNextPage])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const { onSubmitForm, isPending } = useEntityActivityImplementationForm(setIsEdit)

  const onSubmitActivityDates: SubmitHandler<TUpdateActivityImplementationTimeBody> = (values) => {
    onSubmitForm(values)
  }

  const renderActivityFields = () => {
    return watch('activities')?.map(
      (field: TDetailActivityDate[] & { id: string }, idx: number) => (
        <ActivityField key={field[0]?.id} field={field} idx={idx} />
      )
    )
  }

  if (errors?.activities?.root?.type === 'AtLeastOneRequired') {
    toast.danger({
      description: t('entity:form.errors.at_least_one_required'),
    })
  }

  useSetLoadingPopupStore(isPending)

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmitActivityDates)} method="post">
        <EntityDetailTitleBox
          title={t('entity:detail.tabs_title.activity_implementation_time')}
          isSubmitting={isPending}
        />
        <div className="ui-mt-6 ui-space-y-4 ui-w-full ui-flex ui-flex-col">
          {renderActivityFields()}
        </div>
        {(isFetchingNextPage || isLoadingActivities) && (
          <LoadingSpinner />
        )}
      </form>
    </FormProvider>
  )
}

const ActivityField: React.FC<{
  field: TDetailActivityDate[] & { id: string }
  idx: number
}> = ({ field, idx }) => {
  return (
    <div className="ui-border ui-border-neutral-300 ui-rounded-md ui-p-4">
      <div className="ui-flex ui-justify-between ui-items-start ui-w-auto ui-text-base">
        <div className="ui-w-64 ui-mr-4 ui-text-neutral-500 ui-text-base">
          {field[0]?.name}
        </div>
        <div className="ui-w-auto ui-mr-4">:</div>
        <EntityActivityImplementationTimeInputDates
          id={field[0]?.id as number}
          idx={idx}
          fieldObj={field}
        />
      </div>
    </div>
  )
}

const LoadingSpinner: React.FC = () => (
  <div className="ui-my-4 ui-h-5 ui-w-full ui-flex ui-justify-center ui-items-center ui-text-dark-blue">
    <Spinner className="ui-h-8 ui-w-8" />
  </div>
)

export default EntityActivityImplementationTimeForm