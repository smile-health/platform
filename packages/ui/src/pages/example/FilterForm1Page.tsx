import React, { useMemo } from 'react'
import { Button } from '#components/button'
import {
  FilterExpandButton,
  FilterFormBody,
  FilterFormFooter,
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
import { loadProvinces, loadRegencies } from '#services/location'
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
        type: 'date-picker',
        name: 'date',
        label: 'Single',
        className: '',
        defaultValue: null,
      },
      {
        type: 'date-range-picker',
        name: 'date_range',
        withPreset: true,
        multicalendar: true,
        label: 'Range',
        className: '',
        defaultValue: null,
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
      {
        type: 'select',
        name: 'category',
        isMulti: true,
        isClearable: true,
        label: 'Select Category',
        loadOptions: async function () {
          await sleep(5000)
          return [
            {
              label: 'Option 1',
              value: '1',
            },
            {
              label: 'Option 2',
              value: '2',
            },
            {
              label: 'Option 3',
              value: '3',
            },
          ]
        },
        defaultValue: null,
      },
      {
        type: 'select-async-paginate',
        name: 'province',
        isMulti: false,
        isClearable: true,
        label: 'Province',
        placeholder: 'Province',
        loadOptions: loadProvinces,
        clearOnChangeFields: ['regency'],
        additional: { page: 1 },
        defaultValue: null,
      },
      {
        type: 'select-async-paginate',
        name: 'regency',
        isMulti: false,
        isClearable: true,
        label: 'Regency',
        placeholder: 'Regency',
        disabled: ({ getValue }) => !getValue('province'),
        loadOptions: loadRegencies,
        additional: ({ getValue, getReactSelectValue }) => ({
          parent_id: getReactSelectValue('province'),
          page: 1,
        }),
        defaultValue: null,
      },
      {
        type: 'radio',
        name: 'gender',
        label: 'Gender',
        options: [
          { label: 'Male', value: '1' },
          { label: 'Female', value: '2' },
        ],
        defaultValue: '',
        className: '',
      },
    ],
    []
  )
  const filter = useFilter(filterSchema)

  return (
    <div className="ui-px-20 p-5">
      <div>
        <pre className="ui-bg-gray-100 ui-p-3 ui-rounded ui-shadow-inner ui-text-gray-600 my-5 text-xs">
          {JSON.stringify({ ...filter.query, ...pagination }, null, 2)}
        </pre>
        <FilterFormRoot collapsible onSubmit={filter.handleSubmit}>
          <FilterFormBody className="ui-grid-cols-4">
            {filter.renderField()}
          </FilterFormBody>
          <FilterFormFooter>
            <div className="ui-flex ui-gap-2">
              <FilterResetButton onClick={filter.reset} />
              <FilterExpandButton />
            </div>
            <div className="ui-space-x-3 flex">
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
          </FilterFormFooter>
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
