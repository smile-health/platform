'use client'

import React from 'react'

import { MonitoringCardProps } from '../types/monitoring.types'

const MonitoringCard: React.FC<MonitoringCardProps> = ({
  title,
  children,
  buttons = [],
  tableContainerClassName = '',
}) => {
  return (
    <div className="ui-bg-white ui-border ui-border-neutral-200 ui-rounded-lg">
      {/* Card Header */}
      <div className="ui-p-5 ui-border-b ui-border-neutral-200">
        <div className="ui-flex ui-items-center ui-justify-between">
          <h3 className="ui-text-lg ui-font-bold ui-text-neutral-800">
            {title}
          </h3>
          {buttons.length > 0 && (
            <div className="ui-flex ui-items-center ui-gap-3">
              {buttons.map((button, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={button.onClick}
                  className={`ui-flex ui-items-center ui-gap-2 ui-px-4 ui-py-2 ui-text-sm ui-font-medium ui-rounded-lg hover:ui-bg-neutral-50 ${
                    button.variant === 'primary'
                      ? 'ui-text-white ui-bg-primary-600 ui-border ui-border-primary-600 hover:ui-bg-primary-700'
                      : 'ui-text-neutral-700 ui-bg-white ui-border ui-border-neutral-300'
                  }`}
                >
                  {button.icon}
                  {button.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table Content */}
      <div className={tableContainerClassName || 'ui-p-5'}>{children}</div>
    </div>
  )
}

export default MonitoringCard
