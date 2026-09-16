import { EmptyState } from '#components/empty-state'
import { ProgramItem } from '#components/modules/ProgramItem'
import { getProgramIconUrl } from '#constants/program'
import { TDetailEntity } from '#types/entity'
import { useTranslation } from 'react-i18next'

type Props = {
  entity?: TDetailEntity
}

export default function EntityDetailProgram({ entity }: Readonly<Props>) {
  const { t } = useTranslation(['common', 'entity'])

  const programs = entity?.programs ?? []

  return (
    <div className="ui-p-4 ui-mt-6 ui-border ui-border-gray-300 ui-rounded ui-space-y-4">
      <h5 className="ui-font-bold">Programs</h5>

      {/* List */}
      <div className="ui-min-h-[200px] ui-max-h-[500px] ui-overflow-y-auto">
        <div className="ui-grid ui-grid-cols-4 ui-gap-6">
          {programs.map((item) => (
            <ProgramItem
              key={item.id}
              id={item.key}
              data={item}
              icon={getProgramIconUrl(item)}
              className={{
                wrapper:
                  'ui-border ui-border-neutral-300 ui-rounded-lg ui-p-4 ui-gap-4 ui-cursor-default',
                title: 'ui-text-base ui-text-left',
              }}
            />
          ))}
        </div>
      </div>

      {programs.length === 0 && (
        <EmptyState
          withIcon
          className="ui-h-[400px]"
          title={t('common:message.empty.title')}
          description={t('common:message.empty.description')}
        />
      )}
    </div>
  )
}
