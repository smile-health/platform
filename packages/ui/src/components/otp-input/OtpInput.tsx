import React from 'react'
import { useControllableState } from '#hooks/useControlableState'
import cx from '#lib/cx'
import RootOtpInput from 'react-otp-input'

type InputProps = Omit<React.ComponentProps<'input'>, 'size'> & {
  /** @default false */
  error?: boolean
}
const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { error, disabled, ...props },
  ref
) {
  return (
    <input
      {...props}
      data-error={error}
      ref={ref}
      disabled={disabled}
      className={cx(
        // base style
        'ui:form-input ui:rounded ui:px-1 ui:text-gray-700',
        'ui:focus:border-primary-500 ui:focus:placeholder-transparent ui:focus:outline-hidden ui:focus:ring-primary-500/25',

        'ui:py-0!',

        'ui:data-[error=true]:border-danger-500 ui:data-[error=true]:focus:ring-danger-500/25',
        // variant style
        {
          'ui-bg-white-100 ui:border ui:border-gray-300 ui:focus:ring-2': true,
          'ui:cursor-not-allowed ui:bg-gray-100 ui:opacity-75': disabled,
        },
        //size style
        {
          'ui:h-11 ui:w-11! ui:text-base': true,
        },
        'ui:[&::-webkit-inner-spin-button]:appearance-none ui:[&::-webkit-outer-spin-button]:appearance-none ui:[appearance:textfield]'
      )}
    />
  )
})

export type OtpInputProps = {
  defaultValue?: string
  value?: string
  onChange?: (otp: string) => void
  numInputs?: number
  error?: boolean
  placeholder?: string
  disabled?: boolean
  type?: 'number' | 'text' | 'password'
}

export function OtpInput({
  defaultValue,
  value,
  onChange,
  numInputs = 4,
  error,
  placeholder = '○',
  disabled,
  type = 'text',
}: Readonly<OtpInputProps>) {
  const [_value, _setValue] = useControllableState<string>({
    value: value,
    onChange: onChange,
    defaultValue: defaultValue,
  })
  return (
    <RootOtpInput
      numInputs={numInputs}
      value={_value}
      inputType={type}
      onChange={_setValue}
      renderSeparator={<span className="ui:px-0.5"></span>}
      renderInput={(inputProps) => (
        <Input
          {...inputProps}
          error={error}
          placeholder={placeholder}
          disabled={disabled}
        />
      )}
    />
  )
}
