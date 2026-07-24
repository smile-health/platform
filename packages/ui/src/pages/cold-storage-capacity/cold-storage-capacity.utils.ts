export const getCapacityColor = (percentage: number) => {
  if (percentage > 80) return 'ui-text-red-500'
  if (percentage >= 20) return 'ui-text-green-500'
  if (percentage > 0) return 'ui-text-yellow-500'
  return 'ui-text-gray-500'
}
