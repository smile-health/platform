export const isDevelopment = ({
  isAlsoStaging = false,
}: {
  isAlsoStaging: boolean
}): boolean => {
  const baseUrl = window.location.origin

  return (
    baseUrl.includes('localhost') ||
    baseUrl.includes('dev.badr.co.id') ||
    (isAlsoStaging && baseUrl.includes('smile-indonesia.id'))
  )
}
