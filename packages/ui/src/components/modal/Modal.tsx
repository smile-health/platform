import { createContext, useContext, useMemo, useRef } from 'react'
import { CloseButton } from '#components/close-button'
import { useControllableState } from '#hooks/useControlableState'
import cx from '#lib/cx'
import { AnimatePresence, HTMLMotionProps, motion } from 'framer-motion'
import {
  FocusScope,
  ModalProvider,
  OverlayContainer,
  useModal,
  useOverlay,
  usePreventScroll,
} from 'react-aria'

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

type Provider = {
  open?: boolean
  setOpen?: (open: boolean) => void
}

const ModalContext = createContext<Provider>({})

// Hook to use modal context
export function useModalContext() {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error('Modal components must be used within ModalRoot')
  }
  return context
}

export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
export type ModalProps = {
  children: React.ReactNode
  isOpen: boolean
  onClose: () => void
  scrollBehavior?: 'inside' | 'outside'
  closeOnOverlayClick?: boolean
  verticalCentered?: boolean
  size?: Size
  className?: string
  classNameOverlay?: string
  portalContainer?: Element
}

function Modal({
  children,
  isOpen,
  onClose,
  size = 'md',
  className,
  scrollBehavior = 'inside',
  classNameOverlay,
  verticalCentered,
  closeOnOverlayClick = true,
  portalContainer,
}: ModalProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { modalProps } = useModal()
  const { overlayProps, underlayProps } = useOverlay(
    {
      isOpen,
      onClose,
      shouldCloseOnBlur: false,
      isDismissable: closeOnOverlayClick,
    },
    ref
  )

  const container = portalContainer ? { portalContainer } : {}

  usePreventScroll({ isDisabled: !isOpen })

  return (
    <OverlayContainer {...container}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={overlayMotion}
            initial="initial"
            animate="animate"
            exit="exit"
            className={cx(
              'ui-fixed ui-inset-0 ui-h-screen ui-bg-black ui-bg-opacity-50',
              classNameOverlay
            )}
            {...(underlayProps as HTMLMotionProps<'div'>)}
          >
            <FocusScope contain>
              <motion.div
                ref={ref}
                variants={contentMotion}
                initial="initial"
                animate="animate"
                exit="exit"
                {...(overlayProps as HTMLMotionProps<'div'>)}
                {...(modalProps as HTMLMotionProps<'div'>)}
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
                    'ui-max-h-[calc(100%-5rem)] ui-h-auto':
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
            </FocusScope>
          </motion.div>
        )}
      </AnimatePresence>
    </OverlayContainer>
  )
}

type ModalRootProps = Omit<ModalProps, 'isOpen' | 'onClose'> & {
  open?: boolean
  setOpen?: (open: boolean) => void
  defaultOpen?: boolean
}

export function ModalRoot({
  children,
  open,
  setOpen,
  defaultOpen = false,
  ...props
}: ModalRootProps) {
  const [_open, _setOpen] = useControllableState({
    value: open,
    onChange: setOpen,
    defaultValue: defaultOpen,
  })

  const value = useMemo(() => {
    return { open: _open, setOpen: _setOpen }
  }, [_open, _setOpen])

  const closeModal = () => {
    _setOpen(false)
  }

  return (
    <ModalProvider>
      <ModalContext.Provider value={value}>
        {_open && (
          <Modal isOpen={_open} onClose={closeModal} {...props}>
            {children}
          </Modal>
        )}
      </ModalContext.Provider>
    </ModalProvider>
  )
}

type ModalHeaderProps = React.PropsWithChildren<{
  className?: string
  containerClassName?: string
  border?: boolean
}>

export function ModalHeader({
  children,
  className,
  containerClassName,
  border = false,
}: ModalHeaderProps) {
  return (
    <div
      className={cx(
        'ui-relative ui-px-5 ui-py-3',
        { 'ui-border-b ui-border-gray-200': border },
        containerClassName
      )}
    >
      <div
        className={cx(
          'ui-pr-8 ui-text-lg ui-font-semibold ui-text-gray-800',
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}

type ModalContentProps = React.PropsWithChildren<{
  className?: string
}>

export function ModalContent({ children, className }: ModalContentProps) {
  return (
    <div
      className={cx('ui-flex-1 ui-overflow-auto ui-px-5 ui-py-4', className)}
    >
      {children}
    </div>
  )
}

type ModalFooterProps = React.PropsWithChildren<{
  className?: string
}>

export function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div
      className={cx(
        'ui-border-t ui-flex ui-justify-end ui-space-x-3 ui-border-gray-100 ui-px-5 ui-pb-5 ui-pt-3',
        className
      )}
    >
      {children}
    </div>
  )
}

type ModalCloseButtonProps = {
  className?: string
  onClick?: () => void
}

export function ModalCloseButton({
  className,
  onClick,
}: ModalCloseButtonProps) {
  const { setOpen } = useModalContext()

  const handleClick = () => {
    onClick?.()
    setOpen?.(false)
  }

  return (
    <CloseButton
      onClick={handleClick}
      id="dialogCloseButton"
      className={cx('ui-absolute ui-right-2 ui-top-2 ui-z-10', className)}
    />
  )
}
