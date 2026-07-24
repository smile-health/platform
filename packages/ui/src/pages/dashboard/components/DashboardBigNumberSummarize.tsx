import DashboardBox from '#pages/dashboard/components/DashboardBox'
import { numberFormatter } from '#utils/formatter'
import { useTranslation } from 'react-i18next'

type Props = Readonly<{
  id: string
  value?: number
  title?: string
  subtitle?: string
  isLoading?: boolean
  exportFileName: string
  withContainer?: boolean
  description?: string
}>

export default function DashboardBigNumberSummarize({
  id,
  value,
  title,
  subtitle,
  isLoading,
  exportFileName,
  withContainer = true,
  description,
}: Props) {
  if (withContainer) {
    return (
      <div className="ui-col-span-3">
        <DashboardBox.Root id={id}>
          <DashboardBox.Header>
            <h4>
              <strong>{title}</strong>
            </h4>
            {subtitle && <p className="ui-text-base">{subtitle}</p>}
          </DashboardBox.Header>
          <Component
            id={id}
            value={value}
            isLoading={isLoading}
            exportFileName={exportFileName}
            description={description}
          />
        </DashboardBox.Root>
      </div>
    )
  }

  return (
    <Component
      id={id}
      value={value}
      isLoading={isLoading}
      exportFileName={exportFileName}
      description={description}
    />
  )
}

function Component({
  id,
  value,
  isLoading,
  exportFileName,
  description,
}: Omit<Props, 'title' | 'subtitle' | 'withContainer'>) {
  const {
    i18n: { language },
  } = useTranslation()

  return (
    <DashboardBox.Body>
      <DashboardBox.Config
        download={{
          targetElementId: id,
          fileName: exportFileName,
        }}
      />
      <DashboardBox.Content
        isLoading={isLoading}
        isEmpty={typeof value !== 'number'}
      >
        <div className="ui-text-center ui-p-16 ui-space-y-1">
          <p className="ui-text-3xl ui-text-neutral-800">
            <strong>{numberFormatter(value ?? 0, language)}</strong>
          </p>
          {description && (
            <p className="ui-text-sm ui-text-neutral-600 ui-font-semibold">
              {description}
            </p>
          )}
        </div>
      </DashboardBox.Content>
    </DashboardBox.Body>
  )
}
