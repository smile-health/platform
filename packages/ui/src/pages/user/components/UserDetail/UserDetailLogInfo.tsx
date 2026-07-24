import { RenderDetailValue } from '#components/modules/RenderDetailValue'
import { CommonType } from '#types/common'
import { useTranslation } from 'react-i18next'

import { TDetailUserData } from '../../user.types'
import UserSkeleton from '../UserSkeleton'

type UserDetailLogInfoProps = CommonType & {
  data: TDetailUserData['log']
  isLoading?: boolean
}

export default function UserDetailLogInfo(props: UserDetailLogInfoProps) {
  const { isLoading, data } = props
  const { t } = useTranslation('user')

  if (isLoading) {
    return <UserSkeleton />
  }

  return (
    <div className="ui-p-4 ui-mt-6 ui-border ui-border-neutral-300 ui-rounded ui-space-y-4">
      <h5 className="ui-font-bold">{t('title.log')}</h5>
      <RenderDetailValue data={data} />
    </div>
  )
}
