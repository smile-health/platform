export const phoneNumberRegex = /^(08|628)\d{8,12}$/

export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

export const genderList = (language: string) => {
  const labelMale: Record<string, string> = { id: 'Laki-laki', en: 'Male' }
  const labelFemale: Record<string, string> = { id: 'Perempuan', en: 'Female' }

  return [
    { value: 1, label: labelMale[language] },
    { value: 2, label: labelFemale[language] },
  ]
}
