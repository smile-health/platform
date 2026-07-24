import { Dialog, DialogContent } from '#components/dialog'
import { GlobalSpinner } from '#components/spinner'
import { useLoadingPopupStore } from '#store/loading.store'
import { useTranslation } from 'react-i18next'

const LoadingPopup = () => {
  const { t } = useTranslation()
  const { loadingPopup } = useLoadingPopupStore()

  // handle error when switch to error page
  if (!loadingPopup) return null

  return (
    <Dialog open={loadingPopup} closeOnOverlayClick={false} classNameOverlay="ui-z-[20]" className="ui-z-[20]">
      <DialogContent className="ui-text-center ui-py-6">
        <div className="ui-flex ui-justify-center ui-mb-4 ui-text-primary-500">
          <GlobalSpinner />
        </div>
        <p className="ui-text-xl ui-font-medium ui-text-primary-700 ui-mb-2">
          {t('loading_popup.title')}
        </p>
        <p className="ui-text-base ui-font-normal ui-text-neutral-500">
          {t('loading_popup.description')}
        </p>
      </DialogContent>
    </Dialog>
  )
}

export default LoadingPopup
