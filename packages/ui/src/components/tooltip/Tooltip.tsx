'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { useControllableState } from '#hooks/useControlableState'
import useForceRender from '#hooks/useForceRender'
import cx from '#lib/cx'
import { AnimatePresence, motion } from 'framer-motion'

type ProviderParams = {
  open?: boolean
  setOpen?: (value: boolean) => void
}

const TooltipCtx = createContext<ProviderParams>({})

export function TooltipTrigger(props: { readonly children: React.ReactNode }) {
  return (
    <TooltipPrimitive.Trigger asChild>
      {props.children}
    </TooltipPrimitive.Trigger>
  )
}

export type TooltipRootProps = TooltipPrimitive.TooltipProviderProps &
  TooltipPrimitive.TooltipProps

export function TooltipRoot({
  children,
  open,
  onOpenChange,
  defaultOpen = false,
  delayDuration = 700,
  skipDelayDuration = 300,
  disableHoverableContent,
}: TooltipRootProps) {
  const [_open, _setOpen] = useControllableState<boolean>({
    value: open,
    onChange: onOpenChange,
    defaultValue: defaultOpen,
  })

  const value = useMemo(() => {
    return { open: _open, setOpen: _setOpen }
  }, [_open, _setOpen])

  return (
    <span>
      <TooltipCtx.Provider value={value}>
        <TooltipPrimitive.Provider skipDelayDuration={skipDelayDuration}>
          <TooltipPrimitive.Root
            open={_open}
            defaultOpen={_open}
            onOpenChange={(value) => _setOpen(value)}
            delayDuration={delayDuration}
            disableHoverableContent={disableHoverableContent}
          >
            {children}
          </TooltipPrimitive.Root>
        </TooltipPrimitive.Provider>
      </TooltipCtx.Provider>
    </span>
  )
}

export type TooltipContentProps = React.ComponentPropsWithoutRef<
  typeof TooltipPrimitive.Content
> & {
  color?: 'dark' | 'light'
}

export const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(
  (
    {
      children,
      color = 'light',
      side = 'top',
      sideOffset = 4,
      align = 'center',
      alignOffset = 0,
      ...props
    },
    ref
  ) => {
    const { open } = useContext(TooltipCtx)

    //workaround for radix bug
    const { forceRender } = useForceRender()
    const containerRef = useRef<HTMLElement | null>(null)
    useEffect(() => {
      containerRef.current = document.body
      forceRender()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
      <AnimatePresence>
        {open ? (
          <TooltipPrimitive.Portal container={containerRef.current} forceMount>
            <TooltipPrimitive.Content
              ref={ref}
              forceMount
              side={side}
              align={align}
              sideOffset={sideOffset}
              alignOffset={alignOffset}
              {...props}
            >
              <motion.div
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                  transition: { duration: 0.15, ease: 'easeOut' },
                }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.1, ease: 'easeIn' },
                }}
                className={cx('ui-relative ui-rounded ui-px-2 ui-py-2', {
                  'ui-bg-gray-800 ui-text-white': color === 'dark',
                  'ui-border ui-border-gray-300 ui-bg-white ui-text-gray-700 ui-shadow':
                    color === 'light',
                })}
              >
                <TooltipPrimitive.Arrow asChild>
                  <div className="ui-relative ui-h-[4px] ui-w-[13px]">
                    <div
                      className={cx(
                        'ui-absolute ui-h-2 ui-w-2 ui-rotate-45',
                        'ui-left-0 ui-right-0 ui-ml-auto ui-mr-auto',
                        {
                          'ui-top-[-4px] ui-bg-gray-800': color === 'dark',
                          'ui-top-[-3.5px] ui-border-b ui-border-r ui-border-gray-300 ui-bg-white ui-shadow-sm':
                            color === 'light',
                        }
                      )}
                    ></div>
                  </div>
                </TooltipPrimitive.Arrow>
                <span className="ui-block ui-text-sm">{children}</span>
              </motion.div>
            </TooltipPrimitive.Content>
          </TooltipPrimitive.Portal>
        ) : null}
      </AnimatePresence>
    )
  }
)
TooltipContent.displayName = TooltipPrimitive.Content.displayName
