'use client'

import React, { useId } from 'react'
import cx from '#lib/cx'
import hash from 'object-hash'
import type { GroupBase, OptionsOrGroups } from 'react-select'
import { AsyncPaginate, AsyncPaginateProps } from 'react-select-async-paginate'

import ReactSelectContainer from './ReactSelectContainer'
import ReactSelectCustomCounter from './ReactSelectCustomCounter'
import {
  ReactSelectCustomOption,
  ReactSelectCustomOptionCheckbox,
} from './ReactSelectCustomOption'
import ReactSelectInputSearch from './ReactSelectInputSearch'
import ReactSelectNumericSearch from './ReactSelectNumericSearch'
import { getStyles } from './style'

export type OptionType<T = any> = {
  value: T
  label: string
}

export type OptionTypeWithData<T> = {
  value: any
  label: string
  data?: T
}

export type LoadedOptions = OptionsOrGroups<OptionType, GroupBase<OptionType>>

type WithAsyncPaginateType = <
  OptionType,
  Group extends GroupBase<OptionType>,
  Additional,
  IsMulti extends boolean = false,
>(
  props: AsyncPaginateProps<OptionType, Group, Additional, IsMulti> & {
    disabled?: boolean
    error?: boolean
    showIndicator?: boolean
    multiSelectOptionStyle?: 'normal' | 'checkbox'
    multiSelectCounterStyle?: 'normal' | 'counter' | 'card'
    size?: 'sm' | 'md' | 'lg' | 'xl'
    inputType?: 'text' | 'number'
  }
) => React.ReactElement

export const ReactSelectAsync: WithAsyncPaginateType = ({
  multiSelectOptionStyle = 'checkbox',
  multiSelectCounterStyle = 'counter',
  closeMenuOnSelect,
  hideSelectedOptions,
  debounceTimeout,
  showIndicator,
  size = 'md',
  inputType = 'text',
  ...props
}) => {
  const id = useId()
  const isMultiCheckbox =
    props?.isMulti && multiSelectOptionStyle === 'checkbox'
  const isMultiCounter = props?.isMulti && multiSelectCounterStyle === 'counter'
  const isMultiCheckboxAndCounter = isMultiCheckbox && isMultiCounter

  return (
    <AsyncPaginate
      {...(props as any)}
      instanceId={id}
      onInputChange={props?.onInputChange}
      isDisabled={props.disabled}
      debounceTimeout={debounceTimeout ?? 300}
      inputId={props?.inputId ?? `${props?.id}-input`}
      closeMenuOnSelect={isMultiCheckboxAndCounter ? false : closeMenuOnSelect}
      hideSelectedOptions={
        isMultiCheckboxAndCounter ? false : hideSelectedOptions
      }
      styles={
        multiSelectCounterStyle === 'card'
          ? getStyles()
          : {
              menuPortal: (styles) => ({
                ...styles,
                zIndex: 999,
              }),
            }
      }
      components={
        {
          ...props.components,
          SelectContainer: ReactSelectContainer,
          Input:
            inputType === 'text'
              ? ReactSelectInputSearch
              : ReactSelectNumericSearch,
          Option: (optionProps: any) =>
            isMultiCheckbox
              ? ReactSelectCustomOptionCheckbox(optionProps)
              : ReactSelectCustomOption(optionProps),
          ...(!showIndicator && {
            IndicatorSeparator: () => null,
          }),
          ...(isMultiCounter && {
            ValueContainer: ReactSelectCustomCounter,
          }),
        } as any
      }
      classNames={{
        control: ({ isFocused }) =>
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
              '!ui-min-h-8 !ui-h-8 ui-text-sm': size === 'sm',
              '!ui-min-h-10 !ui-h-10 ui-text-base': size === 'md',
              '!ui-min-h-12 !ui-h-12 ui-text-lg': size === 'lg',
              '!ui-min-h-14 !ui-h-14 ui-text-xl': size === 'xl',
            }
          ),
        option: ({ isSelected, isFocused }) =>
          cx(
            'ui-z-10',
            {
              '!ui-bg-primary-500 !ui-text-primary-contrast':
                isSelected && !isMultiCheckbox,
              '!ui-bg-white': isSelected && isMultiCheckbox,
              '!ui-bg-primary-100': isFocused && !isSelected,
            },
            props?.classNames?.option
          ),
        ...(props.classNames as any),
      }}
    />
  )
}

export function ReactSelectAsyncHash({
  additional,
  ...props
}: React.ComponentProps<typeof ReactSelectAsync>) {
  return (
    <ReactSelectAsync
      {...props}
      key={hash({ object: additional })}
      additional={additional}
      menuPortalTarget={document.body}
    />
  )
}
