import React, { useContext } from 'react'
import { ModalConfirmation } from '#components/modules/ModalConfirmation'
import { BOOLEAN } from '#constants/common'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { useTranslation } from 'react-i18next'

import { useSubmitEnableDisableStatus } from '../hooks/useSubmitEnableDisableStatus'
import { processingEnableDisableStatus } from '../libs/period-of-stock-taking-list.common'
import PeriodOfStockTakingContext from '../libs/period-of-stock-taking-list.context'
import { TPeriodOfStockTakingData } from '../libs/period-of-stock-taking-list.type'

const PeriodOfStockTakingEnableDisableModalConfirmation = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'periodOfStockTaking'])
  const { mutateChangeStatus, isPendingChangeStatus } =
    useSubmitEnableDisableStatus(t, language)
  const onSubmit = async (data: TPeriodOfStockTakingData) => {
    const processedData = processingEnableDisableStatus(data, language)
    mutateChangeStatus({
      id: processedData?.id as number,
      status: processedData?.status,
    })
    setPopUpDataRow(null)
  }
  const { popUpDataRow, setPopUpDataRow, activeStockTakingData } = useContext(
    PeriodOfStockTakingContext
  )

  const confirmationText =
    popUpDataRow?.status === BOOLEAN.TRUE
      ? t('periodOfStockTaking:form.disactivating_confirmation')
      : t('periodOfStockTaking:form.activating_confirmation', {
          periodName: activeStockTakingData?.name,
        })

  useSetLoadingPopupStore(isPendingChangeStatus)

  return (
    <ModalConfirmation
      open={!!popUpDataRow}
      setOpen={(open) => {
        if (!open) {
          setPopUpDataRow(null)
        }
      }}
      description={t(
        'periodOfStockTaking:form.change_status_confirmation_in_list'
      )}
      subDescription={confirmationText}
      onSubmit={() => onSubmit(popUpDataRow as TPeriodOfStockTakingData)}
      type="update"
    />
  )
}

export default PeriodOfStockTakingEnableDisableModalConfirmation
