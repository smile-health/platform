export function formatNominal(number: number) {
  return new Intl.NumberFormat('id').format(number)
}
