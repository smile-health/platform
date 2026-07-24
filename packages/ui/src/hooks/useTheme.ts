import React, { useEffect } from 'react'
import { useParams } from 'next/navigation'

import { generateTailwindPalette, getReadableTextColor, resetTheme } from '#utils/color'
import { getUserStorage } from '#utils/storage/user'

export function useTheme() {
  const user = getUserStorage()
  const params = useParams()
  const program = params?.program
  const userPrograms = user?.programs
  const [theme, setTheme] = React.useState('')

  useEffect(() => {
    const preferredTheme = localStorage.getItem('theme')

    if (preferredTheme !== null) {
      setTheme(preferredTheme)
    }
  }, [])

  const onChangeTheme = () => {
    const selectedProgram = userPrograms?.find((x) => x.key === program)
    if (selectedProgram?.config.color) {
      const palette = generateTailwindPalette(selectedProgram.config.color)

      const textColor = getReadableTextColor(selectedProgram.config.color)

      if (textColor === 'dark') {
        document.documentElement.style.setProperty(`--color-primary-contrast`, palette[900]);
        document.documentElement.style.setProperty(`--color-primary-surface`, palette[800]);
      } else if (textColor === 'light') {
        document.documentElement.style.setProperty(`--color-primary-contrast`, palette[50]);
        document.documentElement.style.setProperty(`--color-primary-surface`, palette[500]);
      }

      Object.entries(palette).forEach(([key, value]) => {
        document.documentElement.style.setProperty(
          `--color-primary-${key}`,
          value
        )
      })
    } else resetTheme()
  }

  return {
    theme,
    setTheme: onChangeTheme,
  }
}
