import clsx from 'clsx'

import { TicketingSystemStatusEnum } from '../ticketing-system.constant'

type TicketingSystemStatusProps = {
  status: TicketingSystemStatusEnum
  label: string
}

const TicketingSystemStatus: React.FC<TicketingSystemStatusProps> = ({
  status,
  label,
}) => {
  const colors = clsx({
    'ui-text-blue-600 ui-bg-blue-50':
      status === TicketingSystemStatusEnum.Submitted,
    'ui-text-cyan-500 ui-bg-cyan-50':
      status === TicketingSystemStatusEnum.ReviewedByHelpDesk,
    'ui-text-yellow-600 ui-bg-yellow-50':
      status === TicketingSystemStatusEnum.ReportedToProvince ||
      status === TicketingSystemStatusEnum.ReportedToSupplier,
    'ui-text-gray-500 ui-bg-gray-50':
      status === TicketingSystemStatusEnum.ManualInput,
    'ui-text-orange-500 ui-bg-orange-50':
      status === TicketingSystemStatusEnum.InSupplierInspection,
    'ui-text-pink-600 ui-bg-pink-50':
      status === TicketingSystemStatusEnum.AlreadyRevised,
    'ui-text-indigo-600 ui-bg-indigo-50':
      status === TicketingSystemStatusEnum.RevisionCheck,
    'ui-text-success-600 ui-bg-success-50':
      status === TicketingSystemStatusEnum.ReportCompleted,
    'ui-text-danger-600 ui-bg-danger-50':
      status === TicketingSystemStatusEnum.ReportCancelled,
  })

  return (
    <div
      className={clsx(
        'ui-box-border ui-inline-flex ui-h-fit ui-items-center ui-justify-center ui-whitespace-nowrap focus:ui-outline-none ui-leading-none',
        'ui-px-4 ui-py-1.5 ui-text-sm ui-rounded-xl',
        colors
      )}
    >
      {label}
    </div>
  )
}

export default TicketingSystemStatus
