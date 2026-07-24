'use client'

import React, { useEffect, useRef } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { CloseButton } from '#components/close-button'
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

const contentMotion = {
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

type DialogHeaderProps = React.PropsWithChildren<{
  className?: string
  containerClassName?: string
  border?: boolean
}>

export function DialogHeader({
  children,
  className,
  containerClassName,
  border = false,
}: DialogHeaderProps) {
  return (
    <div
      className={cx(
        'ui-px-5 ui-py-3',
        { 'ui-border-b': border },
        containerClassName
      )}
    >
      <div
        className={cx(
          'ui-text-lg ui-font-semibold ui-text-gray-800',
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}

type DialogContentProps = React.PropsWithChildren<{
  className?: string
  contentTitle?: string
  contentTitleClassName?: string
}>

export function DialogContent({
  children,
  className,
  contentTitle,
  contentTitleClassName = '',
}: DialogContentProps) {
  return (
    <>
      <DialogPrimitive.Title
        className={contentTitleClassName}
        hidden={!contentTitle}
      >
        {contentTitle}
      </DialogPrimitive.Title>
      <div
        className={cx('ui-grow ui-overflow-auto ui-px-5 ui-py-2', className)}
      >
        {children}
      </div>
    </>
  )
}

type DialogFooterProps = React.PropsWithChildren<{
  className?: string
  border?: boolean
}>

export function DialogFooter({
  children,
  className,
  border,
}: DialogFooterProps) {
  return (
    <div
      className={cx(
        'ui-flex ui-justify-end ui-space-x-3 ui-px-5 ui-pt-3 ui-pb-5',
        { 'ui-border-t': border },
        className
      )}
    >
      {children}
    </div>
  )
}

type DialogCloseButtonProps = React.PropsWithChildren<{
  className?: string
  onClick?: () => void
}>

export function DialogCloseButton({
  className,
  onClick,
}: DialogCloseButtonProps) {
  return (
    <DialogPrimitive.Close asChild>
      <CloseButton
        onClick={onClick}
        id="dialogCloseButton"
        className={cx('ui-absolute ui-right-2 ui-top-2', className)}
      ></CloseButton>
    </DialogPrimitive.Close>
  )
}

export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

export type DialogProps = React.ComponentProps<typeof DialogPrimitive.Root> & {
  closeOnOverlayClick?: boolean
  verticalCentered?: boolean
  scrollBehavior?: 'inside' | 'outside'
  size?: Size
  Title?: React.FC
  className?: string
  classNameOverlay?: string
}

export function Dialog({
  open,
  onOpenChange,
  children,
  closeOnOverlayClick = true,
  verticalCentered = false,
  scrollBehavior = 'inside',
  size = 'md',
  className,
  classNameOverlay,
  ...props
}: DialogProps) {
  const ref = useRef<HTMLDivElement>(null)
  useOnClickOutside(ref, () => {
    if (closeOnOverlayClick) {
      onOpenChange?.(false)
    }
  })

  //workaround for radix bug
  const { forceRender } = useForceRender()
  const containerRef = useRef<HTMLElement | null>(null)
  useEffect(() => {
    containerRef.current = document.body
    forceRender()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <DialogPrimitive.Root {...props} open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open ? (
          <DialogPrimitive.Portal forceMount container={containerRef.current}>
            {scrollBehavior === 'inside' ? (
              <React.Fragment>
                <DialogPrimitive.Overlay asChild forceMount>
                  <motion.div
                    variants={overlayMotion}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className={cx(
                      'ui-fixed ui-inset-0 ui-h-screen ui-bg-black ui-bg-opacity-50',
                      classNameOverlay
                    )}
                  ></motion.div>
                </DialogPrimitive.Overlay>
                <DialogPrimitive.Content
                  asChild
                  forceMount
                  onInteractOutside={(e) => {
                    if (!closeOnOverlayClick) {
                      e.preventDefault()
                    }
                  }}
                >
                  <motion.div
                    ref={ref}
                    variants={contentMotion}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className={cx(
                      'ui-fixed ui-mx-auto ui-flex ui-w-full ui-flex-col',
                      'ui-bottom-0 ui-left-0 ui-right-0 ui-top-0',
                      'ui-h-min ui-rounded-md ui-bg-white',
                      'focus:ui-outline-none focus-visible:ui-ring focus-visible:ui-ring-purple-500 focus-visible:ui-ring-opacity-75',
                      {
                        'ui-my-10': !verticalCentered,
                        'ui-my-auto': verticalCentered,
                      },
                      {
                        'ui-max-h-[calc(100%-5rem)]':
                          scrollBehavior === 'inside',
                      },
                      {
                        'ui-max-w-[20rem]': size === 'xs',
                        'ui-max-w-[25rem]': size === 'sm',
                        'ui-max-w-[30rem]': size === 'md',
                        'ui-max-w-[35rem]': size === 'lg',
                        'ui-max-w-[45rem]': size === 'xl',
                        'ui-max-w-[70rem]': size === '2xl',
                      },
                      className
                    )}
                  >
                    {children}
                  </motion.div>
                </DialogPrimitive.Content>
              </React.Fragment>
            ) : (
              <DialogPrimitive.Overlay asChild forceMount>
                <motion.div
                  variants={overlayMotion}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className={cx(
                    'ui-absolute ui-top-0 ui-overflow-y-auto ui-bg-black ui-bg-opacity-50',
                    'ui-flex ui-h-screen ui-w-screen ui-justify-center ui-py-10'
                  )}
                >
                  <DialogPrimitive.Content
                    asChild
                    forceMount
                    onInteractOutside={(e) => {
                      if (!closeOnOverlayClick) {
                        e.preventDefault()
                      }
                    }}
                  >
                    <motion.div
                      ref={ref}
                      variants={contentMotion}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className={cx(
                        'ui-relative ui-mx-auto ui-w-full',
                        'ui-h-min ui-rounded-md ui-bg-white',
                        'focus:ui-outline-none focus-visible:ui-ring focus-visible:ui-ring-purple-500 focus-visible:ui-ring-opacity-75',
                        {
                          'ui-my-auto': verticalCentered,
                        },
                        {
                          'ui-max-w-[20rem]': size === 'xs',
                          'ui-max-w-[25rem]': size === 'sm',
                          'ui-max-w-[30rem]': size === 'md',
                          'ui-max-w-[35rem]': size === 'lg',
                          'ui-max-w-[45rem]': size === 'xl',
                        }
                      )}
                    >
                      {children}
                    </motion.div>
                  </DialogPrimitive.Content>
                </motion.div>
              </DialogPrimitive.Overlay>
            )}
          </DialogPrimitive.Portal>
        ) : null}
      </AnimatePresence>
    </DialogPrimitive.Root>
  )
}
