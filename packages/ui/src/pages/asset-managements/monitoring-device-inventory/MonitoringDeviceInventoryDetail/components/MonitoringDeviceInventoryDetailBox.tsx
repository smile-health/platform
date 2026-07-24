import { ReactNode } from 'react'
import {
  AccordionContent,
  AccordionItem,
  AccordionRoot,
  AccordionTrigger,
} from '#components/accordion'
import { useTranslation } from 'react-i18next'

type MonitoringDeviceInventoryDetailBoxProps = {
  title?: string
  subtitle?: string
  children: ReactNode
  moreDetailsContent?: ReactNode
  showMoreDetails?: boolean
  className?: string
}

export const MonitoringDeviceInventoryDetailBox = ({
  title,
  subtitle,
  children,
  moreDetailsContent,
  showMoreDetails = false,
  className,
}: MonitoringDeviceInventoryDetailBoxProps) => {
  const { t } = useTranslation(['monitoringDeviceInventoryDetail'])

  return (
    <div className="ui-border ui-border-gray-300 ui-rounded">
      <div className="ui-p-6">
        {title && (
          <div className="ui-font-bold ui-text-dark-blue ui-mb-4">{title}</div>
        )}
        {subtitle && (
          <div className="ui-text-sm ui-text-gray-600 ui-mb-4">{subtitle}</div>
        )}
        <div className={className}>{children}</div>
      </div>

      {showMoreDetails && moreDetailsContent && (
        <>
          <hr />
          <AccordionRoot className="!ui-p-0" type="single" collapsible>
            <AccordionItem value="more-details" className="ui-border-none">
              <AccordionTrigger className="ui-px-6 ui-py-4 ui-text-dark-blue ui-font-bold focus:!ui-border-none !ui-ring-transparent hover:ui-bg-transparent">
                {t('monitoringDeviceInventoryDetail:button.more_details')}
              </AccordionTrigger>
              <AccordionContent className="ui-p-6 ui-pt-0 ui-text-base">
                {moreDetailsContent}
              </AccordionContent>
            </AccordionItem>
          </AccordionRoot>
        </>
      )}
    </div>
  )
}
