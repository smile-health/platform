import { useParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Button } from '#components/button'
import useSmileRouter from '#hooks/useSmileRouter'
import AppLayout from '#components/layouts/AppLayout/AppLayout'
import { detailMasterMethod } from './services/master-method.service'

export default function MasterMethodDetailPage() {
  const { id: idParam } = useParams()
  const id = Number(idParam)
  const { t } = useTranslation() as any
  const router = useSmileRouter()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['master-method', id],
    queryFn: () => detailMasterMethod(id),
    enabled: !!id,
  })

  if (isLoading) {
    return <div>{t('common:loading')}</div>
  }

  if (isError || !data) {
    return <div>{t('common:data_not_found')}</div>
  }

  const DetailField = ({
    label,
    value,
  }: {
    label: string
    value: string
  }) => (
    <div className="ui-space-y-2">
      <dt className="ui-text-sm ui-font-medium ui-text-neutral-500">{label}</dt>
      <dd className="ui-text-base ui-text-neutral-900">{value}</dd>
    </div>
  )

  return (
    <AppLayout>
      <div className="ui-space-y-6">
        <div className="ui-flex ui-justify-between ui-items-center">
          <h5 className="ui-font-bold ui-text-xl">
            {t('master-method:title.detail')}
          </h5>
          <div className="ui-flex ui-gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              {t('common:back')}
            </Button>
            <Button
              onClick={() => router.push(`/v5/master-method/${id}/edit`)}
            >
              {t('common:edit')}
            </Button>
          </div>
        </div>

        <div className="ui-bg-white ui-p-6 ui-rounded-lg ui-border ui-border-neutral-200">
          <dl className="ui-space-y-6">
            <DetailField
              label={t('master-method:form.name.label')}
              value={data.name}
            />

            <DetailField
              label={t('master-method:form.description.label')}
              value={data.description}
            />

            <div className="ui-grid ui-grid-cols-2 ui-gap-4 ui-pt-4 ui-border-t ui-border-neutral-200">
              <DetailField
                label={t('common:created_at')}
                value={new Date(data.created_at).toLocaleString()}
              />
              <DetailField
                label={t('common:updated_at')}
                value={new Date(data.updated_at).toLocaleString()}
              />
            </div>
          </dl>
        </div>
      </div>
    </AppLayout>
  )
}
