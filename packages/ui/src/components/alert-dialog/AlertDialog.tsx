'use client'

import React, { useEffect, useRef } from 'react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'
import { CloseButton } from '#components/close-button'
import useForceRender from '#hooks/useForceRender'
import cx from '#lib/cx'
import { AnimatePresence, motion } from 'framer-motion'

const panelMotion = {
  initial: {
    opacity: 0,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.15, ease: 'easeIn' },
  },
}

const overlayMotion = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15, ease: 'easeIn' },
  },
}

function IconSection() {
  return (
    <div className="ui-flex ui-h-11 ui-w-11 ui-flex-shrink-0 ui-items-center ui-justify-center ui-rounded-full ui-bg-danger-50">
      <div className="ui-flex ui-h-8 ui-w-8 ui-flex-shrink-0 ui-items-center ui-justify-center ui-rounded-full ui-bg-danger-100">
        <ExclamationTriangleIcon className="ui-h-5 ui-w-5 ui-text-danger-600" />
      </div>
    </div>
  )
}

export function AlertDialogCloseButton() {
  return (
    <AlertDialogPrimitive.Cancel asChild>
      <CloseButton
        className={cx('ui-absolute ui-right-2 ui-top-2')}
      ></CloseButton>
    </AlertDialogPrimitive.Cancel>
  )
}

export function AlertDialogCancel({
  children,
}: {
  readonly children: React.ReactNode
}) {
  return (
    <AlertDialogPrimitive.Cancel asChild>
      {children}
    </AlertDialogPrimitive.Cancel>
  )
}
export function AlertDialogFooter({
  children,
}: {
  readonly children: React.ReactNode
}) {
  return (
    <div className="ui-flex ui-flex-col-reverse ui-justify-end ui-gap-3 ui-bg-gray-50 ui-px-4 ui-py-3 sm:ui-flex-row">
      {children}
    </div>
  )
}

export function AlertDialogContent({
  title,
  description,
}: Readonly<{
  title?: string
  description?: string
}>) {
  return (
    <div className="ui-px-4 ui-py-4">
      <div className="ui-flex ui-flex-col ui-items-center ui-gap-3 ui-text-center sm:ui-flex-row sm:ui-items-start sm:ui-text-left">
        <IconSection></IconSection>
        <div>
          <AlertDialogPrimitive.Title className="ui-text-lg ui-font-semibold ui-leading-6 ui-text-gray-800">
            {title}
          </AlertDialogPrimitive.Title>
          <AlertDialogPrimitive.Description className="ui-mt-2 ui-text-base ui-text-gray-600">
            {description}
          </AlertDialogPrimitive.Description>
        </div>
      </div>
    </div>
  )
}

export type AlertDialogProps = React.ComponentProps<
  typeof AlertDialogPrimitive.Root
>

export function AlertDialog(props: Readonly<AlertDialogProps>) {
  //workaround for radix bug
  const { forceRender } = useForceRender()

  const containerRef = useRef<HTMLElement | null>(null)
  useEffect(() => {
    containerRef.current = document.body
    forceRender()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <AlertDialogPrimitive.Root {...props}>
      <AnimatePresence>
        {props.open ? (
          <AlertDialogPrimitive.Portal
            container={containerRef.current}
            forceMount
          >
            <AlertDialogPrimitive.Overlay asChild forceMount>
              <motion.div
                variants={overlayMotion}
                initial="initial"
                animate="animate"
                exit="exit"
                className="ui-fixed ui-inset-0 ui-bg-black ui-bg-opacity-50"
              ></motion.div>
            </AlertDialogPrimitive.Overlay>

            <AlertDialogPrimitive.Content
              forceMount
              className="ui-fixed ui-inset-0 ui-flex ui-items-center ui-overflow-y-auto sm:ui-items-start"
            >
              <div className="ui-mt-[3.75rem] ui-flex ui-w-full ui-justify-center">
                <motion.div
                  variants={panelMotion}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className={cx(
                    'ui-relative ui-top-0',
                    'ui-w-11/12 ui-rounded-md ui-bg-white ui-shadow-xl sm:ui-w-4/5 md:ui-w-4/6 lg:ui-w-1/3',
                    'ui-overflow-hidden ui-text-left'
                  )}
                >
                  {props.children}
                </motion.div>
              </div>
            </AlertDialogPrimitive.Content>
          </AlertDialogPrimitive.Portal>
        ) : null}
      </AnimatePresence>
    </AlertDialogPrimitive.Root>
  )
}
