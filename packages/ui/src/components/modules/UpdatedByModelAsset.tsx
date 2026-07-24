import { Exists } from '#components/exists'
import { useTranslation } from 'react-i18next'

type UpdatedByModelAssetProps = {
  updatedBy: string
  updatedAt: string
}

export const UpdatedByModelAsset = ({
  updatedBy,
  updatedAt,
}: UpdatedByModelAssetProps) => {
  const { t } = useTranslation(['common'])

  return (
    <>
      <Exists useIt={Boolean(updatedBy)}>
        <div className="text-primary">{`:${t('by')} ${updatedBy}`}</div>
      </Exists>
      <div className="text-gray-500">{`${t('at')} ${updatedAt}`}</div>
    </>
  )
}
