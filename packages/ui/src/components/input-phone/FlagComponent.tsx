import { PhoneIcon } from '@heroicons/react/24/outline'
import cx from '#lib/cx'
import { CircleFlag } from 'react-circle-flags'
import * as RPNInput from 'react-phone-number-input'

type FlagComponentProps = RPNInput.FlagProps & {
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function FlagComponent({ country, size = 'md' }: FlagComponentProps) {
  const flagSize: Record<typeof size, string> = {
    sm: '16',
    md: '20',
    lg: '24',
    xl: '28',
  }

  return (
    <span
      className={cx('ui-overflow-hidden', {
        'ui-w-4': size === 'sm',
        'ui-w-5 ': size === 'md',
        'ui-w-6': size === 'lg',
        'ui-w-7': size === 'xl',
      })}
    >
      {country ? (
        <CircleFlag
          countryCode={country?.toLowerCase()}
          height={flagSize[size]}
        />
      ) : (
        <PhoneIcon
          className={cx({
            'ui-size-4': size === 'sm',
            'ui-size-5 ': size === 'md',
            'ui-size-6': size === 'lg',
            'ui-size-7': size === 'xl',
          })}
          aria-hidden="true"
        />
      )}
    </span>
  )
}
