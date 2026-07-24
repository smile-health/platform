import { ModalConfirmation } from '#components/modules/ModalConfirmation'
import { Trans, useTranslation } from 'react-i18next'

import { MaterialCompanions } from '../order.type'

type Props = {
  show?: boolean
  setShow?: (show: boolean) => void
  onNext: VoidFunction
  companionList: MaterialCompanions[]
}

export default function OrderCreateModalMaterialCompanion(
  props: Readonly<Props>
) {
  const { show, setShow, onNext, companionList } = props

  const { t } = useTranslation('order')

  return (
    <ModalConfirmation
      open={show}
      onSubmit={onNext}
      setOpen={setShow}
      timeoutTime={0}
      title={t('modal_companion.title')}
      description={
        <div>
          <p className="ui-text-left ui-mb-4">
            <Trans
              t={t}
              i18nKey="modal_companion.description"
              components={{ bold: <strong /> }}
            />
          </p>
          <ul className="ui-w-full ui-mb-4">
            {companionList.map((item) => (
              <li
                key={item?.id}
                className="ui-border ui-bg-[#F5F5F4] ui-border-[#D4D4D4] ui-list-disc ui-list-inside ui-w-full ui-px-3 ui-py-1 ui-text-left"
              >
                {item?.name}
              </li>
            ))}
          </ul>
        </div>
      }
      buttonTitle={t('modal_companion.button.order')}
    />
  )
}
