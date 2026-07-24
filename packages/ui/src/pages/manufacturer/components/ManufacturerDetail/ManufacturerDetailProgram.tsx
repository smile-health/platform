import { ProgramItem } from '#components/modules/ProgramItem'
import { TManufacturer } from '#types/manufacturer'
import { useTranslation } from 'react-i18next'

import ManufacturerLoading from '../ManufacturerLoading'
import { IconPrograms } from '#constants/program'

type ManufacturerDetailProgramProps = {
  isLoading?: boolean
  programs?: TManufacturer['programs']
}

export default function ManufacturerDetailProgram({
  isLoading,
  programs,
}: Readonly<ManufacturerDetailProgramProps>) {
  const { t } = useTranslation()
  if (isLoading) {
    return <ManufacturerLoading />
  }

  return (
    <div className="ui-p-4 ui-border ui-border-neutral-300 ui-rounded ui-space-y-4">
      <h5 className="ui-font-bold">{t('programs')}</h5>
      <div className="ui-grid ui-grid-cols-4 ui-gap-4">
        {programs?.map((item) => (
          <ProgramItem
            id={item?.key}
            key={item?.id}
            data={item}
            className={{
              wrapper:
                'ui-gap-4 ui-p-4 ui-rounded-lg ui-border ui-border-neutral-300',
              title: 'ui-text-left'
            }}
            icon={IconPrograms[item.key]}
          />
        ))}
      </div>
    </div>
  )
}
