import { Scale } from 'chart.js'

import { OverflowLabelType } from './chart.type'

type TDataReducesReturn = {
  labels: string[]
  data: number[]
}
export function dataReducer(
  data: any[],
  labelKey = 'label',
  valueKey = 'value'
): TDataReducesReturn {
  return data?.reduce(
    (acc, curr) => {
      return {
        ...acc,
        labels: [...acc.labels, curr?.[labelKey] ?? '-'],
        data: [...acc.data, curr?.[valueKey] ?? 0],
      }
    },
    { labels: [], data: [] }
  )
}

export function getYAxisConfig(data?: number[]) {
  if (data?.length) {
    const minValue = Math.min(...data)
    const maxValue = Math.max(...data)
    const range = maxValue - minValue

    // Tentukan kelipatan dasar (step) berdasarkan range
    let step: number

    if (range > 30_000_000) step = 10_000_000
    else if (range > 5_000_000) step = 2_000_000
    else if (range > 1_000_000) step = 500_000
    else step = 100_000

    const minRounded = Math.floor(minValue / step) * step
    const maxRounded = Math.ceil(maxValue / step) * step

    return {
      min: minRounded,
      max: maxRounded,
    }
  }

  return {}
}

export const MAX_Y_AXIS_LABEL_LENGTH = 40

export function handleYLabel(
  this: Scale,
  value: number,
  max: number,
  overflow: 'ellipsis' | 'break' | 'combine' = 'ellipsis'
) {
  const label = this.getLabelForValue(value)

  // Tidak overflow
  if (label.length <= max) return label

  // 🔹 Ellipsis (1 baris)
  if (overflow === 'ellipsis') {
    return label.slice(0, max - 1) + '…'
  }

  const words = label.split(' ')
  const lines: string[] = []
  let line = ''

  for (const word of words) {
    const test = line ? `${line} ${word}` : word

    if (test.length > max) {
      if (line) lines.push(line)
      line = word

      // 🔥 Untuk combine: stop setelah 2 baris
      if (overflow === 'combine' && lines.length === 2) break
    } else {
      line = test
    }
  }

  if (line && lines.length < 2) {
    lines.push(line)
  }

  // 🔹 Break mode normal
  if (overflow === 'break') {
    return lines
  }

  // 🔹 Combine mode
  if (overflow === 'combine') {
    if (lines.length < 2) return lines

    const remainingText = label.slice(lines[0].length + 1 + lines[1].length)

    if (remainingText.trim().length > 0) {
      lines[1] = lines[1].slice(0, max - 1) + '…'
    }

    return lines.slice(0, 2)
  }

  return label
}

export function breakText(text: string, max: number) {
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''

  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (test.length > max) {
      lines.push(line)
      line = word
    } else {
      line = test
    }
  }

  if (line) lines.push(line)

  return lines
}

export function isColorDark(hex: string) {
  const c = hex.startsWith('#') ? hex.substring(1) : hex
  const r = parseInt(c.substring(0, 2), 16)
  const g = parseInt(c.substring(2, 4), 16)
  const b = parseInt(c.substring(4, 6), 16)

  // Gunakan luminance sederhana
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b
  return luminance < 128
}

export function getLabelColor(color: string | string[]) {
  if (Array.isArray(color)) {
    return color?.map((c) => (isColorDark(c) ? '#E5E5E5' : '#404040'))
  }

  return isColorDark(color) ? '#E5E5E5' : '#404040'
}
