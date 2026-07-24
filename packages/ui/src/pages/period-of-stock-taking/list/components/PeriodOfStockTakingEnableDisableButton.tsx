import React, { FC, useContext } from 'react'
import { Switch } from '#components/switch'
import { BOOLEAN } from '#constants/common'
import { useTranslation } from 'react-i18next'

import PeriodOfStockTakingChangeStatusContext from '../libs/period-of-stock-taking-list.change-status-context'
import PeriodOfStockTakingContext from '../libs/period-of-stock-taking-list.context'
import { TPeriodOfStockTakingData } from '../libs/period-of-stock-taking-list.type'

type PeriodOfStockTakingEnableDisableButtonProps = {
  data: TPeriodOfStockTakingData | null
}

const PeriodOfStockTakingEnableDisableButton: FC<
  PeriodOfStockTakingEnableDisableButtonProps
> = ({ data }) => {
  const { t } = useTranslation(['common', 'periodOfStockTaking'])
  const { setPopUpDataRow, activeStockTakingData } = useContext(
    PeriodOfStockTakingContext
  )
  const { mutateChangeStatus } = useContext(
    PeriodOfStockTakingChangeStatusContext
  )

  if (!data) return null
  const handleChangeStatus = async () => {
    if (activeStockTakingData) {
      setPopUpDataRow(data)
    } else {
      mutateChangeStatus({
        id: data?.id as number,
        status: data?.status === BOOLEAN.TRUE ? BOOLEAN.FALSE : BOOLEAN.TRUE,
      })
    }
  }

  return (
    <>
      <div className="ui-h-auto ui-w-fit div__switch">
        <Switch
          checked={data?.status === BOOLEAN.TRUE}
          onCheckedChange={handleChangeStatus}
          className="ui-w-10 ui-h-6 ui-rounded-full ui-bg-gray-200 ui-relative ui-transition-colors ui-duration-200 ui-ease-in-out"
          size="xl"
          labelInside={{
            on: t('periodOfStockTaking:active'),
            off: t('periodOfStockTaking:inactive'),
          }}
        />
      </div>
      <style>{`
      .div__switch button {
        background-color: #CBD5E1 !important;
        
        > div {
          color: #0C3045 !important;
        }

        > span {
          background-color: #FFF !important;
        }
      }
        
      .div__switch button[data-state="checked"] {
        background-color: #15803D !important;
        
        > div {
          color: #fff !important;
        }

        > span {
          background-color: #fff !important;
        }
      }
      `}</style>
    </>
  )
}

export default PeriodOfStockTakingEnableDisableButton
