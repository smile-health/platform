import React, { PropsWithChildren } from 'react'
import Information from '#components/icons/Information'

function ButtonPatient({
  children,
  isActive = false,
  onClick,
  id,
  isError = false,
  hideIcon = false,
  ...props
}: PropsWithChildren<{
  isActive?: boolean
  onClick: () => void
  id: string
  isError?: boolean
  hideIcon?: boolean
}>) {
  const shouldShowIcon = !isActive && isError && !hideIcon

  return (
    <>
      <style>
        {`
              .patient-button {
                padding: 10px 16px;
                color: #0C3045;
                background-color: white;
                border: none;
                border-left: 4px solid transparent;
                text-align: left;
                cursor: pointer;
                transition: border-color 0.2s ease;
              }
              .patient-button:hover{
                border-left: 4px solid #0C3045;
                font-weight:bold;
              }
              .patient-button.active {
                border-left: 4px solid #0C3045;
                font-weight:bold;
              }
            `}
      </style>

      <button
        className={`focus:outline-none focus:ring-0 patient-button focus:border-transparent ${!isActive && isError ? '!ui-text-red-600 !ui-bg-[#FEE2E2]' : ''} ${isActive ? 'active' : ''}`}
        type="button"
        onClick={onClick}
        id={id}
        {...props}
      >
        <div className="ui-flex">
          {children}
          {shouldShowIcon ? (
            <span className="ui-pl-1 ui-pt-1">
              <Information></Information>
            </span>
          ) : null}
        </div>
      </button>
    </>
  )
}

export default ButtonPatient
