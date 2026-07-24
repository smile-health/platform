import React from 'react'
import cx from '#lib/cx'
import NumberFormat, { NumberFormatProps } from 'react-number-format'

type SuffixInputNumberProps = {
  mySuffix: string
  decimalSeparator?: string
  name?: string
  onChange?: (name: string, value: string) => void
} & Omit<NumberFormatProps, 'onChange' | 'onValueChange'>

export function SuffixInputNumber({
  mySuffix = 'cm',
  decimalSeparator = ',',
  name,
  onChange,
  ...props
}: SuffixInputNumberProps) {
  return (
    <div className="ui-relative ui-mt-2">
      <div className="ui-absolute ui-right-0 ui-ui-h-full ui-rounded-r-sm ui-p-2 w-10">
        <div className="ui-flex ui-h-full ui-w-full ui-items-center ui-justify-center">
          <div className="ui-border-l ui-border-[#d2d2d2] ui-text-dark-teal ui-px-2">
            {mySuffix}
          </div>
        </div>
      </div>
      <NumberFormat
        {...props}
        onChange={() => {}}
        type="text"
        className={cx(
          'ui-rounded ui-border ui-w-full ui-border-gray-400 ui-py-2 ui-pl-4 ui-pr-10',
          {
            'ui-border-[#d2d2d2]': props?.disabled,
          },
          props.className
        )}
        isNumericString
        thousandSeparator="."
        decimalSeparator={decimalSeparator}
        onValueChange={(e) => onChange && onChange(name ?? '', e.value)}
      />
    </div>
  )
}
