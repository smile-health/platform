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
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { useControllableState } from '#hooks/useControlableState'
import useForceRender from '#hooks/useForceRender'
import cx from '#lib/cx'
import { AnimatePresence, motion } from 'framer-motion'

const motionVariants = {
  initial: {
    opacity: 0,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.15, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    transition: { duration: 0.1, ease: 'easeIn' },
  },
}
type DropdownMenuProviderParams = {
  open?: boolean
  setOpen?: (value: boolean) => void
}
const DropdownCtx = createContext<DropdownMenuProviderParams>({})
const DropdownSubCtx = createContext<DropdownMenuProviderParams>({})

export const DropdownMenuGroup = DropdownMenuPrimitive.Group

export function DropdownMenuTrigger({
  children,
}: {
  readonly children?: React.ReactNode
}) {
  return (
    <DropdownMenuPrimitive.Trigger asChild>
      {children}
    </DropdownMenuPrimitive.Trigger>
  )
}

export function DropdownMenuRoot({
  children,
  open,
  onOpenChange,
  defaultOpen = false,
}: Readonly<React.ComponentProps<typeof DropdownMenuPrimitive.Root>>) {
  const [_open, _setOpen] = useControllableState({
    value: open,
    onChange: onOpenChange,
    defaultValue: defaultOpen,
  })

  const value = useMemo(() => {
    return { open: _open, setOpen: _setOpen }
  }, [_open, _setOpen])

  return (
    <DropdownCtx.Provider value={value}>
      <DropdownMenuPrimitive.Root
        open={_open}
        defaultOpen={_open}
        onOpenChange={(value) => _setOpen(value)}
      >
        {children}
      </DropdownMenuPrimitive.Root>
    </DropdownCtx.Provider>
  )
}

type DropdownMenuContentProps = React.ComponentProps<
  typeof DropdownMenuPrimitive.Content
>

export const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  DropdownMenuContentProps
>(function DropdownMenuContent(
  { children, side = 'bottom', align = 'center', sideOffset = 5, ...props },
  ref
) {
  const { open } = useContext(DropdownCtx)

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
        <DropdownMenuPrimitive.Portal
          container={containerRef.current}
          forceMount
        >
          <DropdownMenuPrimitive.Content
            {...props}
            asChild
            side={side}
            align={align}
            sideOffset={sideOffset}
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
          </DropdownMenuPrimitive.Content>
        </DropdownMenuPrimitive.Portal>
      ) : null}
    </AnimatePresence>
  )
})

type DropdownMenuItemProps = React.ComponentProps<
  typeof DropdownMenuPrimitive.Item
> & {
  color?: 'primary' | 'danger'
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  className?: string
}

export function DropdownMenuItem({
  disabled,
  leftIcon,
  rightIcon,
  color = 'primary',
  onSelect,
  className,
  ...props
}: DropdownMenuItemProps) {
  return (
    <DropdownMenuPrimitive.Item
      {...props}
      disabled={disabled}
      onSelect={onSelect}
      className={cx(
        'ui-relative ui-flex ui-items-center ui-space-x-2 ui-rounded ui-px-3 ui-py-2',
        'ui-cursor-pointer ui-text-sm focus:ui-outline-none',
        'data-[disabled]:ui-pointer-events-none data-[disabled]:ui-opacity-50',
        color === 'primary' && [
          'ui-text-gray-700',
          'data-[highlighted]:ui-bg-gray-100',
        ],
        color === 'danger' && [
          'ui-text-danger-600',
          'data-[highlighted]:ui-bg-danger-50',
        ],
        className
      )}
    >
      {leftIcon ? <div>{leftIcon}</div> : null}
      <div className="ui-flex-1">{props.children}</div>
      {rightIcon ? <div>{rightIcon}</div> : null}
    </DropdownMenuPrimitive.Item>
  )
}

export function DropdownMenuLabel({
  children,
}: {
  readonly children?: React.ReactNode
}) {
  return (
    <DropdownMenuPrimitive.Label className="ui-flex ui-items-center ui-px-3 ui-text-xs ui-text-gray-500 mb-2 mt-1.5 font-semibold ">
      {children}
    </DropdownMenuPrimitive.Label>
  )
}

export function DropdownMenuSeparator() {
  return (
    <DropdownMenuPrimitive.Separator className="ui-border-b ui-border-gray-300 mx-[-2px] my-2"></DropdownMenuPrimitive.Separator>
  )
}

export function DropdownMenuSub({
  children,
}: {
  readonly children?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  const value = useMemo(() => ({ open, setOpen }), [open, setOpen])

  return (
    <DropdownSubCtx.Provider value={value}>
      <DropdownMenuPrimitive.Sub
        open={open}
        defaultOpen={open}
        onOpenChange={(value) => setOpen(value)}
      >
        {children}
      </DropdownMenuPrimitive.Sub>
    </DropdownSubCtx.Provider>
  )
}

type DropdownMenuSubTriggerProps = React.ComponentProps<
  typeof DropdownMenuPrimitive.SubTrigger
> & {
  leftIcon?: React.ReactNode
}
export function DropdownMenuSubTrigger({
  disabled,
  leftIcon,
  children,
}: DropdownMenuSubTriggerProps) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      disabled={disabled}
      className={cx(
        'ui-relative ui-flex ui-items-center ui-space-x-2 ui-rounded ui-px-3 ui-py-2',
        'ui-cursor-pointer ui-text-sm focus:ui-outline-none',
        'data-[disabled]:ui-pointer-events-none data-[disabled]:ui-opacity-50',
        'ui-text-gray-700',
        'data-[highlighted]:ui-bg-gray-100'
      )}
    >
      {leftIcon ? <div>{leftIcon}</div> : null}
      <div className="ui-flex-1">{children}</div>
      <div className="ui-h-3.5 ui-w-3.5">
        <ChevronRightIcon></ChevronRightIcon>
      </div>
    </DropdownMenuPrimitive.SubTrigger>
  )
}

type DropdownMenuSubContentProps = React.ComponentProps<
  typeof DropdownMenuPrimitive.SubContent
>
export const DropdownMenuSubContent = React.forwardRef<
  HTMLDivElement,
  DropdownMenuSubContentProps
>(function DropdownMenuSubContent({ children, ...props }, ref) {
  const { open } = useContext(DropdownSubCtx)
  return (
    <AnimatePresence>
      {open ? (
        <DropdownMenuPrimitive.Portal forceMount>
          <DropdownMenuPrimitive.SubContent
            {...props}
            asChild
            ref={ref}
            className="ui-rounded ui-bg-white ui-px-0.5 ui-py-0.5 ui-shadow-lg ui-ring-1 ui-ring-black ui-ring-opacity-10 focus:ui-outline-none"
          >
            <motion.div
              variants={motionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {children}
            </motion.div>
          </DropdownMenuPrimitive.SubContent>
        </DropdownMenuPrimitive.Portal>
      ) : null}
    </AnimatePresence>
  )
})
