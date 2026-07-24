import { NumberFormatBase } from 'react-number-format'
import { GroupBase, InputProps } from 'react-select'

export default function ReactSelectNumericSearch<
  Options,
  IsMulti extends boolean,
  Group extends GroupBase<Options>,
>(props: InputProps<Options, IsMulti, Group>) {
  const { selectProps, className, style, ...restProps } = props

  return (
    <NumberFormatBase
      {...(restProps as any)}
      id={props.id}
      data-testid={props.id}
      value={props.value?.toString()}
      className="ui-min-w-0.5 ui-outline-0 ui-outline-none ui-p-0 ui-bg-transparent ui-cursor-default w-full border-0"
      style={{
        gridArea: '1 / 1',
        marginLeft: '2px',
      }}
      getInputRef={props.innerRef}
    />
  )
}
