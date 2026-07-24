// pages/MasterFormPage.tsx
import React, { useEffect, useMemo } from 'react'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { Spinner } from '#components/spinner'
import useSmileRouter from '#hooks/useSmileRouter'
import { UseFormBuilderSchema } from '#pages/bmhp/hooks/useFormBuilder'
import { FeatureName } from '#shared/permission/features/index'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import * as Yup from 'yup'

import MasterForm from './components/MasterForm'
import { MasterContext } from './context/MasterContext'

export interface MasterFormPageProps<T> {
  permission?: FeatureName
  title: string
  context?: {
    isRelocation?: boolean
    isHierarchy?: boolean
  }
  validation: Yup.ObjectSchema<any>
  initialValues: T
  fields: UseFormBuilderSchema
  onSubmit: (data: T, id?: string) => void | Promise<void>
  onReset?: () => void
  fetchData?: (id: string) => Promise<T>
  isLoading?: boolean
}

const MasterFormPage = <T extends Record<string, any>>({
  permission,
  title,
  context = { isRelocation: false, isHierarchy: false },
  validation,
  initialValues,
  fields,
  onSubmit,
  onReset,
  fetchData,
  isLoading = false,
}: MasterFormPageProps<T>) => {
  const { t } = useTranslation(['masterBmhp', 'common'])
  const router = useSmileRouter()
  const { id } = router.query

  const [formData, setFormData] = React.useState<T>(initialValues)
  const [isFetching, setIsFetching] = React.useState(false)

  React.useEffect(() => {
    const loadData = async () => {
      if (id && fetchData) {
        setIsFetching(true)
        try {
          const data = await fetchData(id as string)
          setFormData(data)
        } catch (error) {
          console.error('Error fetching data:', error)
        } finally {
          setIsFetching(false)
        }
      }
    }

    loadData()
  }, [id, fetchData])

  const handleSubmit = async (data: T) => {
    await onSubmit(data, id as string | undefined)
  }

  useEffect(() => {
    console.log(permission)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const contextValue = useMemo(
    () => ({
      isRelocation: context.isRelocation ?? false,
      isHierarchy: context.isHierarchy ?? false,
    }),
    [context.isRelocation, context.isHierarchy]
  )

  if (isFetching) {
    return (
      <div className="ui-h-screen ui-w-screen ui-flex ui-items-center ui-justify-center">
        <Spinner className="ui-h-8 ui-w-8" />
      </div>
    )
  }

  return (
    <Container
      key={`key-${id}`}
      title={clsx(
        id ? t('masterBmhp:label.edit') : t('masterBmhp:label.create'),
        title
      )}
      withLayout
    >
      <Meta
        title={
          id
            ? `${t('masterBmhp:label.edit')} ${title}`
            : `${t('masterBmhp:label.create')} ${title}`
        }
      />
      <MasterContext.Provider value={contextValue}>
        <div className="ui-space-y-6 ui-max-w-form ui-mx-auto">
          <MasterForm<T>
            id={id as string | undefined}
            title={
              id
                ? `${t('masterBmhp:label.edit')} ${title}`
                : `${t('masterBmhp:label.create')} ${title}`
            }
            validation={validation}
            initialValues={formData}
            fields={fields}
            onSubmit={handleSubmit}
            onReset={onReset}
            isLoading={isLoading}
            resetButtonText={t('common:reset')}
            submitButtonText={t('common:send')}
            backButtonText={t('common:back')}
          />
        </div>
      </MasterContext.Provider>
    </Container>
  )
}

export default MasterFormPage
