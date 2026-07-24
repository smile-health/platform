export type MapSeriesDataItem = {
  id: number
  name: string
  value: number
  selected?: boolean
  itemStyle?: {
    color?: string
  }
  emphasis?: {
    itemStyle?: {
      areaColor?: string
    }
  }
  label?: {
    show: boolean
  }
  tooltip?: {
    show?: boolean
    confine?: boolean
    formatter?: string | ((params: any) => string)
  }
}

export type Map =
  | 'indonesia'
  | 'aceh'
  | 'bali'
  | 'bangka-belitung-island'
  | 'banten'
  | 'bengkulu'
  | 'central-java'
  | 'central-kalimantan'
  | 'central-papua'
  | 'central-sulawesi'
  | 'east-java'
  | 'east-kalimantan'
  | 'east-nusa-tenggara'
  | 'gorontalo'
  | 'highland-papua'
  | 'jakarta'
  | 'jambi'
  | 'lampung'
  | 'maluku'
  | 'north-kalimantan'
  | 'north-maluku'
  | 'north-sulawesi'
  | 'north-sumatera'
  | 'papua'
  | 'riau-island'
  | 'riau'
  | 'south-kalimantan'
  | 'south-papua'
  | 'south-sulawesi'
  | 'south-sumatera'
  | 'southeast-sulawesi'
  | 'southwest-papua'
  | 'west-java'
  | 'west-kalimantan'
  | 'west-nusa-tenggara'
  | 'west-papua'
  | 'west-sulawesi'
  | 'west-sumatera'
  | 'yogyakarta'
