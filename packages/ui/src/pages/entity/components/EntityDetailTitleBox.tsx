import { useContext } from 'react'
import { Button } from '#components/button'
import { BOOLEAN } from '#constants/common'
import { hasPermission } from '#shared/permission/index'
import { useTranslation } from 'react-i18next'

import EntityDetailToEditContext from '../utils/entity-detail-to-edit-context'
import EntityDetailActivityImplementationTimeTopStickedButton from './EntityDetailActivityImplementationTimeTopStickedButton'

type Props = {
  title: string
  useEditButton?: boolean
  isSubmitting?: boolean
}

const EntityDetailTitleBox: React.FC<Props> = ({
  title,
  useEditButton = true,
  isSubmitting = false,
}): JSX.Element => {
  const { t } = useTranslation(['common', 'entity'])
  const { setIsEdit, isEdit, entity } = useContext(EntityDetailToEditContext)

  return (
    <div className="ui-mb-[16px] ui-flex ui-justify-between ui-items-center">
      <p className="ui-font-bold ">{title}</p>
      {hasPermission('entity-mutate') && useEditButton ? (
        <div className="ui-w-auto ui-flex ui-justify-end ui-items-center">
          {isEdit ? (
            <>
              <div className="ui-w-auto ui-flex ui-justify-end ui-items-center">
                <div className="ui-mr-[16px]">
                  <Button
                    id="btn__link__entity__cancel"
                    variant="outline"
                    onClick={() => setIsEdit(false)}
                  >
                    {t('common:cancel')}
                  </Button>
                </div>
                <div>
                  <Button
                    id="btn__link__entity__save"
                    variant="solid"
                    type="submit"
                    disabled={entity?.status === BOOLEAN.FALSE}
                  >
                    {t('common:save')}
                  </Button>
                </div>
              </div>
              <EntityDetailActivityImplementationTimeTopStickedButton
                title={title}
                setIsEdit={setIsEdit}
              />
            </>
          ) : (
            <Button
              id="btn-link-entity-edit"
              variant="outline"
              onClick={() => setIsEdit(true)}
              disabled={isSubmitting || entity?.status === BOOLEAN.FALSE}
            >
              {t('common:edit')}
            </Button>
          )}
        </div>
      ) : null}
    </div>
  )
}

export default EntityDetailTitleBox
