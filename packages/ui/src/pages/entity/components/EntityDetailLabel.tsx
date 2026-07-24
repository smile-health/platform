import React from 'react'

type Props = {
  title?: string
  subTitle?: string
}
const EntityDetailLabel: React.FC<Props> = ({ title, subTitle }) => {
  return (
    <div className="ui-flex ui-flex-col ui-mt-[8px]">
      <h2 className="ui-text-sm ui-text-neutral-500">
        {title ? `${title}:` : ''}
      </h2>
      {subTitle ? (
        <h3 className="ui-text-base ui-text-[#0C3045] ui-font-bold">
          {subTitle}
        </h3>
      ) : null}
    </div>
  )
}

export default EntityDetailLabel
