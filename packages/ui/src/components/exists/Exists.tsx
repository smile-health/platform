import { ReactNode } from 'react'

type ExistsProps = {
  useIt: boolean
  children: ReactNode
}

export function Exists({ useIt, children }: ExistsProps) {
  if (useIt) return children

  return null
}
