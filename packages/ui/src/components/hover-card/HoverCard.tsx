'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import * as HoverCardPrimitive from '@radix-ui/react-hover-card'
import { useControllableState } from '#hooks/useControlableState'
import useForceRender from '#hooks/useForceRender'
import cx from '#lib/cx'
import { AnimatePresence, motion } from 'framer-motion'

type HoverCardProviderParams = {
  open?: boolean
  setOpen?: (value: boolean) => void
}

const HoverCardCtx = createContext<HoverCardProviderParams>({})

export function HoverCardTrigger({
  children,
}: {
  readonly children?: React.ReactNode
}) {
  return (
    <HoverCardPrimitive.Trigger asChild>{children}</HoverCardPrimitive.Trigger>
  )
}

export function HoverCardRoot({
  children,
  open,
  onOpenChange,
  defaultOpen = false,
  openDelay = 700,
  closeDelay = 300,
}: Readonly<React.ComponentProps<typeof HoverCardPrimitive.Root>>) {
  const [_open, _setOpen] = useControllableState({
    value: open,
    onChange: onOpenChange,
    defaultValue: defaultOpen,
  })

  const value = useMemo(() => {
    return { open: _open, setOpen: _setOpen }
  }, [_open, _setOpen])

  return (
    <HoverCardCtx.Provider value={value}>
      <HoverCardPrimitive.Root
        open={_open}
        defaultOpen={_open}
        onOpenChange={(value) => _setOpen(value)}
        openDelay={openDelay}
        closeDelay={closeDelay}
      >
        {children}
      </HoverCardPrimitive.Root>
    </HoverCardCtx.Provider>
  )
}

export function HoverCardArrow() {
  return (
    <HoverCardPrimitive.Arrow asChild>
      <div className="ui-relative ui-h-[4px] ui-w-[13px]">
        <div
          className={cx(
            'ui-absolute ui-h-2 ui-w-2 ui-rotate-45',
            'ui-left-0 ui-right-0 ui-ml-auto ui-mr-auto',
            'ui-top-[-4px] ui-border-b ui-border-r ui-border-gray-300 ui-bg-white ui-shadow-sm'
          )}
        ></div>
      </div>
    </HoverCardPrimitive.Arrow>
  )
}

export function HoverCardContent({
  children,
  side = 'bottom',
  align = 'center',
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Content>) {
  const { open } = useContext(HoverCardCtx)

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
        <HoverCardPrimitive.Portal forceMount container={containerRef.current}>
          <HoverCardPrimitive.Content
            {...props}
            side={side}
            align={align}
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
              className="ui-rounded ui-border ui-border-gray-300 ui-bg-white ui-p-3 ui-text-gray-700 ui-shadow"
            >
              {children}
            </motion.div>
          </HoverCardPrimitive.Content>
        </HoverCardPrimitive.Portal>
      ) : null}
    </AnimatePresence>
  )
}
