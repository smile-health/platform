import { OptionType } from "#components/react-select"

type ValueEntity = {
  type: 'entity'
  value: OptionType | null
}
type ValuePeriode = {
  type: 'periode'
  value: (OptionType & { month_period: number, year_period: number}) | null
}
type ValueMaterial = {
  type: 'material'
  value: number | null
}
type ValueTrademark = {
  type: 'trademark'
}

export type ValueChange = ValueEntity | ValuePeriode | ValueMaterial | ValueTrademark