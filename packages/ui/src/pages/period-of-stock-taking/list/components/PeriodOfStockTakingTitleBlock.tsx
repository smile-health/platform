import React from 'react'

const PeriodOfStockTakingTitleBlock = ({
  arrText,
}: {
  arrText: Array<{
    label: string | JSX.Element
    label2?: string
    className?: string
    className2?: string
  }>
}) => (
  <div>
    {arrText.map(
      (item, index) =>
        item.label && (
          <div
            key={`_${index.toString()}`}
            className={`${item.className ?? 'ui-text-dark-teal'} ui-text-sm`}
          >
            {item.label}
            {item.label2 && (
              <span
                className={` ${
                  item.className2 ?? 'ui-text-dark-teal ui-text-sm'
                }`}
              >
                {item.label2}
              </span>
            )}
          </div>
        )
    )}
  </div>
)

export default PeriodOfStockTakingTitleBlock
