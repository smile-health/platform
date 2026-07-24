import React from 'react'

type Props = Readonly<{
  title: string
  children?: React.ReactNode
}>

const DashboardRabiesChartTitle = ({ title, children }: Props) => {
  return (
    <div className="ui-w-full ui-relative ui-mb-4">
      <div className="ui-mx-auto ui-w-fit">
        <h5 className="ui-text-base">{title}</h5>
      </div>
      {children}
    </div>
  )
}

export default DashboardRabiesChartTitle
