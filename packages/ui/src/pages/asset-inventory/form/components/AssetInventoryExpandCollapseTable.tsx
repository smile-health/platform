import React, { useState } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/solid'
import { Button } from '#components/button'

type AssetInventoryExpandCollapseTableProps = {
  children: React.ReactNode
  title: string
}

const AssetInventoryExpandCollapseTable: React.FC<
  AssetInventoryExpandCollapseTableProps
> = ({ children, title }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="ui-bg-[#F1F5F9] ui-mt-2 ui-rounded-md ui-px-2 ui-py-2">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        variant="default"
        className="ui-flex ui-items-center ui-justify-between ui-w-full !ui-bg-gray-100 focus:!ui-ring-0 focus:!ui-ring-offset-0"
        style={{ border: 'none' }}
      >
        <span className="ui-font-bold">{title}</span>
        <ChevronDownIcon
          className={`ui-w-4 ui-h-4 ui-transition-transform ${
            isOpen ? 'ui-rotate-180' : ''
          }`}
        />
      </Button>
      <div
        className={`ui-transition-all ui-overflow-hidden ${
          isOpen ? 'ui-max-h-screen ui-opacity-100' : 'ui-max-h-0 ui-opacity-0'
        }`}
      >
        <div className="ui-mt-2">{children}</div>
      </div>
    </div>
  )
}

export default AssetInventoryExpandCollapseTable
