import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Button } from '#components/button'
import ChainIcon from '#components/icons/ChainIcon'
import cx from '#lib/cx'
import { TicketingSystemStatusEnum } from '#pages/ticketing-system/ticketing-system.constant'
import { hasPermission } from '#shared/permission/index'
import { useTranslation } from 'react-i18next'

import TicketingSystemDetailChangeStatusContext from '../libs/ticketing-system-change-status.context'
import { followUpChangeStatus } from '../libs/ticketing-system-detail.constant'
import TicketingSystemDetailContext from '../libs/ticketing-system-detail.context'
import TicketingSystemDetailDropUpChangeStatus from './TicketingSystemDetailDropUpChangeStatus'
import TicketingSystemDetailUpdateStatusDialog from './TicketingSystemDetailUpdateStatusDialog'
import TicketingSystemPackingSlipFormDialog from './TicketingSystemPackingSlipFormDialog'

const TicketingSystemDetailFloatingBar = () => {
  const { t } = useTranslation(['ticketingSystemDetail', 'common'])
  const [isVisible, setIsVisible] = useState(false)
  const [modalOpened, setModalOpened] = useState<string | null>(null)
  const [modalStatusData, setModalStatusData] = useState<
    | {
        id: number
        status_label: string
      }
    | null
    | undefined
  >(null)

  const { detail } = useContext(TicketingSystemDetailContext)

  useEffect(() => {
    const offsetTopVisibility = 75
    const scrollHeight = document.body.scrollHeight
    const windowHeight = window.innerHeight
    const nearNoScroll = scrollHeight - windowHeight <= 100 // hampir tidak ada scroll
    const isScrollable = scrollHeight > windowHeight + 10 // toleransi kecil (10px)
    // ✅ 1. Jika tidak butuh scroll → visible selalu
    if (!isScrollable) {
      if (!isVisible) setIsVisible(true)
      return
    }

    const handleScroll = () => {
      // ✅ 2. Kalau hampir tidak bisa scroll (misal 1690px, beda tinggi kecil)
      if (nearNoScroll && window.scrollY < offsetTopVisibility) {
        if (!isVisible) setIsVisible(true)
        return
      }

      if (window.devicePixelRatio <= 0.89) {
        if (!isVisible && window.scrollY >= offsetTopVisibility) {
          setIsVisible(true)
        }
      } else {
        const makeVisible = window.scrollY >= offsetTopVisibility
        setIsVisible(makeVisible)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [isVisible, window])

  const floatingBarClass = cx(
    'ui-fixed ui-bottom-0 ui-left-0 ui-right-0 ui-bg-white ui-shadow-lg ui-border ui-border-t ui-border-neutral-200',
    'ui-transition-transform ui-transform',
    {
      'ui-translate-y-full': !isVisible,
      'ui-translate-y-0': isVisible,
    }
  )

  const editOrAddSplipLink = detail?.slip_link
    ? t('common:edit')
    : t('common:add')

  const labelSlipLinkButton =
    detail?.status_id !== TicketingSystemStatusEnum.ReviewedByHelpDesk
      ? t('common:view')
      : editOrAddSplipLink

  const positiveButton = followUpChangeStatus({
    statusId: detail?.status_id as number,
    followUpStatus: detail?.follow_up_status || [],
  })

  const contextChangeStatusValue = useMemo(
    () => ({
      modalStatusData,
      setModalStatusData,
    }),
    [modalStatusData, setModalStatusData]
  )

  return (
    <>
      <TicketingSystemPackingSlipFormDialog
        modalOpened={modalOpened}
        title={labelSlipLinkButton}
        onClose={() => setModalOpened(null)}
      />

      <div className={floatingBarClass}>
        <div className="ui-container ui-mx-auto ui-py-4 ui-px-6 ui-flex ui-items-center ui-justify-between">
          {detail?.status_id !== TicketingSystemStatusEnum.Submitted &&
          hasPermission('ticketing-system-access-packing-link') ? (
            <Button
              variant="outline"
              type="button"
              className="hover:!ui-bg-primary-100 hover:ui-shadow-lg"
              leftIcon={<ChainIcon />}
              onClick={() => setModalOpened('slip_link')}
            >
              {t('ticketingSystemDetail:float_bar.button_packing_slip', {
                addEdit: labelSlipLinkButton,
              })}
            </Button>
          ) : (
            <div />
          )}

          {detail?.status_id !== TicketingSystemStatusEnum.ReportCompleted &&
            detail?.status_id !== TicketingSystemStatusEnum.ReportCancelled && (
              <TicketingSystemDetailChangeStatusContext.Provider
                value={contextChangeStatusValue}
              >
                <div className="ui-flex ui-justify-end ui-items-start ui-gap-2">
                  {(
                    detail?.follow_up_status as { id: number }[] | undefined
                  )?.some(
                    (status) =>
                      status.id === TicketingSystemStatusEnum.ReportCancelled
                  ) && (
                    <Button
                      variant="outline"
                      type="button"
                      className="hover:!ui-bg-primary-100 hover:ui-shadow-lg"
                      onClick={() =>
                        setModalStatusData({
                          id: TicketingSystemStatusEnum.ReportCancelled,
                          status_label: t(
                            'ticketingSystemDetail:float_bar.cancel_ticket'
                          ),
                        })
                      }
                    >
                      {t('ticketingSystemDetail:float_bar.cancel_ticket')}
                    </Button>
                  )}
                  {positiveButton && (
                    <>
                      <Button
                        variant="solid"
                        type="button"
                        disabled={
                          !detail?.slip_link &&
                          detail?.status_id !==
                            TicketingSystemStatusEnum.Submitted
                        }
                        onClick={() => setModalStatusData(positiveButton)}
                      >
                        {positiveButton?.status_label}
                      </Button>

                      <TicketingSystemDetailDropUpChangeStatus
                        positiveButton={positiveButton}
                      />
                    </>
                  )}
                </div>
                <TicketingSystemDetailUpdateStatusDialog />
              </TicketingSystemDetailChangeStatusContext.Provider>
            )}
        </div>
      </div>
    </>
  )
}

export default TicketingSystemDetailFloatingBar
