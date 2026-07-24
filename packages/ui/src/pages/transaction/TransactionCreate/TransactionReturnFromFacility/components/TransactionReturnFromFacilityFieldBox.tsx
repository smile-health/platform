import React, { FC } from 'react'

type FieldBoxProps = {
  title: string
  subTitle: string
  spanText?: string
}

const TransactionReturnFromFacilityFieldBox: FC<FieldBoxProps> = ({
  title,
  subTitle,
  spanText,
}): JSX.Element => {
  return (
    <div className="ui-flex ui-flex-col ui-w-fit">
      <h4 className="ui-text-sm ui-text-neutral-500">{title}</h4>
      <h5 className="ui-text-base ui-text-dark-blue ui-font-bold">
        {subTitle}{' '}
        {spanText && (
          <span className="ui-text-xs ui-font-normal ui-text-neutral-500">
            {spanText}
          </span>
        )}
      </h5>
    </div>
  )
}

export default TransactionReturnFromFacilityFieldBox
