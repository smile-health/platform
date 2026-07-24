'use client'

import React, { useEffect, useRef } from 'react'
import { XMarkIcon } from '@heroicons/react/24/solid'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import useForceRender from '#hooks/useForceRender'
import { useOnClickOutside } from '#hooks/useOnClickOutside'
import cx from '#lib/cx'
import { AnimatePresence, motion } from 'framer-motion'

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

const contentMotionVariants = {
  left: {
    initial: { x: '-100%', y: 0 },
    animate: { x: 0, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
    exit: {
      x: '-100%',
      y: 0,
      transition: { duration: 0.15, ease: 'easeIn' },
    },
  },
  right: {
    initial: { x: '100%', y: 0 },
    animate: { x: 0, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
    exit: {
      x: '100%',
      y: 0,
      transition: { duration: 0.15, ease: 'easeIn' },
    },
  },
  top: {
    initial: { x: 0, y: '-100%' },
    animate: { x: 0, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
    exit: {
      x: 0,
      y: '-100%',
      transition: { duration: 0.15, ease: 'easeIn' },
    },
  },
  bottom: {
    initial: { x: 0, y: '100%' },
    animate: { x: 0, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
    exit: {
      x: 0,
      y: '100%',
      transition: { duration: 0.15, ease: 'easeIn' },
    },
  },
}

export function DrawerTitle({ value }: { readonly value: string }) {
  return (
    <div className="ui-text-lg ui-text-gray-800 font-semibold">{value}</div>
  )
}

export function DrawerHeader({
  children,
  className,
  title,
}: Readonly<{
  children?: React.ReactNode
  className?: string
  title?: string
}>) {
  return (
    <div className={cx('ui-px-5 ui-py-3', className)}>
      {title && <DrawerTitle value={title} />}
      {children}
    </div>
  )
}

export function DrawerContent({
  id,
  children,
  className,
}: Readonly<{
  id?: string
  children?: React.ReactNode
  className?: string
}>) {
  return (
    <div
      id={id}
      className={cx('ui-flex-1 ui-overflow-auto ui-px-5 ui-py-2', className)}
    >
      {children}
    </div>
  )
}

export function DrawerFooter({
  children,
  className,
}: Readonly<{
  children?: React.ReactNode
  className?: string
}>) {
  return (
    <div
      className={cx(
        'ui-flex ui-justify-end ui-space-x-3 ui-px-5 ui-py-3',
        className
      )}
    >
      {children}
    </div>
  )
}
export function DrawerCloseButton() {
  return (
    <DialogPrimitive.Close asChild>
      <button
        className={cx(
          'ui-absolute ui-right-2 ui-top-2 ui-rounded ui-p-0.5 ui-text-gray-800 hover:ui-bg-gray-200 active:ui-bg-gray-300'
        )}
      >
        <XMarkIcon className="ui-h-5 ui-w-5"></XMarkIcon>
      </button>
    </DialogPrimitive.Close>
  )
}

type DrawerProps = React.ComponentProps<typeof DialogPrimitive.Root> & {
  id?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  sizeHeight?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  placement?: 'left' | 'right' | 'top' | 'bottom'
  closeOnOverlayClick?: boolean
  className?: string
  overlayClassName?: string
  drawerClassName?: string
}

export function Drawer({
  id,
  open,
  onOpenChange,
  children,
  closeOnOverlayClick = true,
  placement = 'left',
  size = 'xs',
  sizeHeight = 'full',
  className,
  overlayClassName,
  drawerClassName,
  ...props
}: DrawerProps) {
  const ref = useRef<HTMLDivElement>(null)
  useOnClickOutside(ref, () => {
    if (closeOnOverlayClick) {
      onOpenChange?.(false)
    }
  })

  //workaround for radix bug
  const { forceRender } = useForceRender()
  const containerRef = useRef<HTMLElement>()
  useEffect(() => {
    containerRef.current = document.body
    forceRender()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const classConfig = {
    height: {
      xs: 'ui-max-h-xs',
      sm: 'ui-max-h-sm',
      md: 'ui-max-h-md',
      lg: 'ui-max-h-lg',
      xl: 'ui-max-h-xl',
      full: 'ui-h-full',
    },
    width: {
      xs: 'ui-w-[20rem]',
      sm: 'ui-w-[25rem]',
      md: 'ui-w-[30rem]',
      lg: 'ui-w-[35rem]',
      xl: 'ui-w-[45rem]',
      full: 'ui-w-full',
    },
    placement: {
      left: 'ui-left-0',
      right: 'ui-right-0',
      top: 'ui-top-0',
      bottom: 'ui-bottom-0',
    },
  }

  return (
    <DialogPrimitive.Root {...props} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open ? (
          <DialogPrimitive.Portal forceMount container={containerRef.current}>
            <DialogPrimitive.Overlay
              className={cx(overlayClassName)}
              asChild
              forceMount
            >
              <motion.div
                variants={overlayMotion}
                initial="initial"
                animate="animate"
                exit="exit"
                className="ui-fixed ui-inset-0 ui-bg-black ui-bg-opacity-50"
              ></motion.div>
            </DialogPrimitive.Overlay>
            <DialogPrimitive.Content
              asChild
              forceMount
              id={id}
              onInteractOutside={(e) => {
                if (!closeOnOverlayClick) {
                  e.preventDefault()
                }
              }}
            >
              <div
                className={cx(
                  'ui-fixed ui-left-0 ui-top-0 ui-flex ui-w-screen ui-justify-center ui-overflow-y-auto z-10',
                  drawerClassName
                )}
              >
                <motion.div
                  ref={ref}
                  variants={contentMotionVariants[placement]}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className={cx(
                    'ui-fixed ui-flex ui-flex-col ui-bg-white',
                    'focus:ui-outline-none focus-visible:ui-ring focus-visible:ui-ring-purple-500 focus-visible:ui-ring-opacity-75',
                    className,
                    {
                      [classConfig.placement[placement]]:
                        classConfig.placement[placement],
                    },
                    {
                      [classConfig.width[size]]: classConfig.width[size],
                    },
                    {
                      [classConfig.height[sizeHeight]]:
                        classConfig.height[sizeHeight],
                    }
                  )}
                >
                  {children}
                </motion.div>
              </div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        ) : null}
      </AnimatePresence>
    </DialogPrimitive.Root>
  )
}
