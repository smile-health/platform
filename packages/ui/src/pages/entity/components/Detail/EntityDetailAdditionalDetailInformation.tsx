import { useRouter } from 'next/navigation'
import { Button } from '#components/button'
import { RenderDetailValue } from '#components/modules/RenderDetailValue'
import { CommonType } from '#types/common'
import { TDetailEntity } from '#types/entity'
import { isViewOnly } from '#utils/user'
import { useTranslation } from 'react-i18next'

import { generateEntityAdditionalDetail } from '../../utils/helper'

type Props = CommonType & {
  entity: TDetailEntity | undefined
  isPlatform?: boolean
}

const EntityDetailAdditionalDetailInformation: React.FC<Props> = (props) => {
  const { entity, isGlobal } = props
  const { i18n, t } = useTranslation(['common', 'entity'])
  const router = useRouter()

  const additionalDetails = generateEntityAdditionalDetail(t, entity)

  return (
    <div className="ui-p-4 ui-mt-6 ui-border ui-border-gray-300 ui-rounded ui-space-y-4">
      <div className="ui-flex ui-justify-between ui-items-start ui-gap-4">
        <h5 className="ui-font-bold">{t('entity:detail.additional.title')}</h5>
        {!isViewOnly() && (
          <div className="ui-w-auto">
            <Button
              id="btn-link-entity-edit"
              variant="outline"
              onClick={() => {
                let url = `/${i18n.language}/v5/entity/${entity?.id}/edit`
                if (isGlobal) {
                  url = `/${i18n.language}/v5/global-settings/entity/${entity?.id}/edit`
                }
                router.push(url)
              }}
            >
              {t('common:edit')}
            </Button>
          </div>
        )}
      </div>

      <RenderDetailValue data={additionalDetails} />
    </div>
  )
}

export default EntityDetailAdditionalDetailInformation
