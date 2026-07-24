import { OptionType } from '#components/react-select'

export function getReactSelectValue(
  options?: OptionType | OptionType[] | null
) {
  if (Array.isArray(options)) {
    return options?.map((item) => item?.value)?.join(',')
  }

  return options?.value
}

export function getReactSelectLabel(
  options?: OptionType | OptionType[] | null
) {
  if (Array.isArray(options)) {
    return options?.map((item) => item?.label)?.join(',')
  }

  return options?.label
}
