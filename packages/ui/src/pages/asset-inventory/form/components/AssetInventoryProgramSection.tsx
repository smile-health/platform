import { InformationCircleIcon } from '@heroicons/react/24/outline'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { ReactSelectAsync } from '#components/react-select'
import { listPrograms } from '#services/program'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

type AssetInventoryProgramSectionProps = {
  errors: any
}

export const AssetInventoryProgramSection = ({
  errors,
}: AssetInventoryProgramSectionProps) => {
  const { t } = useTranslation(['common', 'assetInventory'])
  const { control } = useFormContext()

  return (
    <div className="ui-w-full ui-grid ui-grid-cols-1 ui-gap-4 ui-border ui-rounded-md ui-p-6 ui-mb-6">
      <div className="ui-font-bold ui-text-primary ui-text-dark-blue">
        {t('assetInventory:form.title.program')}
      </div>
      <div className="ui-border ui-rounded ui-border-grey-200 ui-py-3 ui-px-4 ui-bg-[#F1F5F9]">
        <div className="ui-flex ui-flex-row ui-items-center ui-mb-1">
          <InformationCircleIcon className="ui-h-5 ui-w-5 ui-text-grey-500 ui-inline-block ui-mr-1 ui-font-bold" />
          <p className="ui-text-xs ui-font-bold">
            {t('assetInventory:form.information.program.title')}
          </p>
        </div>
        <p className="ui-text-xs ui-text-grey-500">
          {t('assetInventory:form.information.program.description')}
        </p>
      </div>
      <FormControl className="ui-w-full">
        <FormLabel htmlFor="program_ids">
          {t('assetInventory:columns.related_program.label')}
        </FormLabel>
        <Controller
          name="program_ids"
          control={control}
          render={({ field }) => (
            <ReactSelectAsync
              {...field}
              key={`asset_program_ids__${field.value?.value}`}
              id="program_ids"
              isMulti
              isClearable
              loadOptions={async (
                search: string,
                loadedOptions: any,
                { page }: { page: number }
              ) => {
                const { data, total_page } = await listPrograms({
                  page,
                  paginate: 10,
                  keyword: search,
                })

                return {
                  options:
                    data?.map((item) => ({
                      value: item.id,
                      label: item.name,
                    })) || [],
                  hasMore: total_page > page,
                  additional: {
                    page: page + 1,
                  },
                }
              }}
              additional={{ page: 1 }}
              placeholder={t('assetInventory:type_to_search')}
              error={errors?.program_ids}
              multiSelectCounterStyle="card"
              multiSelectOptionStyle="normal"
            />
          )}
        />
        {errors?.program_ids?.message && (
          <FormErrorMessage>{errors?.program_ids?.message}</FormErrorMessage>
        )}
      </FormControl>
    </div>
  )
}
