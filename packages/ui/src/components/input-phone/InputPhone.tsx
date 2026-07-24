'use client'

import React from 'react'
import * as RPNInput from 'react-phone-number-input'

import { Input, InputGroup, InputProps } from '../input/Input'
import { SelectCountry, SelectCountryProps } from './SelectCountry'

const RPNInputComponent = RPNInput.default

const PhoneInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return <Input ref={ref} {...props} />
  }
)

type InputPhoneProps = RPNInput.DefaultInputComponentProps &
  Pick<InputProps, 'size' | 'variant'> & {
    readOnly?: boolean
    disabled?: boolean
    inputProps?: Omit<InputProps, 'size'>
    selectCountryProps?: SelectCountryProps
    error?: boolean
    value?: string
    onChange?: (value: RPNInput.Value) => void
    defaultCountry?: RPNInput.Country
    limitMaxLength?: boolean
  }

export function InputPhone({
  value,
  onChange,
  inputProps,
  selectCountryProps,
  size = 'md',
  error,
  defaultCountry = 'ID',
  variant = 'outline',
  limitMaxLength = true,
  ...props
}: InputPhoneProps) {
  const handleChange = (newValue: RPNInput.Value) => {
    if (onChange) {
      onChange(newValue)
    }
  }

  return (
    <RPNInputComponent
      {...props}
      defaultCountry={defaultCountry}
      countrySelectComponent={SelectCountry}
      containerComponent={InputGroup}
      inputComponent={PhoneInput}
      countrySelectProps={{ ...selectCountryProps, size, error, variant }}
      numberInputProps={{ ...inputProps, size, error, variant }}
      value={value}
      limitMaxLength={limitMaxLength}
      onChange={handleChange}
      international
    />
  )
}
