'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { useControllableState } from '#hooks/useControlableState'
import useForceRender from '#hooks/useForceRender'
import cx from '#lib/cx'
import { AnimatePresence, motion } from 'framer-motion'

type PopoverProviderParams = {
  open?: boolean
  setOpen?: (value: boolean) => void
}

const PopoverCtx = createContext<PopoverProviderParams>({})
function usePopover() {
  const context = useContext(PopoverCtx)
  if (context === undefined) {
    throw new Error('usePopover must be used within a PopoverCtx.Provider')
  }
  return context
}

export function PopoverTrigger({
  children,
}: {
  readonly children?: React.ReactNode
}) {
  return <PopoverPrimitive.Trigger asChild>{children}</PopoverPrimitive.Trigger>
}

export function PopoverRoot({
  children,
  open,
  onOpenChange,
  defaultOpen = false,
  ...props
}: Readonly<React.ComponentProps<typeof PopoverPrimitive.Root>>) {
  const [_open, _setOpen] = useControllableState({
    value: open,
    onChange: onOpenChange,
    defaultValue: defaultOpen,
  })

  const value = useMemo(() => {
    return { open: _open, setOpen: _setOpen }
  }, [_open, _setOpen])

  return (
    <PopoverCtx.Provider value={value}>
      <PopoverPrimitive.Root
        {...props}
        open={_open}
        defaultOpen={_open}
        onOpenChange={(value) => _setOpen(value)}
      >
        {children}
      </PopoverPrimitive.Root>
    </PopoverCtx.Provider>
  )
}

export function PopoverArrow() {
  return (
    <PopoverPrimitive.Arrow asChild>
      <div className="ui-relative ui-h-[4px] ui-w-[13px]">
        <div
          className={cx(
            'ui-absolute ui-h-2 ui-w-2 ui-rotate-45',
            'ui-left-0 ui-right-0 ui-ml-auto ui-mr-auto',
            'ui-top-[-4px] ui-border-b ui-border-r ui-border-gray-300 ui-bg-white ui-shadow-sm'
          )}
        ></div>
      </div>
    </PopoverPrimitive.Arrow>
  )
}

export function PopoverContent({
  children,
  side = 'bottom',
  align = 'center',
  sideOffset = 2,
  container,
  className,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content> & {
  container?: HTMLElement | null
}) {
  const { open } = usePopover()

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
        <PopoverPrimitive.Portal
          forceMount
          container={container ?? containerRef.current}
        >
          <PopoverPrimitive.Content
            {...props}
            side={side}
            align={align}
            sideOffset={sideOffset}
            asChild
            forceMount
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                transition: { duration: 0.15, ease: 'easeOut' },
              }}
              exit={{
                opacity: 0,
                scale: 0.97,
                transition: { duration: 0.1, ease: 'easeIn' },
              }}
              className={cx(
                'ui-rounded ui-border ui-border-gray-300 ui-bg-white ui-p-3 ui-text-gray-700 ui-shadow',
                className
              )}
            >
              {children}
            </motion.div>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      ) : null}
    </AnimatePresence>
  )
}
