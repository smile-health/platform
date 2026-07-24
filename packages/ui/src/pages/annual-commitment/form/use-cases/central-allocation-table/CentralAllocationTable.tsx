import { DataTable } from '#components/data-table'
import { FormErrorMessage } from '#components/form-control'
import { OptionTypeWithData, ReactSelectAsync } from '#components/react-select'
import { Td, Tr } from '#components/table'
import { useProgram } from '#hooks/program/useProgram'
import { loadMaterial } from '#services/material'
import { TMaterial, TMaterialList } from '#types/material'
import { useTranslation } from 'react-i18next'

import { useAnnualCommitmentForm } from '../../AnnualCommitmentFormContext'
import { useCentralAllocationTable } from './useCentralAllocationTable'

export const CentralAllocationTable = () => {
  const { t } = useTranslation(['common', 'annualCommitmentForm'])
  const { addCentralAllocation, form } = useAnnualCommitmentForm()
  const { columns, data } = useCentralAllocationTable()
  const { activeProgram } = useProgram()

  const hasError = !!form.errors.centralAllocations?.message

  return (
    <div
      className={`ui-p-6 ui-border ui-rounded ui-space-y-6 ${
        hasError ? 'ui-border-danger-500' : 'ui-border-gray-300'
      }`}
    >
      <div className="ui-font-semibold ui-text-gray-800">
        {t('annualCommitmentForm:section.centralAllocation.title')}
      </div>

      <DataTable
        withCustomRow
        data={data}
        columns={columns}
        emptyDescription={t('common:notification.no_data')}
        customRow={
          <Tr className="ui-border-t ui-border-gray-300">
            <Td colSpan={columns.length}>
              <ReactSelectAsync
                id="add-central-allocation-material"
                value={null}
                className="ui-w-96"
                loadOptions={loadMaterial}
                onChange={(
                  option: OptionTypeWithData<TMaterial | TMaterialList>
                ) => {
                  if (option) {
                    addCentralAllocation({
                      id: option?.value,
                      material: {
                        label: option?.data?.name ?? '',
                        value: option?.value,
                      },
                      provinceReceiver: {
                        label: option?.data?.name ?? '',
                        value: option?.value,
                      },
                      numberVial: null,
                      numberDose: null,
                      piecesPerUnit:
                        option?.data?.consumption_unit_per_distribution_unit ??
                        1,
                    })
                  }
                }}
                placeholder={t('annualCommitmentForm:table.addMaterial')}
                additional={{
                  page: 1,
                  withData: true,
                  program_id: activeProgram?.id,
                  material_level_id: 3,
                }}
                menuPortalTarget={
                  typeof document !== 'undefined'
                    ? document.documentElement
                    : undefined
                }
                menuPlacement="auto"
                menuPosition="fixed"
                debounceTimeout={300}
              />
            </Td>
          </Tr>
        }
      />

      {hasError && (
        <FormErrorMessage>
          {form.errors.centralAllocations?.message}
        </FormErrorMessage>
      )}
    </div>
  )
}
