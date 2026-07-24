import { UseFormSetValue, UseFormClearErrors } from 'react-hook-form'

export const clearField = ({
  setValue,
  name,
  resetValue = null,
  clearErrors,
}: {
  setValue: UseFormSetValue<any>
  name: string | string[]
  resetValue?: null | unknown[]
  clearErrors?: UseFormClearErrors<any>
}): void => {
  if (Array.isArray(name)) {
    name.forEach((item, index) => {
      if (Array.isArray(resetValue)) {
        setValue(item, resetValue?.[index])
        clearErrors?.(item)
      } else {
        setValue(item, resetValue)
        clearErrors?.(item)
      }
    })
  } else {
    setValue(name, resetValue)
    clearErrors?.(name)
  }
}

export const extractErrors = (errors: Record<string, unknown>): string[] => {
  const messages: string[] = []
  function traverse(value: unknown): void {
    if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === 'string') {
          messages.push(item)
        } else {
          traverse(item)
        }
      }
    } else if (typeof value === 'object' && value !== null) {
      for (const val of Object.values(value)) {
        traverse(val)
      }
    }
  }
  traverse(errors)
  return messages
}

