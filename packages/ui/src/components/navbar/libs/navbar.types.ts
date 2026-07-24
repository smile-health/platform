export type TLeftMenu = {
  title?: string
  subTitle?: string
  chosenTitle?: string
  isHidden?: boolean
  link?: string
  url?: string
  separator?: boolean
  subChild?: Array<TLeftMenu>
  sub?: Array<TLeftMenu>
  [key: string]: any
} | null
