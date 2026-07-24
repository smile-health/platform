import { useState } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/solid'
import { NativeSelectProps } from '#components/native-select'
import cx from '#lib/cx'
import { replaceSpaceWithDash } from '#utils/strings'
import * as RPNInput from 'react-phone-number-input'

import { FlagComponent } from './FlagComponent'

export type SelectCountryProps = React.ComponentProps<'select'> & {
  size?: NativeSelectProps['size']
  error?: boolean
  disabled?: boolean
  value: RPNInput.Country
  onChange: (value: RPNInput.Country) => void
  options: { label: string; value: RPNInput.Country }[]
  variant?: 'filled' | 'outline'
}

export function SelectCountry({
  id = 'select-country',
  disabled,
  error,
  value,
  onChange,
  options,
  size,
  variant,
  onFocus,
  onBlur,
  ...props
}: SelectCountryProps) {
  const [isFocused, setIsFocused] = useState(false)

  const handleFocus = (event: React.FocusEvent<HTMLSelectElement>) => {
    setIsFocused(true)
    onFocus?.(event)
  }

  const handleBlur = (event: React.FocusEvent<HTMLSelectElement>) => {
    setIsFocused(false)
    onBlur?.(event)
  }

  const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value as RPNInput.Country)
  }

  return (
    <div
      data-error={error}
      className={cx(
        'ui-relative ui-flex ui-self-stretch ui-items-center ui-p-2',
        'ui-rounded ui-rounded-r-none',
        'ui-bg-white ui-text-gray-800 ui-leading-tight',
        'data-[error=true]:ui-border data-[error=true]:ui-border-danger-500',
        'focus-within:ui-border-primary-500 focus-within:ui-border-r focus-within:ui-outline-none focus-within:ui-ring-primary-500 focus-within:ui-ring-opacity-25 focus-within:ui-ring-2 focus-within:ui-z-10',
        {
          'ui-bg-gray-100 ui-opacity-75': disabled,
          'ui-h-8': size === 'sm',
          'ui-h-10': size === 'md',
          'ui-text-sm': size === 'md' || size === 'sm',
          'ui-h-12 ui-text-base': size === 'lg',
          'ui-h-14 ui-text-lg': size === 'xl',
        },
        {
          'ui-border-0 ui-bg-gray-100 focus-within:ui-border focus-within:ui-ring-2':
            variant === 'filled',
          'ui-bg-white-100 ui-border ui-border-gray-300 focus-within:ui-ring-2':
            variant === 'outline',

          'ui-cursor-not-allowed ui-bg-gray-100 ui-opacity-75': disabled,
        },

        // group
        'group-[.is-group]:first:ui-rounded-r-none',
        'group-[.is-group]:[&:not(:first-child):not(:last-child)]:ui-rounded-none',
        'group-[.is-group]:last:ui-rounded-l-none',

        'group-[.is-group]:[&:not(:first-child):not(:last-child)]:-ui-mr-[1px]',
        'group-[.is-group]:last:-ui-ml-[1px]',
        'group-[.is-group]:first:-ui-mr-[1px]',
        {
          'group-[.is-group]:first:ui-border-r ui-border-gray-300':
            variant === 'filled',
          'group-[.is-group]:last:ui-border-l ui-border-gray-300':
            variant === 'filled',
          'data-[error=true]:ui-ring-opacity-25 data-[error=true]:ui-ring-danger-500 group-[.is-group]:ui-z-10':
            isFocused,
        }
      )}
    >
      <div
        className="ui-w-full ui-inline-flex ui-items-center ui-gap-2 ui-justify-between"
        aria-hidden="true"
      >
        <FlagComponent
          country={value}
          countryName={value}
          size={size}
          aria-hidden="true"
        />

        <ChevronDownIcon
          className={cx('ui-text-zinc-500', {
            'ui-size-3': size === 'sm',
            'ui-size-4': size === 'md',
            'ui-size-5': size === 'lg',
            'ui-size-6': size === 'xl',
          })}
          aria-hidden="true"
        />
      </div>
      <select
        {...props}
        id={id}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        value={value || ''}
        onChange={handleSelect}
        className={cx('ui-absolute ui-inset-0 ui-text-sm ui-opacity-0', {
          'ui-cursor-not-allowed': disabled,
        })}
        aria-label="Select country"
      >
        <option key="default" value="">
          Select a country
        </option>
        {options
          .filter((x) => x.value)
          .map((option) => (
            <option
              key={option.value || 'empty'}
              value={option.value}
              id={`option-${replaceSpaceWithDash(option?.value?.toLowerCase())}`}
            >
              {option.label}{' '}
              {option.value &&
                `+${RPNInput.getCountryCallingCode(option.value)}`}
            </option>
          ))}
      </select>
    </div>
  )
}
