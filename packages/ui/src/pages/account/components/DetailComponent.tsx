import React from 'react'
import { RenderDetailValue } from '#components/modules/RenderDetailValue'

export type TFieldValue = {
  label: string
  value: string
  id: string
}

export type TFields = {
  title: string
  showLatestLoginInfo?: boolean
  buttons?: {
    label: string
    url: string
    id?: string
  }[]
  fields: TFieldValue[]
}

export type DetailComponentProps = {
  fields: TFields
  id?: string
}

export default function DetailComponent({
  fields,
  id,
}: Readonly<DetailComponentProps>) {
  return (
    <div>
      <div className="border rounded ui-border-[#d2d2d2] mt-6 p-4" id={id}>
        <div className="mb-4 font-bold">{fields.title}</div>
        <RenderDetailValue data={fields.fields} />
      </div>
    </div>
  )
}
