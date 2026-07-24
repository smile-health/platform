import React from 'react'
import { components, ContainerProps, GroupBase } from 'react-select'

export default function ReactSelectContainer<
  Options,
  IsMulti extends boolean,
  Group extends GroupBase<Options>,
>(props: ContainerProps<Options, IsMulti, Group>) {
  const selectProps = props.selectProps
  const innerProps = {
    ...props.innerProps,
    'data-testid': selectProps?.['data-testid' as keyof typeof selectProps],
  }

  return <components.SelectContainer {...props} innerProps={innerProps} />
}
