import React from 'react'
import Link from 'next/link'
import {
  DropdownMenuContent,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from '#components/dropdown-menu'
import useSmileRouter from '#hooks/useSmileRouter'

import RightMenuNav from './RightMenuNav'
import { ChevronDownIcon } from '@heroicons/react/24/solid'

type Props = {
  show?: boolean
  title: string
  navChild: Array<{
    className: string
    title: string
    link: string | null
    isExist?: boolean
    rNavChild?: Array<{
      className: string
      title: string
      link: string
      isExist?: boolean
    }>
  }>
  className?: string
}

const DropdownNav: React.FC<Props> = ({
  show = true,
  title,
  navChild,
  className,
}) => {
  const router = useSmileRouter()

  if (!show) return null

  return (
    <DropdownMenuRoot>
      <DropdownMenuTrigger>
        <div className={className} id={`trigger-${title}`}>
          <div className="ui-text-primary-contrast">{title}</div>
          <div className="ui-py-1 ui-pl-2">
            <ChevronDownIcon className="ui-h-3 ui-w-3 ui-text-primary-contrast" />
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent hidden={!show}>
        <div className="ui-flex ui-flex-col ui-gap-1">
          {navChild.map((item) => {
            if (item?.rNavChild) {
              return (
                <RightMenuNav
                  title={item.title}
                  left={220}
                  rNavChild={item.rNavChild}
                  key={item.link}
                />
              )
            }
            return (
              <Link
                className={`${item.className} ui-text-left ui-block ui-text-primary-surface ui-cursor-pointer hover:ui-bg-gray-100 ui-px-6 ui-py-1`}
                id={`navbar-${item.link}`}
                key={`navbar-${item.link}`}
                href={router.getAsLink(item.link ?? '')}
              >
                {item.title}
              </Link>
            )
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenuRoot>
  )
}

export default DropdownNav
