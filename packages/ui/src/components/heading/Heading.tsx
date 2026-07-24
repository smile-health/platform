import React from 'react'

type HeadingProps = Readonly<{
  children?: React.ReactNode
}>

export function H1({ children }: HeadingProps) {
  return (
    <h1 className="ui-text-3xl ui-font-bold ui-text-gray-800">{children}</h1>
  )
}

export function H2({ children }: HeadingProps) {
  return (
    <h2 className="ui-text-2xl ui-font-bold ui-text-gray-800">{children}</h2>
  )
}

export function H3({ children }: HeadingProps) {
  return (
    <h3 className="ui-text-xl ui-font-bold ui-text-gray-800">{children}</h3>
  )
}

export function H4({ children }: HeadingProps) {
  return (
    <h4 className="ui-text-lg ui-font-bold ui-text-gray-800">{children}</h4>
  )
}

export function H5({ children }: HeadingProps) {
  return (
    <h5 className="ui-text-base ui-font-bold ui-text-gray-800">{children}</h5>
  )
}

export function H6({ children }: HeadingProps) {
  return (
    <h6 className="ui-text-sm ui-font-bold ui-text-gray-800">{children}</h6>
  )
}
