export const handleOtherValue = (
  primaryValue: string | number | null | undefined,
  otherValue: string | number | null | undefined,
  type?: 'asset_model' | 'asset_type' | 'manufacturer' | 'budget_source'
) => {
  const isManufacturer = type === 'manufacturer'
  if (primaryValue) {
    return isManufacturer ? ` (${primaryValue})` : ` - ${primaryValue}`
  }
  if (otherValue) {
    return isManufacturer ? ` (${otherValue})` : `- ${otherValue}`
  }
  return ''
}
