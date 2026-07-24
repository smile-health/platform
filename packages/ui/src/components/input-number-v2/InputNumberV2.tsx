'use client'

import { MAX_LIMIT_DIGIT_NUMBER } from '#constants/common'
import { useTranslation } from 'react-i18next'
import {
  NumberFormatBase,
  NumericFormat,
  NumericFormatProps,
} from 'react-number-format'

import { Input, InputProps } from '../input/Input'

type InputNumberV2Props = NumericFormatProps &
  InputProps & {
    isPriceTag?: boolean
    isPlainFormat?: boolean
    currencyDisplay?: 'code' | 'symbol' | 'name' | 'narrowSymbol'
    limit?: number
  }

export const InputNumberV2 = ({
  isPriceTag = false,
  isPlainFormat = false,
  currencyDisplay = 'code',
  limit = MAX_LIMIT_DIGIT_NUMBER,
  ...props
}: InputNumberV2Props) => {
  const { i18n } = useTranslation()

  const format = (numStr: number | string) => {
    if (numStr === '') return ''
    return new Intl.NumberFormat(i18n.language, {
      style: isPriceTag ? 'currency' : 'decimal',
      currency: process.env.CURRENCY ?? 'IDR',
      currencyDisplay,
      maximumFractionDigits: 0,
    }).format(numStr as number)
  }

  const decimalSeparator = new Intl.NumberFormat(i18n.language)
    .format(1.1)
    .replace(/[0-9]/g, '')

  if (isPriceTag)
    return (
      <NumericFormat
        {...props}
        customInput={Input}
        thousandSeparator={decimalSeparator === ',' ? '.' : ','}
        decimalScale={2}
        isAllowed={(values) => values.value.length <= limit}
        decimalSeparator={decimalSeparator}
      />
    )

  return (
    <NumberFormatBase
      {...props}
      customInput={Input}
      format={isPlainFormat ? undefined : format}
      isAllowed={(values) => values.value.length <= limit}
    />
  )
}
