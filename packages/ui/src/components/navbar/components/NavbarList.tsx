import React, { forwardRef } from 'react'
import { HoverCardTrigger } from '@repo/ui/components/hover-card'
import ChevronRight from '#components/icons/ChevronRight'
import cx from '#lib/cx'

type NavbarListProps = {
  title?: string
  active?: boolean
  className?: string
}

const NavbarList = forwardRef<HTMLButtonElement, NavbarListProps>(
  ({ title = '', active = false, className = '' }, ref) => {
    const titleStyle = cx(
      'menu__main ui-font-thin ui-relative ui-h-full ui-w-auto ui-px-6 ui-py-2 ui-cursor-default hover:ui-text-primary-contrast ui-outline-none focus:ui-outline-none focus:ui-ring-0 focus-visible:outline-none',
      {
        'ui-font-bold': active,
      },
      className
    )
    return (
      <HoverCardTrigger>
        <button
          ref={ref}
          type="button"
          className={titleStyle}
          tabIndex={0}
          aria-label={title}
        >
          <div className="ui-flex ui-items-center ui-justify-start">
            {title}
            <div className="ui-ml-2">
              <ChevronRight className="ui-w-4 ui-h-4 ui-rotate-90" />
            </div>
          </div>
        </button>
      </HoverCardTrigger>
    )
  }
)

NavbarList.displayName = 'NavbarList'

export default NavbarList
