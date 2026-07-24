import React, { useContext, useEffect, useState } from 'react'
import { Button } from '#components/button'
import cx from '#lib/cx'
import { useTranslation } from 'react-i18next'

import { useDistributionDisposalCancelAction } from '../hooks/useDistributionDisposalCancelAction'
import { useDistributionDisposalReceiveSubmission } from '../hooks/useDistributionDisposalReceiveSubmission'
import DistributionDisposalDetailContext from '../utils/distribution-disposal-detail.context'
import DistributionDisposalDetailModalCancelConfirmation from './DistributionDisposalDetailModalCancelConfirmation'

const DistributionDisposalDetailFloatingBar = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'distributionDisposal'])
  const [isVisible, setIsVisible] = useState(false)
  const [openCancelConfirmation, setOpenCancelConfirmation] = useState(false)
  const [confirmationType, setConfirmationType] = useState<
    'cancel' | 'receive'
  >('cancel')
  const {
    data,
    inProcess,
    setInProcess,
    savedQuantityData,
    isIronHandedRole,
    activeProgram,
  } = useContext(DistributionDisposalDetailContext)

  const { handleReceiveShipment } = useDistributionDisposalReceiveSubmission(
    t,
    language
  )

  const { handleCancelShipment } = useDistributionDisposalCancelAction(
    t,
    language
  )

  const canReceiveShipment =
    Number(activeProgram?.entity_id) === Number(data?.customer?.id) ||
    isIronHandedRole

  const canCancelShipment =
    Number(activeProgram?.entity_id) === Number(data?.vendor?.id) ||
    isIronHandedRole

  const handleSubmitCancelOrder = () => {
    confirmationType === 'receive'
      ? handleReceiveShipment()
      : handleCancelShipment()
    setOpenCancelConfirmation(false)
  }

  useEffect(() => {
    const handleScroll = () => {
      const offsetTopVisibility = 75
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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const floatingBarClass = cx(
    'ui-fixed ui-bottom-0 ui-left-0 ui-right-0 ui-bg-white ui-shadow-lg ui-border ui-border-t ui-border-neutral-300',
    'ui-transition-transform ui-transform',
    {
      'ui-translate-y-full': !isVisible,
      'ui-translate-y-0': isVisible,
    }
  )

  return (
    <div className={floatingBarClass}>
      <DistributionDisposalDetailModalCancelConfirmation
        open={openCancelConfirmation}
        handleClose={() => setOpenCancelConfirmation(false)}
        handleSubmit={() => handleSubmitCancelOrder()}
        type={confirmationType}
      />
      <div className="ui-container ui-mx-auto ui-py-4 ui-px-6 ui-flex ui-items-center ui-justify-end">
        <div className="ui-flex ui-justify-end ui-items-start ui-gap-2">
          {inProcess ? (
            <>
              {canCancelShipment && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setTimeout(() => {
                      scrollToTop()
                    }, 100)
                    setConfirmationType('cancel')
                    setOpenCancelConfirmation(true)
                  }}
                >
                  {t('distributionDisposal:detail.action.cancel_shipment')}
                </Button>
              )}
              <Button
                variant="solid"
                type="button"
                disabled={!savedQuantityData || savedQuantityData.length === 0}
                onClick={() => {
                  setTimeout(() => {
                    scrollToTop()
                  }, 100)
                  setConfirmationType('receive')
                  setOpenCancelConfirmation(true)
                }}
              >
                {t('distributionDisposal:detail.action.receive_shipment')}
              </Button>
            </>
          ) : (
            <>
              {canCancelShipment && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setTimeout(() => {
                      scrollToTop()
                    }, 100)
                    setConfirmationType('cancel')
                    setOpenCancelConfirmation(true)
                  }}
                >
                  {t('distributionDisposal:detail.action.cancel_shipment')}
                </Button>
              )}
              {canReceiveShipment && (
                <Button
                  variant="solid"
                  type="button"
                  onClick={() => {
                    setTimeout(() => {
                      scrollToTop()
                    }, 100)
                    setInProcess(true)
                  }}
                >
                  {t('distributionDisposal:detail.action.proceed_shipment')}
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default DistributionDisposalDetailFloatingBar
