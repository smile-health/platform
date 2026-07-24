import Link from 'next/link'
import useSmileRouter from '#hooks/useSmileRouter'

import RightMenu from './RightMenu'

type Props = {
  title: string
  rNavChild: Array<{
    className: string
    title: string
    link: string
    isExist?: boolean
  }>
  left: number
}

const RightMenuNav: React.FC<Props> = (props) => {
  const { rNavChild, title, ...navProps } = props
  const router = useSmileRouter()

  return (
    <RightMenu {...navProps} title={title}>
      {rNavChild.map((item) => (
        <Link
          className={`${item.className} ui-text-left ui-block ui-text-primary-surface ui-cursor-pointer hover:ui-bg-gray-100 ui-px-6 ui-py-1`}
          id={`navbar-${item.link}`}
          key={`navbar-${item.link}`}
          href={router.getAsLink(item.link)}
        >
          {item.title}
        </Link>
      ))}
    </RightMenu>
  )
}

export default RightMenuNav
