import React, { useMemo } from 'react'
import { Button } from '#components/button'
import {
  FilterFormBody,
  FilterFormRoot,
  FilterResetButton,
  FilterSubmitButton,
  UseFilter,
  useFilter,
} from '#components/filter'
import Download from '#components/icons/Download'
import Export from '#components/icons/Export'
import Import from '#components/icons/Import'
import { Pagination } from '#components/pagination'
import { parseAsInteger, useQueryStates } from 'nuqs'
import { useTranslation } from 'react-i18next'

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
export default function FiltersPage() {
  const { t } = useTranslation()
  const [pagination, setPagination] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      paginate: parseAsInteger.withDefault(10),
    },
    {
      history: 'push',
    }
  )

  const filterSchema = useMemo<UseFilter>(
    () => [
      {
        type: 'text',
        name: 'keyword',
        label: 'Keyword',
        placeholder: 'Enter keyword',
        className: '',
        defaultValue: '',
      },
      {
        type: 'select',
        name: 'tag',
        isMulti: false,
        isClearable: true,
        label: 'Select Tag',
        options: [
          { label: 'Option 1', value: '1' },
          { label: 'Option 2', value: '2' },
        ],
        defaultValue: null,
      },
    ],
    []
  )
  const filter = useFilter(filterSchema)

  return (
    <div className="ui-px-20 ui-py-5">
      <div>
        <pre className="ui-bg-gray-100 ui-p-3 ui-rounded ui-shadow-inner ui-text-gray-600 my-5 text-xs">
          {JSON.stringify({ ...filter.query, ...pagination }, null, 2)}
        </pre>
        <FilterFormRoot onSubmit={filter.handleSubmit}>
          <FilterFormBody className="ui-grid-cols-[1.25fr_1.25fr_3fr]">
            {filter.renderField()}
            <div className="ui-space-x-3 ui-place-self-end flex w-full">
              <FilterResetButton onClick={filter.reset} />
              <Button
                id="btn-import"
                variant="outline"
                type="button"
                leftIcon={<Import className="ui-size-5" />}
              >
                {t('import')}
              </Button>
              <Button
                id="btn-export"
                variant="outline"
                type="button"
                leftIcon={<Export className="ui-size-5" />}
              >
                {t('export')}
              </Button>
              <Button
                id="btn-download-template"
                variant="outline"
                type="button"
                leftIcon={<Download className="ui-size-5" />}
              >
                {t('download_template')}
              </Button>
              <FilterSubmitButton className="ui-w-[220px]"></FilterSubmitButton>
            </div>
          </FilterFormBody>
          {filter.renderActiveFilter()}
        </FilterFormRoot>
        <div className="ui-border ui-border-gray-300 ui-h-[300px] rounded my-5"></div>
        <div className="ui-justify-end flex">
          <div></div>
          <Pagination
            totalPages={100}
            currentPage={pagination.page}
            onPageChange={(page) => setPagination({ page })}
          />
        </div>
      </div>
    </div>
  )
}
