import React, { Fragment } from 'react'
import { UserChangeHistoryType } from '#services/user'
import { parseDateTime } from '#utils/date'
import { useTranslation } from 'react-i18next'

import { UpdateListFieldType } from '../AccountPage'
import { ModalChangeHistory } from './ModalChangeHistory'

export type ChangeHistoryCardProps = {
  history: UserChangeHistoryType
}

export const ChangeHistoryCard: React.FC<ChangeHistoryCardProps> = ({
  history,
}) => {
  const { t } = useTranslation(['common', 'account'])

  const [showDetailChangeHistory, setShowDetailChangeHistory] = React.useState<
    number | undefined
  >(undefined)

  const updateList = Object.keys(history.new_value)
  const updateCount = updateList.length

  const updateListField: UpdateListFieldType[] = []

  updateList.forEach((item) => {
    switch (item) {
      case 'firstname':
        updateListField.push({
          label: t('account:change_history.firstname'),
          value: history.new_value.firstname,
        })
        break
      case 'lastname':
        updateListField.push({
          label: t('account:change_history.lastname'),
          value: history.new_value.lastname,
        })
        break
      case 'gender':
        updateListField.push({
          label: t('account:change_history.gender'),
          value:
            history.new_value.gender == 1
              ? t('common:gender.male')
              : t('common:gender.female'),
        })
        break
      case 'mobile_phone':
        updateListField.push({
          label: t('account:change_history.phone_number'),
          value: history.new_value.mobile_phone,
        })
        break
      case 'email':
        updateListField.push({
          label: 'Email',
          value: history.new_value.email,
        })
        break
      case 'password':
        updateListField.push({
          label: t('account:change_history.password.label'),
          value: t('account:change_history.password.changed', {
            date: parseDateTime(history.updated_at, 'DD/MM/YYYY'),
          }),
        })
        break
      default:
        updateListField.push({
          label: '-',
          value: '-',
        })
        break
    }
  })

  return (
    <Fragment>
      {showDetailChangeHistory === history.id && (
        <ModalChangeHistory
          history={updateListField}
          historyUpdatedAt={`${parseDateTime(history.created_at, 'DD MMMM YYYY HH:mm')} 
              ${t('common:by')} ${history.updated_by}`}
          open={showDetailChangeHistory === history.id}
          setOpen={setShowDetailChangeHistory}
          handleClose={() => setShowDetailChangeHistory(undefined)}
        />
      )}

      <div
        className="ui-flex ui-justify-between"
        id={`changeHistory-${history.id}`}
      >
        <div className="ui-flex ui-flex-col ui-justify-start">
          <div
            className="ui-text-dark-blue"
            id={`changeHistoryTitle-${history.id}`}
          >
            {updateCount} {t('account:information_updated')}
          </div>
          <div
            className="ui-text-gray-600"
            id={`changeHistoryUpdateDate-${history.id}`}
          >
            {parseDateTime(history.created_at, 'DD MMMM YYYY HH:mm')}{' '}
            {t('common:by')} {history.updated_by}
          </div>
        </div>
        <div className="ui-text-dark-blue ui-flex ui-justify-end">
          <button
            onClick={() => setShowDetailChangeHistory(history.id)}
            id={`changeHistoryButtonSeeChanges-${history.id}`}
          >
            {t('account:see_changes')}
          </button>
        </div>
      </div>
    </Fragment>
  )
}
