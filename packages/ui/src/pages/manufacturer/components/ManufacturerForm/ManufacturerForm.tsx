import Link from 'next/link'
import { Button } from '#components/button'
import Meta from '#components/layouts/Meta'
import ProgramSelection from '#components/modules/ProgramSelection'
import { TManufacturer } from '#types/manufacturer'
import { FormProvider } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import * as yup from 'yup'

import useManufacturerCreate from '../../hooks/useManufacturerCreate'
import manufacturerCreateSchema from '../../schemas/manufacturerCreateSchema'
import ManufacturerFormMainInfo from './ManufacturerFormMainInfo'

type ManufacturerFormProps = {
  manufacturer?: TManufacturer
  isEdit?: boolean
  isGlobal?: boolean
}

export type FormType = yup.InferType<
  ReturnType<typeof manufacturerCreateSchema>
> & {
  workspace_ids: number[]
}

export default function ManufacturerForm({
  manufacturer,
  isEdit,
  isGlobal = false,
}: Readonly<ManufacturerFormProps>) {
  const { t, i18n } = useTranslation(['common', 'manufacturer'])
  const language = i18n.language
  const checkedPrograms = manufacturer?.programs?.map((item) => item?.id)

  const { methods, onSubmit, isPending } = useManufacturerCreate({
    manufacturer,
    isEdit,
  })

  const { watch, setValue } = methods

  const program_ids = watch('program_ids')

  return (
    <FormProvider {...methods}>
      <Meta title={`SMILE | Global ${t('manufacturer:title.manufacturer')}`} />

      <form
        onSubmit={onSubmit}
        className="ui-w-full ui-space-y-6 ui-max-w-form ui-mx-auto"
      >
        <ManufacturerFormMainInfo />
        <ProgramSelection
          selected={program_ids}
          onChange={(ids) => setValue('program_ids', ids)}
          forbiddenUncheckIds={checkedPrograms}
        />
        <div className="ui-flex ui-justify-end ui-mt-10 ui-space-x-5">
          <Button
            asChild
            variant="outline"
            className="ui-w-32"
            data-testid="btn-back"
          >
            <Link href={`/${language}/v5/global-settings/manufacturer`}>
              {t('common:back')}
            </Link>
          </Button>
          <Button
            type="submit"
            className="ui-w-32"
            loading={isPending}
            data-testid="btn-submit"
          >
            {t('common:save')}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
