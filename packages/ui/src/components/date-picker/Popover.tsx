'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef } from 'react'
import useForceRender from '#hooks/useForceRender'
import { motion } from 'framer-motion'
import { DismissButton, Overlay, usePopover } from 'react-aria'
import type { AriaPopoverProps } from 'react-aria'
import type { OverlayTriggerState } from 'react-stately'

const motionVariants = {
  initial: {
    opacity: 0,
    y: '4%',
    x: 0,
  },
  animate: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    y: '3%',
    x: 0,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
}

interface PopoverProps extends Omit<AriaPopoverProps, 'popoverRef'> {
  children: React.ReactNode
  state: OverlayTriggerState
}

export function Popover({ children, state, ...props }: Readonly<PopoverProps>) {
  const popoverRef = useRef<HTMLDivElement>(null)
  const { popoverProps, underlayProps } = usePopover(
    {
      ...props,
      popoverRef,
    },
    state
  )

  const { forceRender } = useForceRender()

  useEffect(() => {
    forceRender()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Overlay>
      <div
        {...underlayProps}
        className="ui-fixed ui-inset-0 ui-date-picker-popover"
      />
      <motion.div
        {...(popoverProps as any)}
        ref={popoverRef}
        variants={motionVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="ui-date-picker-popover ui-pointer-events-auto ui-mt-2 ui-rounded ui-bg-white ui-shadow-lg ui-outline-none ui-ring-1 ui-ring-black ui-ring-opacity-10"
      >
        <DismissButton onDismiss={state.close} />
        {children}
        <DismissButton onDismiss={state.close} />
      </motion.div>
    </Overlay>
  )
}
