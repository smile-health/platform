import { Button } from '#components/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '#components/dialog'
import cx from '#lib/cx'
import { UserChangeHistoryType } from '#services/user'
import { useTranslation } from 'react-i18next'

import { handleHistoryValue } from '../user.helper'

type UserChangeHistoryModalProps = {
  data: UserChangeHistoryType
  open?: boolean
  onClose?: VoidFunction
}

export default function UserChangeHistoryModal(
  props: Readonly<UserChangeHistoryModalProps>
) {
  const { data, open, onClose } = props
  const { t } = useTranslation(['common', 'user'])
  const history = handleHistoryValue(t, data)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogHeader className="ui-text-center ui-text-xl">
        {t('user:title.change_history')}
      </DialogHeader>
      <DialogContent className="ui-space-y-6">
        <p className="ui-text-dark-teal">{history?.updated}</p>

        {history?.list.map((item) => {
          return (
            <div
              key={item?.label}
              className={cx('ui-space-y-1', {
                'ui-hidden': !item?.value,
              })}
            >
              <p className="ui-text-[#787878]">{item?.label}</p>
              <p className="ui-text-dark-teal">{item?.value}</p>
            </div>
          )
        })}
      </DialogContent>
      <DialogFooter>
        <Button id="btn-closen" variant="outline" fullWidth onClick={onClose}>
          {t('common:close')}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
