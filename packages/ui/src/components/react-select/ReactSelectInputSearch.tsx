import React from 'react'
import { components, GroupBase, InputProps } from 'react-select'

export default function ReactSelectInputSearch<
  Options,
  IsMulti extends boolean,
  Group extends GroupBase<Options>,
>(props: InputProps<Options, IsMulti, Group>) {
  return <components.Input {...props} data-testid={props.id} />
}
