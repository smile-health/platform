import Plus from '#components/icons/Plus'
import { ReactSelect } from '#components/react-select'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { mergeBatch, splitBatch } from '../order-create-distribution.helper'
import {
  TFormatBatch,
  TOrderFormItemsValues,
} from '../order-create-distribution.type'

type OptionsType = {
  label: string
  value: TFormatBatch[]
}

type FormValues = Pick<TOrderFormItemsValues, 'material'> & {
  validBatch: TFormatBatch[]
  expiredBatch: TFormatBatch[]
}

type Props = {
  data?: OptionsType[]
}

export default function OrderCreateDistributionOtherActivity({
  data,
}: Readonly<Props>) {
  const { t } = useTranslation('orderDistribution')

  const { watch, setValue } = useFormContext<FormValues>()
  const validBatch = watch('validBatch') ?? []
  const expiredBatch = watch('expiredBatch') ?? []
  const material = watch('material')
  const isManagedInBatch = Boolean(material?.is_managed_in_batch)
  const batch = mergeBatch(isManagedInBatch, validBatch, expiredBatch)

  const options = data?.filter((item) => {
    return batch?.every((v) => v?.activity?.name !== item?.label)
  })

  return (
    <div className="ui-flex ui-gap-4 ui-items-center">
      <div className="ui-flex ui-items-center ui-gap-1">
        <Plus className="ui-size-6 ui-text-dark-teal" />
        <p className="ui-text-dark-teal">{t('form.activity.other')}:</p>
      </div>
      <ReactSelect
        key={JSON.stringify(batch)}
        className="ui-w-80"
        placeholder={t('form.activity.placeholder')}
        menuPlacement="auto"
        value={null}
        options={options}
        onChange={(option: OptionsType) => {
          const splitted = splitBatch(option?.value)
          setValue('validBatch', validBatch.concat(splitted?.validBatch || []))
          setValue(
            'expiredBatch',
            expiredBatch.concat(splitted?.expiredBatch || [])
          )
        }}
      />
    </div>
  )
}
