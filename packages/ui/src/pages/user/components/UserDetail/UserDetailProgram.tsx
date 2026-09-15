import { EmptyState } from '#components/empty-state'
import { ProgramItem } from '#components/modules/ProgramItem'
import { getProgramIconUrl } from '#constants/program'
import { TUserDetail } from '#types/user'
import { useTranslation } from 'react-i18next'

import { getUserPrograms } from '../../user.helper'
import UserSkeleton from '../UserSkeleton'

type Props = {
  data?: TUserDetail
  isLoading?: boolean
}

export default function UserDetailProgram({
  data,
  isLoading,
}: Readonly<Props>) {
  const { t } = useTranslation()

  const programs = getUserPrograms(data)

  if (isLoading) return <UserSkeleton />

  return (
    <div className="ui-p-4 ui-border ui-border-neutral-300 ui-rounded ui-space-y-4">
      <h5 className="ui-font-bold">{t('programs')}</h5>

      {/* List */}
      <div className="ui-min-h-[200px] ui-max-h-[500px] ui-overflow-y-auto">
        <div className="ui-grid ui-grid-cols-4 ui-gap-6">
          {programs.map((item) => (
            <ProgramItem
              key={item.id}
              id={item.key}
              data={item}
              icon={getProgramIconUrl(item)}
              className={{
                wrapper:
                  'ui-border ui-border-neutral-300 ui-rounded-lg ui-p-4 ui-gap-4 ui-cursor-default',
                title: 'ui-text-base ui-text-left',
              }}
            />
          ))}
        </div>
      </div>

      {programs.length === 0 && (
        <EmptyState
          withIcon
          className="ui-h-[400px]"
          title={t('message.empty.title')}
          description={t('message.empty.description')}
        />
      )}
    </div>
  )
}
