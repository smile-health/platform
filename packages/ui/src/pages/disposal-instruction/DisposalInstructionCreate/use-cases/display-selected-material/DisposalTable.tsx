import { DataTable } from '#components/data-table'
import { FormErrorMessage } from '#components/form-control'
import cx from '#lib/cx'
import { useTranslation } from 'react-i18next'

import { useDisposalInstructionCreate } from '../../DisposalInstructionCreateContext'
import { useDisposalTable } from './useDisposalTable'

export const DisposalTable = () => {
  const { t } = useTranslation(['disposalInstructionCreate'])

  const disposalInstructionCreate = useDisposalInstructionCreate()
  const disposalInstructionCreateFormErrors =
    disposalInstructionCreate.form.methods.formState.errors

  const disposalTable = useDisposalTable()

  return (
    <div className="ui-w-full ui-px-5 ui-py-5 ui-border ui-border-gray-300 ui-rounded ui-space-y-6">
      <div className="ui-font-semibold ui-text-gray-800">
        {t('disposalInstructionCreate:section.disposal_table.title')}
      </div>

      <div className="space-y-2">
        <div
          className={cx({
            'ui-outline ui-outline-2 ui-outline-red-500/80 ui-bg-red-50 ui-rounded-sm ui-outline-offset-1':
              disposalInstructionCreateFormErrors.disposal_items?.message,
          })}
        >
          <DataTable
            data={
              disposalInstructionCreate.form.methods.watch('disposal_items') ??
              []
            }
            columns={disposalTable.columns}
            isStriped
            isHighlightedOnHover
          />
        </div>

        {disposalInstructionCreateFormErrors.disposal_items?.message && (
          <FormErrorMessage>
            {disposalInstructionCreateFormErrors.disposal_items?.message}
          </FormErrorMessage>
        )}
      </div>
    </div>
  )
}
