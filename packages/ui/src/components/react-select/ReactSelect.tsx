import React from 'react'
import { useQuery } from '@tanstack/react-query'
import cx from '#lib/cx'
import { useTranslation } from 'react-i18next'
import Select from 'react-select'

import ReactSelectContainer from './ReactSelectContainer'
import ReactSelectCustomCounter from './ReactSelectCustomCounter'
import {
  ReactSelectCustomDropdownIndicator,
  ReactSelectCustomOption,
  ReactSelectCustomOptionCheckbox,
} from './ReactSelectCustomOption'
import ReactSelectInputSearch from './ReactSelectInputSearch'
import { getStyles } from './style'

export type ReactSelectProps = Omit<
  React.ComponentProps<typeof Select>,
  'isDisable'
> & {
  error?: boolean
  disabled?: boolean
  showIndicator?: boolean
  multiSelectOptionStyle?: 'normal' | 'checkbox'
  multiSelectCounterStyle?: 'normal' | 'counter' | 'card'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  isUsingReactQuery?: boolean
}

export const ReactSelect = React.forwardRef<any, ReactSelectProps>(function ReactSelect({
  multiSelectOptionStyle = 'checkbox',
  multiSelectCounterStyle = 'counter',
  closeMenuOnSelect,
  hideSelectedOptions,
  size = 'md',
  ...props
}, ref) {
  const isMultiCheckbox =
    props?.isMulti && multiSelectOptionStyle === 'checkbox'
  const isMultiCounter = props?.isMulti && multiSelectCounterStyle === 'counter'
  const isMultiCheckboxAndCounter = isMultiCheckbox && isMultiCounter

  return (
    <Select
      {...props}
      ref={ref}
      isDisabled={props.disabled}
      inputId={props?.inputId ?? `${props?.id}-input`}
      closeMenuOnSelect={isMultiCheckboxAndCounter ? false : closeMenuOnSelect}
      hideSelectedOptions={
        isMultiCheckboxAndCounter ? false : hideSelectedOptions
      }
      styles={multiSelectCounterStyle === 'card' ? getStyles() : undefined}
      components={{
        ...props?.components,
        SelectContainer: ReactSelectContainer,
        Input: ReactSelectInputSearch,
        DropdownIndicator: (props) =>
          ReactSelectCustomDropdownIndicator({ size: size, ...props }),
        Option: isMultiCheckbox
          ? ReactSelectCustomOptionCheckbox
          : props?.components?.Option || ReactSelectCustomOption,
        ...(!props?.showIndicator && {
          IndicatorSeparator: () => null,
        }),
        ...(isMultiCounter && {
          ValueContainer: ReactSelectCustomCounter,
        }),
      }}
      classNames={{
        ...props?.classNames,
        control: ({ isFocused, ...controlProps }) =>
          cx(
            '!ui-rounded !ui-border !ui-shadow-none',
            {
              '!ui-border-gray-300': !props.error,
              '!ui-border-danger-500': props.error,
              '!ui-border-primary-500 !ui-outline-none !ui-ring-2 !ui-ring-primary-500 !ui-ring-opacity-25':
                isFocused && !props.error,
              '!ui-border-danger-500 !ui-outline-none !ui-ring-2 !ui-ring-danger-500 !ui-ring-opacity-25':
                isFocused && props.error,
              '!ui-cursor-not-allowed !ui-bg-gray-100 !ui-opacity-75':
                props.disabled,
            },
            //size style
            {
              '!ui-min-h-8 ui-text-sm': size === 'sm',
              '!ui-min-h-10 ui-text-base': size === 'md',
              '!ui-min-h-12 ui-text-lg': size === 'lg',
              '!ui-min-h-14 ui-text-xl': size === 'xl',
            },
            props?.classNames?.control?.({ isFocused, ...controlProps })
          ),

        option: ({ isSelected, isFocused, isDisabled, ...optionProps }) =>
          cx(
            '',
            {
              '!ui-bg-primary-500 !ui-text-primary-contrast':
                isSelected && !isMultiCheckbox,
              '!ui-bg-white': isSelected && isMultiCheckbox,
              '!ui-bg-primary-100': isFocused && !isSelected,
              '!ui-text-gray-400': isDisabled,
            },
            props?.classNames?.option?.({
              isSelected,
              isFocused,
              isDisabled,
              ...optionProps,
            })
          ),
      }}
    />
  )
})

type OptionType = {
  value: any
  label: string
}

export const ReactSelectWithQuery = React.forwardRef<any, React.ComponentProps<typeof ReactSelect> & {
  name: string
  loadOptions?: () => Promise<Array<OptionType>>
}>(function ReactSelectWithQuery({
  name,
  disabled,
  loadOptions,
  options,
  isUsingReactQuery = true,
  ...props
}, ref) {
  const {
    i18n: { language },
  } = useTranslation()

  if (isUsingReactQuery && loadOptions) {
    const query = useQuery({
      queryKey: ['react-select', name, language],
      queryFn: loadOptions,
      enabled: Boolean(loadOptions),
      staleTime: 1000 * 60 * 1,
    })

    return (
      <ReactSelect
        {...props}
        ref={ref}
        components={{ DropdownIndicator: ReactSelectCustomDropdownIndicator }}
        isLoading={query.isLoading || query.isFetching}
        menuPortalTarget={document.body}
        disabled={disabled || query.isLoading || query.isFetching}
        options={query.data}
      />
    )
  } else {
    return (
      <ReactSelect
        {...props}
        ref={ref}
        components={{ DropdownIndicator: ReactSelectCustomDropdownIndicator }}
        menuPortalTarget={document.body}
        disabled={disabled}
        options={options}
      />
    )
  }
})
