import { useMemo } from 'react'
import { Button } from '#components/button'
import {
  FilterExpandButton,
  FilterFormBody,
  FilterFormFooter,
  FilterFormRoot,
  FilterResetButton,
  FilterSubmitButton,
  useFilter,
} from '#components/filter'
import AppLayout from '#components/layouts/AppLayout/AppLayout'
import useSmileRouter from '#hooks/useSmileRouter'
import { useTranslation } from 'react-i18next'

import MasterPemeriksaanTable from './components/MasterPemeriksaanTable'
import { masterPemeriksaanListFilterSchema } from './libs/master-pemeriksaan-list.filter'

export default function MasterPemeriksaanListPage() {
  const { t } = useTranslation() as any
  const router = useSmileRouter()

  const filterSchema = useMemo(() => masterPemeriksaanListFilterSchema(t), [t])
  const filter = useFilter(filterSchema)

  return (
    <AppLayout>
      <div className="ui-space-y-6">
        <div className="ui-flex ui-justify-between ui-items-center">
          <h5 className="ui-font-bold ui-text-xl">
            {t('master-pemeriksaan:title.list')}
          </h5>
          <Button onClick={() => router.push('/v5/master-pemeriksaan/create')}>
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

        <MasterPemeriksaanTable filterQuery={filter.query} />
      </div>
    </AppLayout>
  )
}
