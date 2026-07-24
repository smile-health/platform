import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { useTranslation } from 'react-i18next'

import MasterPemeriksaanForm from './components/MasterPemeriksaanForm'
import { detailMasterPemeriksaan } from './services/master-pemeriksaan.service'

export default function MasterPemeriksaanEditPage() {
  const { id: idParam } = useParams()
  const id = Number(idParam)
  const { t } = useTranslation() as any

  const { data, isLoading, isError } = useQuery({
    queryKey: ['master-pemeriksaan', id],
    queryFn: () => detailMasterPemeriksaan(id),
    enabled: !!id,
  })

  if (isLoading) {
    return <div>{t('common:loading')}</div>
  }

  if (isError || !data) {
    return <div>{t('common:data_not_found')}</div>
  }

  const normalizeIds = (
    items?: Array<number | { value?: number; id?: number }>
  ) =>
    (items ?? [])
      .map((item) =>
        typeof item === 'number' ? item : (item?.value ?? item?.id)
      )
      .filter((value): value is number => typeof value === 'number')

  const defaultValues = {
    name: data.name,
    description: data.description || '',
    is_active: data.is_active === 1,
    jenis_pemeriksaan_id: data.examination_type_id ?? null,
    parameter_ids: normalizeIds(data.parameters ?? data.parameter_ids),
    metode_ids: normalizeIds(data.methods ?? data.metode_ids),
    materials: (data.target_groups ?? []).map((group) => ({
      template_id: group.id,
      sasaran_ids: [group.id],
    })),
  }

  return (
    <Container
      title={t('master-pemeriksaan:title.edit')}
      hideTabs={false}
      withLayout={true}
    >
      <Meta title={`Smile | ${t('master-pemeriksaan:title.edit')}`} />
      <div className="mt-6 space-y-6">
        <MasterPemeriksaanForm defaultValues={defaultValues} isEdit={true} />
      </div>
    </Container>
  )
}
