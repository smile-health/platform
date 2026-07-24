import Link from 'next/link'
import { Button } from '#components/button'
import { FormProvider } from 'react-hook-form'

import { usePQSCreateEdit } from '../hooks/usePQSCreateEdit'
import { PQSFormProps } from '../pqs.types'
import PQSFormCapacity from './PQSFormCapacity'
import PQSFormDetail from './PQSFormDetail'

const PQSForm: React.FC<PQSFormProps> = ({ defaultValues, isGlobal }) => {
  const { t, methods, backUrl, onSubmit, isEdit } = usePQSCreateEdit({
    defaultValues,
    isGlobal,
  })

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={onSubmit}
        className="ui-mt-6 ui-space-y-6 ui-max-w-form ui-mx-auto"
      >
        <PQSFormDetail />
        <PQSFormCapacity defaultValue={defaultValues} isEdit={isEdit} />
        <div className="ui-flex ui-justify-end">
          <div className="ui-grid ui-grid-cols-2 ui-w-[300px] ui-gap-2">
            <Button asChild id="btn-back-pqs" type="button" variant="outline">
              <Link href={backUrl()}>{t('back')}</Link>
            </Button>
            <Button id="btn-submit-pqs" type="submit">
              {t('save')}
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  )
}

export default PQSForm
