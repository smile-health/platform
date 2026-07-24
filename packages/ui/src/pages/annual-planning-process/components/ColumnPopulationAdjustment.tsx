import { Button } from '#components/button'
import Plus from '#components/icons/Plus'
import { TFunction } from 'i18next'

import { ProcessStatus } from '../annual-planning-process.constants'
import { ListPopulationTargetHealthCare } from '../annual-planning-process.types'
import { isAllDataApproved } from '../annual-planning-process.utils'

type Props = {
  isRevision: boolean
  t: TFunction<['annualPlanningProcess', 'common']>
  onClickRow: () => void
  original: ListPopulationTargetHealthCare
}

const ColumnPopulationAdjustment: React.FC<Props> = (props) => {
  const { isRevision, t, onClickRow, original } = props
  const { data } = original

  if (isRevision) {
    const isAllApproved = isAllDataApproved(data)

    if (isAllApproved) {
      return (
        <div className="ui-flex ui-flex-col ui-gap-4">
          <p className="ui-text-sm ui-font-normal ui-text-primary-800">
            {t(
              'annualPlanningProcess:create.form.info_data_column.all_approved'
            )}
          </p>

          <Button
            type="button"
            variant="subtle"
            onClick={onClickRow}
            size="sm"
            className="ui-px-0 ui-w-max"
          >
            {t('common:view')}
          </Button>
        </div>
      )
    }
    const dataRevision = data?.reduce(
      (acc, curr) => {
        if (curr.status === ProcessStatus.APPROVED) {
          acc.approved += 1
        } else if (curr.status === ProcessStatus.REJECT) {
          acc.revision += 1
        }

        if (curr.is_revised) {
          acc.revised += 1
        }
        return acc
      },
      {
        approved: 0,
        revision: 0,
        revised: 0,
      }
    )

    return (
      <div className="ui-flex ui-flex-col ui-gap-4">
        <p className="ui-text-sm ui-font-normal">
          <span className="ui-text-green-700">
            {t('annualPlanningProcess:create.form.info_data_column.approved', {
              value: dataRevision?.approved,
            })}
          </span>
          <br />
          <span className="ui-text-red-600">
            {t('annualPlanningProcess:create.form.info_data_column.revision', {
              value: dataRevision?.revision,
            })}
          </span>
        </p>

        {!!dataRevision?.revised && (
          <p className="ui-text-sm ui-font-bold">
            {t('annualPlanningProcess:create.form.info_data_column.revised', {
              revised: dataRevision?.revised,
              revision: dataRevision?.revision,
            })}
          </p>
        )}

        <Button
          type="button"
          variant="outline"
          onClick={onClickRow}
          leftIcon={<Plus className="ui-size-5" />}
          className=" ui-w-max"
        >
          {t('annualPlanningProcess:create.form.button.update')}
        </Button>
      </div>
    )
  }

  const filledField =
    data?.filter((y) => typeof y.change_qty === 'number' && y.change_qty > 0)
      .length || 0

  return (
    <div className="ui-flex ui-flex-col ui-gap-4">
      {data && filledField > 0 && (
        <p className="ui-font-bold ui-text-sm ui-text-primary-800">
          {t('annualPlanningProcess:create.form.info_correction', {
            filled: filledField,
            total: data.length,
          })}
        </p>
      )}

      <Button
        type="button"
        variant="outline"
        leftIcon={
          filledField === 0 ? <Plus className="ui-size-5" /> : undefined
        }
        onClick={onClickRow}
        className="ui-w-max"
      >
        {filledField > 0
          ? t('annualPlanningProcess:create.form.button.update_correction')
          : t('annualPlanningProcess:create.form.button.correction')}
      </Button>
    </div>
  )
}

export default ColumnPopulationAdjustment
