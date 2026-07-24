'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { ChevronRightIcon } from '@heroicons/react/24/outline'
import * as ContextMenuPrimitive from '@radix-ui/react-context-menu'
import useForceRender from '#hooks/useForceRender'
import cx from '#lib/cx'
import { AnimatePresence, motion } from 'framer-motion'

const motionVariants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: { duration: 0.1, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.09, ease: 'easeIn' },
  },
}

type ContexMenuProviderParams = {
  open?: boolean
  setOpen?: (value: boolean) => void
}
const ContextCtx = createContext<ContexMenuProviderParams>({})
const ContextSubCtx = createContext<ContexMenuProviderParams>({})

export const ContextMenuGroup = ContextMenuPrimitive.Group

export function ContextMenuTrigger({
  children,
}: {
  readonly children: React.ReactNode
}) {
  return (
    <ContextMenuPrimitive.Trigger asChild>
      {children}
    </ContextMenuPrimitive.Trigger>
  )
}

export function ContextMenuRoot({
  children,
  onOpenChange,
}: Readonly<React.ComponentProps<typeof ContextMenuPrimitive.Root>>) {
  const [open, setOpen] = useState(false)

  const value = useMemo(() => ({ open }), [open])

  return (
    <ContextCtx.Provider value={value}>
      <ContextMenuPrimitive.Root
        onOpenChange={(value) => {
          setOpen(value)
          onOpenChange?.(value)
        }}
      >
        {children}
      </ContextMenuPrimitive.Root>
    </ContextCtx.Provider>
  )
}

type ContextMenuContentProps = React.ComponentProps<
  typeof ContextMenuPrimitive.Content
>

export const ContextMenuContent = React.forwardRef<
  HTMLDivElement,
  ContextMenuContentProps
>(function ContextMenuContent({ children, ...props }, ref) {
  const { open } = useContext(ContextCtx)

  //workaround for radix bug
  const { forceRender } = useForceRender()
  const containerRef = useRef<HTMLElement>()
  useEffect(() => {
    containerRef.current = document.body
    forceRender()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <AnimatePresence>
      {open ? (
        <ContextMenuPrimitive.Portal
          container={containerRef.current}
          forceMount
        >
          <ContextMenuPrimitive.Content
            asChild
            {...props}
            ref={ref}
            className="ui-rounded ui-border ui-border-gray-300 ui-bg-white ui-px-0.5 ui-py-0.5 ui-shadow-lg"
          >
            <motion.div
              variants={motionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {children}
            </motion.div>
          </ContextMenuPrimitive.Content>
        </ContextMenuPrimitive.Portal>
      ) : null}
    </AnimatePresence>
  )
})

type ContextMenuItemProps = React.ComponentProps<
  typeof ContextMenuPrimitive.Item
> & {
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  color?: 'primary' | 'danger'
}

export function ContextMenuItem({
  disabled,
  leftIcon,
  rightIcon,
  color = 'primary',
  onSelect,
  ...props
}: ContextMenuItemProps) {
  return (
    <ContextMenuPrimitive.Item
      disabled={disabled}
      onSelect={onSelect}
      className={cx(
        'ui-relative ui-flex ui-items-center ui-space-x-2 ui-rounded ui-px-3 ui-py-2',
        'ui-cursor-pointer ui-text-sm focus:outline-none',
        'data-[disabled]:ui-pointer-events-none data-[disabled]:ui-opacity-50',
        color === 'primary' && [
          'ui-text-gray-700',
          'data-[highlighted]:ui-bg-gray-100',
        ],
        color === 'danger' && [
          'ui-text-danger-600',
          'data-[highlighted]:ui-bg-danger-50',
        ]
      )}
    >
      {leftIcon ? <div>{leftIcon}</div> : null}
      <div className="flex-1">{props.children}</div>
      {rightIcon ? <div>{rightIcon}</div> : null}
    </ContextMenuPrimitive.Item>
  )
}

export function ContextMenuLabel(props: {
  readonly children: React.ReactNode
}) {
  return (
    <ContextMenuPrimitive.Label className="ui-mb-2 ui-mt-1.5 ui-flex ui-items-center ui-px-3 ui-text-xs ui-font-semibold ui-text-gray-500 ">
      {props.children}
    </ContextMenuPrimitive.Label>
  )
}

export function ContextMenuSeparator() {
  return (
    <ContextMenuPrimitive.Separator className="ui-mx-[-2ui-px] ui-my-2 ui-border-b ui-border-gray-300"></ContextMenuPrimitive.Separator>
  )
}

export function ContextMenuSub({
  children,
}: {
  readonly children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  const value = useMemo(() => ({ open, setOpen }), [open, setOpen])

  return (
    <ContextSubCtx.Provider value={value}>
      <ContextMenuPrimitive.Sub
        open={open}
        onOpenChange={(value) => setOpen(value)}
      >
        {children}
      </ContextMenuPrimitive.Sub>
    </ContextSubCtx.Provider>
  )
}

type ContextMenuSubTriggerProps = React.ComponentProps<
  typeof ContextMenuPrimitive.SubTrigger
> & {
  leftIcon?: React.ReactNode
}

export function ContextMenuSubTrigger({
  disabled,
  leftIcon,
  ...props
}: ContextMenuSubTriggerProps) {
  return (
    <ContextMenuPrimitive.SubTrigger
      disabled={disabled}
      className={cx(
        'ui-relative ui-flex ui-items-center ui-space-x-2 ui-rounded ui-px-3 ui-py-2',
        'ui-cursor-pointer ui-ui-text-sm focus:ui-outline-none',
        'data-[disabled]:ui-pointer-events-none data-[disabled]:ui-opacity-50',
        'ui-text-gray-700',
        'data-[highlighted]:ui-bg-gray-100'
      )}
    >
      {leftIcon ? <div>{leftIcon}</div> : null}
      <div className="ui-flex-1">{props.children}</div>
      <div className="ui-h-3.5 ui-w-3.5">
        <ChevronRightIcon />
      </div>
    </ContextMenuPrimitive.SubTrigger>
  )
}

type ContextMenuSubContentProps = React.ComponentProps<
  typeof ContextMenuPrimitive.SubContent
>

export const ContextMenuSubContent = React.forwardRef<
  HTMLDivElement,
  ContextMenuSubContentProps
>(function ContextMenuSubContent({ children, ...props }, ref) {
  const { open } = useContext(ContextSubCtx)

  return (
    <AnimatePresence>
      {open ? (
        <ContextMenuPrimitive.Portal forceMount>
          <ContextMenuPrimitive.SubContent
            {...props}
            asChild
            ref={ref}
            className="ui-rounded ui-bg-white ui-px-0.5 ui-py-0.5 ui-shadow-lg ui-ring-1 ui-ring-black ui-ring-opacity-5 focus:ui-outline-none"
          >
            <motion.div
              variants={motionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {children}
            </motion.div>
          </ContextMenuPrimitive.SubContent>
        </ContextMenuPrimitive.Portal>
      ) : null}
    </AnimatePresence>
  )
})
