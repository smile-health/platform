'use client'

import React, { useId } from 'react'
import cx from '#lib/cx'
import hash from 'object-hash'
import type { GroupBase } from 'react-select'
import {
  AsyncPaginateProps,
  withAsyncPaginate,
} from 'react-select-async-paginate'
import CreateableSelect from 'react-select/creatable'

import ReactSelectContainer from './ReactSelectContainer'
import ReactSelectCustomCounter from './ReactSelectCustomCounter'
import {
  ReactSelectCustomOption,
  ReactSelectCustomOptionCheckbox,
} from './ReactSelectCustomOption'
import ReactSelectInputSearch from './ReactSelectInputSearch'
import { getStyles } from './style'

type WithAsyncPaginateCreatableType = <
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
    onCreateOption?: (inputValue: string) => void
    isValidNewOption?: (
      inputValue: string,
      selectValue: any,
      selectOptions: any
    ) => boolean
  }
) => React.ReactElement

const CreateableAsyncPaginate = withAsyncPaginate(
  CreateableSelect
) as WithAsyncPaginateCreatableType

export const ReactSelectCreateableAsync: WithAsyncPaginateCreatableType = ({
  multiSelectOptionStyle = 'checkbox',
  multiSelectCounterStyle = 'counter',
  closeMenuOnSelect,
  hideSelectedOptions,
  debounceTimeout,
  showIndicator,
  size = 'md',
  onCreateOption,
  isValidNewOption,
  ...props
}) => {
  const id = useId()
  const isMultiCheckbox =
    props?.isMulti && multiSelectOptionStyle === 'checkbox'
  const isMultiCounter = props?.isMulti && multiSelectCounterStyle === 'counter'
  const isMultiCheckboxAndCounter = isMultiCheckbox && isMultiCounter

  return (
    <CreateableAsyncPaginate
      {...(props as any)}
      onCreateOption={onCreateOption}
      isValidNewOption={isValidNewOption}
      instanceId={id}
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
                zIndex: 10,
              }),
            }
      }
      components={
        {
          ...props.components,
          SelectContainer: ReactSelectContainer,
          Input: ReactSelectInputSearch,
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

export function ReactSelectCreateableAsyncHash({
  additional,
  ...props
}: React.ComponentProps<typeof ReactSelectCreateableAsync>) {
  return (
    <ReactSelectCreateableAsync
      {...props}
      key={hash({ object: additional })}
      additional={additional}
      menuPortalTarget={document.body}
    />
  )
}
