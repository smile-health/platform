import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid'

const StatusIcon: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case 'completed': {
      return (
        <CheckCircleIcon className="ui-w-5 ui-h-5 ui-text-success-500 ui-mx-auto" />
      )
    }
    case 'not_submitted': {
      return (
        <XCircleIcon className="ui-w-5 ui-h-5 ui-text-danger-500 ui-mx-auto" />
      )
    }
    case 'not_applicable': {
      return (
        <span className="ui-flex ui-items-center ui-justify-center ui-w-9 ui-h-6 ui-rounded-full ui-bg-neutral-100 ui-text-neutral-400 ui-text-xs ui-font-medium ui-mx-auto">
          N/A
        </span>
      )
    }
    default: {
      return <span className="ui-text-neutral-300 ui-flex ui-justify-center">—</span>
    }
  }
}

export default StatusIcon
