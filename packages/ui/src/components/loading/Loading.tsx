import React from 'react'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import cx from '#lib/cx'

type LoadingProps = {
  overlay: boolean
  useSpinner?: boolean
  text?: string
} & React.HTMLAttributes<HTMLDivElement>

export const Loading = ({
  overlay,
  text,
  useSpinner = false,
  ...props
}: LoadingProps) => {
  let loadingContent

  if (text) {
    loadingContent = text
  } else if (overlay || useSpinner) {
    loadingContent = <FontAwesomeIcon icon={faSpinner} spin size="2x" />
  } else {
    loadingContent = 'Loading...?'
  }

  return (
    <div
      className={cx(props.className, {
        'ui-bg-neutral-900/80 fixed left-0 top-0 z-50 h-full w-full ui-text-primary-contrast':
          overlay,
      })}
    >
      <div
        className={cx(props.className, {
          'ui-bg-neutral-900/70 ui-my-[20%] ui-mx-auto m-auto w-48 px-2 py-5 text-center':
            overlay,
          'text-center': !overlay,
        })}
      >
        {loadingContent}
      </div>
    </div>
  )
}
