import React from 'react'
import { ClearIndicatorProps, components, GroupBase } from 'react-select'

export default function ReactSelectClearIndicator<
  Options,
  IsMulti extends boolean,
  Group extends GroupBase<Options>,
>(props: Readonly<ClearIndicatorProps<Options, IsMulti, Group>>) {
  const selectProps = props.selectProps
  const selectId = selectProps?.['data-testid' as keyof typeof selectProps]
  const id = `${selectId as string}-clear-indicator`
  const innerProps = {
    ...props.innerProps,
    id,
    'data-testid': id,
  }

  return <components.ClearIndicator {...props} innerProps={innerProps} />
}
