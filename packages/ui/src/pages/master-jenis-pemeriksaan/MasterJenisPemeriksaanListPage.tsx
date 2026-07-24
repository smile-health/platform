import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '#components/button'
import useSmileRouter from '#hooks/useSmileRouter'
import AppLayout from '#components/layouts/AppLayout/AppLayout'
import {
  useFilter,
  FilterFormRoot,
  FilterFormBody,
  FilterFormFooter,
  FilterExpandButton,
  FilterResetButton,
  FilterSubmitButton,
} from '#components/filter'
import MasterJenisPemeriksaanTable from './components/MasterJenisPemeriksaanTable'
import { masterJenisPemeriksaanListFilterSchema } from './libs/master-jenis-pemeriksaan-list.filter'

export default function MasterJenisPemeriksaanListPage() {
  const { t } = useTranslation() as any
  const router = useSmileRouter()

  const filterSchema = useMemo(
    () => masterJenisPemeriksaanListFilterSchema(t),
    [t]
  )
  const filter = useFilter(filterSchema)

  return (
    <AppLayout>
      <div className="ui-space-y-6">
        <div className="ui-flex ui-justify-between ui-items-center">
          <h5 className="ui-font-bold ui-text-xl">
            {t('master-jenis-pemeriksaan:title.list')}
          </h5>
          <Button
            onClick={() =>
              router.push('/v5/master-jenis-pemeriksaan/create')
            }
          >
            {t('common:add')}
          </Button>
        </div>

        <FilterFormRoot collapsible onSubmit={filter.handleSubmit}>
          <FilterFormBody>{filter.renderField()}</FilterFormBody>
          <FilterFormFooter>
            <FilterExpandButton variant="subtle" />
            <div className="ui-space-x-3 ui-flex ui-gap-2">
              <FilterResetButton onClick={filter.reset} variant="subtle" />
              <FilterSubmitButton variant="outline" className="ui-w-56" />
            </div>
          </FilterFormFooter>
          {filter.renderActiveFilter()}
        </FilterFormRoot>

        <MasterJenisPemeriksaanTable filterQuery={filter.query} />
      </div>
    </AppLayout>
  )
}
