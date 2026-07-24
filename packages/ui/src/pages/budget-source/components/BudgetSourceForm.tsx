import Link from 'next/link'
import { Button } from '#components/button'
import ProgramSelection from '#components/modules/ProgramSelection'
import { FormProvider } from 'react-hook-form'

import { BudgetSourceFormProps } from '../budget-source.type'
import { useBudgetSourceCreateEdit } from '../hooks/useBudgetSourceCreateEdit'
import BudgetSourceFormDetail from './BudgetSourceFormDetail'

const BudgetSourceForm: React.FC<BudgetSourceFormProps> = ({
  defaultValues,
  isGlobal,
  disabledProgramIds = [],
}) => {
  const { program_ids, t, methods, backUrl, onSubmit } =
    useBudgetSourceCreateEdit({ defaultValues, isGlobal })
  const { setValue } = methods

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={onSubmit}
        className="ui-mt-6 ui-space-y-6 ui-max-w-form ui-mx-auto"
      >
        <BudgetSourceFormDetail />
        {isGlobal && (
          <ProgramSelection
            selected={program_ids}
            onChange={(ids) => setValue('program_ids', ids)}
            forbiddenUncheckIds={disabledProgramIds}
          />
        )}
        <div className="ui-flex ui-justify-end">
          <div className="ui-grid ui-grid-cols-2 ui-w-[300px] ui-gap-2">
            <Button
              asChild
              id="btn-back-entity"
              type="button"
              variant="outline"
            >
              <Link href={backUrl()}>{t('back')}</Link>
            </Button>
            <Button id="btn-submit-entity" type="submit">
              {t('save')}
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  )
}

export default BudgetSourceForm
