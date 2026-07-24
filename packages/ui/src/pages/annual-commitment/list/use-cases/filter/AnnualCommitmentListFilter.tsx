import {
  FilterExpandButton,
  FilterFormBody,
  FilterFormFooter,
  FilterFormRoot,
  FilterResetButton,
  FilterSubmitButton,
} from '#components/filter'
import { hasPermission } from '#shared/permission/index'

import AnnualCommitmentListExportButton from '../export/AnnualCommitmentListExportButton'
import AnnualCommitmentListDownloadTemplateButton from '../import/AnnualCommitmentListDownloadTemplateButton'
import AnnualCommitmentListImportButton from '../import/AnnualCommitmentListImportButton'
import useAnnualCommitmentListFilter from './useAnnualCommitmentListFilter'

export default function AnnualCommitmentListFilter() {
  const annualCommitmentListFilter = useAnnualCommitmentListFilter()

  const handleReset = () => {
    annualCommitmentListFilter.reset()
  }

  return (
    <FilterFormRoot
      onSubmit={annualCommitmentListFilter.handleSubmit}
      collapsible
    >
      <FilterFormBody className="ui-grid-cols-4">
        {annualCommitmentListFilter.renderField()}
      </FilterFormBody>
      <FilterFormFooter>
        <div>
          <FilterExpandButton />
        </div>
        <div className="ui-flex ui-gap-3 ui-items-center">
          {hasPermission('annual-commitment-mutate') && (
            <AnnualCommitmentListImportButton />
          )}
          <AnnualCommitmentListExportButton />
          {hasPermission('annual-commitment-mutate') && (
            <AnnualCommitmentListDownloadTemplateButton />
          )}
          <span className="ui-h-[24px] ui-w-px ui-bg-neutral-300" />
          <FilterResetButton variant="subtle" onClick={handleReset} />
          <FilterSubmitButton variant="outline" className="ui-w-[202px]" />
        </div>
      </FilterFormFooter>
      {annualCommitmentListFilter.renderActiveFilter()}
    </FilterFormRoot>
  )
}
