import { forwardRef, useState } from 'react'
import {
  ChevronDownIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline'
import { Button, ButtonProps } from '#components/button'
import cx from '#lib/cx'

import useOrderDetailStore from '../order-detail.store'

type OrderDetailBoxProps = {
  title: string | React.ReactNode
  buttons?: (Pick<ButtonProps, 'id' | 'className' | 'onClick' | 'leftIcon'> & {
    label: string
  })[]
  children: React.ReactNode
  enableShowHide?: boolean
  className?: string
}

export const OrderDetailBox = forwardRef<HTMLDivElement, OrderDetailBoxProps>(
  (
    {
      title,
      buttons,
      enableShowHide = false,
      children,
      className,
    }: OrderDetailBoxProps,
    ref
  ) => {
    const { data } = useOrderDetailStore()

    const [isShow, setIsShow] = useState(true)

    return (
      <div ref={ref} className="ui-border ui-rounded">
        <div className={cx('ui-p-6 ui-space-y-4', className)}>
          <div className="ui-flex ui-justify-between ui-items-start">
            <div className="ui-font-semibold">{title}</div>

            {enableShowHide && (
              <div className="ui-flex ui-items-center gap-4">
                <button
                  onClick={() => setIsShow(!isShow)}
                  className="ui-py-1 ui-px-1.5"
                >
                  <ChevronDownIcon
                    className={cx(
                      'ui-h-5 ui-transition-all ui-stroke-2 ui-stroke-dark-blue',
                      {
                        '-ui-rotate-180 ui-transform': isShow,
                      }
                    )}
                  />
                </button>
              </div>
            )}
          </div>

          {!enableShowHide || (enableShowHide && isShow) ? children : null}
        </div>

        {data && Boolean(buttons?.length) && (
          <>
            <hr />
            <div className="ui-p-6 ui-space-x-2">
              {buttons?.map((button) => (
                <Button
                  key={button.label}
                  id={button.id}
                  data-testid={button.id}
                  variant="outline"
                  size="sm"
                  className="ui-px-[14px]"
                  leftIcon={
                    button.leftIcon || (
                      <DocumentArrowDownIcon
                        className="ui-h-5 ui-w-5"
                        strokeWidth={2}
                      />
                    )
                  }
                  onClick={button.onClick}
                >
                  {button.label}
                </Button>
              ))}
            </div>
          </>
        )}
      </div>
    )
  }
)

OrderDetailBox.displayName = 'OrderDetailBox'
