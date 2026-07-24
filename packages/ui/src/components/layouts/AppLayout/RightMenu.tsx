import { ReactNode, useRef, useState } from 'react'
import { useOnClickOutside } from '#hooks/useOnClickOutside'
import { ChevronRightIcon } from '@heroicons/react/24/solid'

type Props = {
  title: string
  left: number
  children: ReactNode
}

const RightMenu: React.FC<Props> = (props) => {
  const { title, left, children } = props
  const [show, setShow] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useOnClickOutside(ref, () => setShow(false))

  return (
    <div className="ui-relative ui-cursor-pointer ui-text-left ui-block ui-text-primary-surface hover:ui-bg-gray-100 ui-px-6 ui-py-1">
      <button
        {...props}
        id={`trigger-${title}`}
        className="ui-flex ui-justify-between"
        onClick={() => setShow((prev) => !prev)}
      >
        {title}{' '}
        <span className="ui-flex ui-items-center">
          <ChevronRightIcon className="ui-h-4 ui-w-4 ui-text-primary-surface" />
        </span>
      </button>
      {show ? (
        <div
          ref={ref}
          style={{ left: left || 300, top: 0 }}
          className="ui-absolute ui-z-50 ui-py-1 ui-origin-top-right ui-bg-white ui-border ui-border-gray-400 ui-rounded-sm ui-w-max"
        >
          <div className="ui-flex ui-flex-col">{children}</div>
        </div>
      ) : null}
    </div>
  )
}

export default RightMenu
