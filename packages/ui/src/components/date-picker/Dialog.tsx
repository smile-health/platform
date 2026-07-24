'use client'

import React from 'react'
import { useDialog } from 'react-aria'
import type { AriaDialogProps } from 'react-aria'

interface DialogProps extends AriaDialogProps {
  children: React.ReactNode
}
export function Dialog(props: Readonly<DialogProps>) {
  const ref = React.useRef<HTMLDivElement>(null)
  const { dialogProps } = useDialog(props, ref)

  return (
    <div {...dialogProps} ref={ref}>
      {props.children}
    </div>
  )
}
