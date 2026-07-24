export const removeEmptyObject = <T>(obj: T): T => {
  for (const propName in obj) {
    const value = obj[propName]
    const removed = ['', null, undefined]
    if (removed.some((r) => r === value)) {
      delete obj[propName]
    }
  }

  return obj
}

export const handleFilterData = <T = {}>(data = {} as T, allNull = false) => {
  let result = {} as T
  for (const key in data) {
    if (!allNull) {
      if (!data[key]) {
        result = { ...result, [key]: null }
      } else {
        result = { ...result, [key]: data[key] }
      }
    } else {
      result = { ...result, [key]: null }
    }
  }

  return result
}

export function isObject(obj: unknown) {
  return obj !== null && typeof obj === 'object'
}

export function isNonEmptyObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.keys(value).length > 0
  );
}