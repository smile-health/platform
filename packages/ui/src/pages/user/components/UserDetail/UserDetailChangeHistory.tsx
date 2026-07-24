import { Fragment, useState } from 'react'
import { Button } from '#components/button'
import { Divider } from '#components/divider'
import cx from '#lib/cx'
import { UserChangeHistoryType } from '#services/user'
import { useTranslation } from 'react-i18next'

import { getUpdatedHistory } from '../../user.helper'
import UserChangeHistoryModal from '../UserChangeHistoryModal'

type UserDetailChangeHistoryProps = {
  data?: UserChangeHistoryType[]
}

export default function UserDetailChangeHistory({
  data,
}: Readonly<UserDetailChangeHistoryProps>) {
  const { t } = useTranslation('user')
  const [dataShow, setDataShow] = useState<UserChangeHistoryType | null>(null)

  if (!data) return null

  return (
    <div className="ui-p-4 ui-border ui-border-neutral-300 ui-rounded ui-space-y-4">
      <h5 className="ui-font-bold">{t('title.change_history')}</h5>
      {!!dataShow && (
        <UserChangeHistoryModal
          open
          data={dataShow}
          onClose={() => setDataShow(null)}
        />
      )}

      <div className="ui-space-y-4">
        {data?.map((item, index) => {
          const count = Object.keys(item?.new_value)?.length
          const isLast = data?.length - 1 === index

          return (
            <Fragment key={item?.id + item?.user_id}>
              <div className="ui-flex ui-justify-between ui-gap-4 ui-items-center">
                <div className="ui-space-y-2">
                  <p className="ui-text-dark-blue ui-font-medium">
                    {count} {t('history.information')?.toLowerCase()}
                  </p>
                  <p className="ui-text-neutral-500 ui-text-sm">
                    {getUpdatedHistory(item)}
                  </p>
                </div>
                <Button variant="subtle" onClick={() => setDataShow(item)}>
                  {t('action.see_changes')}
                </Button>
              </div>

              <Divider
                className={cx('ui-bg-[#D2D2D2]', {
                  'ui-hidden': isLast,
                })}
              />
            </Fragment>
          )
        })}
      </div>
    </div>
  )
}
