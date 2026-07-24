import { Checkbox } from "#components/checkbox";
import cx from "#lib/cx";
import { components, DropdownIndicatorProps, GroupBase, OptionProps } from "react-select";

export function ReactSelectCustomOption<
  Options,
  IsMulti extends boolean,
  Group extends GroupBase<Options>,
>(props: Readonly<OptionProps<Options, IsMulti, Group>>) {
  const { label } = props
  const value = props?.['value' as keyof typeof props]

  const id = `${props.selectProps.id}-option-${value}`
  const innerProps = {
    ...props.innerProps,
    id,
    'data-testid': id,
  }

  return (
    <components.Option {...props} innerProps={innerProps}>
      {label}
    </components.Option>
  )
}

export function ReactSelectCustomOptionCheckbox<
  Options,
  IsMulti extends boolean,
  Group extends GroupBase<Options>,
>(props: Readonly<OptionProps<Options, IsMulti, Group>>) {
  const { isSelected, label } = props

  const value = props?.['value' as keyof typeof props]
  const id = `option-${value}`
  const innerProps = {
    ...props.innerProps,
    id,
    'data-testid': id,
  }

  return (
    <components.Option {...props} innerProps={innerProps}>
      <Checkbox checked={isSelected} label={label} readOnly />
    </components.Option>
  )
}

export function ReactSelectCustomDropdownIndicator({
  size = 'md',
  ...props
}: Readonly<DropdownIndicatorProps> & {
  size: 'sm' | 'md' | 'lg' | 'xl'
}) {
  return (
    <components.DropdownIndicator
      {...props}
      className={cx(props.className, { '!ui-p-1': size === 'sm' })}
    />
  )
}
