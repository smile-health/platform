import { Button } from '#components/button'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

type Props = {
  limit?: number
  name: string
  className?: string
}

const BigNameString: React.FC<Props> = (props) => {
  const { limit, name, className } = props
  const { t } = useTranslation('common')
  const [seeMore, setSeeMore] = useState(false)

  const value = !seeMore && limit ? name.substring(0, limit).concat('...') : name

  return (
    <div className="ui-flex ui-flex-col ui-gap-2">
      <p className={`ui-text-sm ui-text-primary-700 ${className}`}>{value}</p>
      {limit && (
        <Button size="sm" variant="subtle" type="button" onClick={() => setSeeMore(prev => !prev)}>
          {seeMore ? t('see_less') : t('see_more')}
        </Button>
      )}
    </div>
  )
}

export default BigNameString
