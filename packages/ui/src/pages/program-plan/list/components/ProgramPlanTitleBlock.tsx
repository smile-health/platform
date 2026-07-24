import React from 'react'

const ProgramPlanTitleBlock = ({
  arrText,
}: {
  arrText: Array<{
    firstLabel: string | JSX.Element
    secondLabel?: string | JSX.Element
    firstClassName?: string
    secondClassName?: string
  }>
}) => (
  <div>
    {arrText.map(
      (item, index) =>
        item.firstLabel && (
          <div
            key={`_${index.toString()}`}
            className={`${item.firstClassName ?? 'ui-text-dark-teal'} ui-text-sm`}
          >
            {item.firstLabel}
            {item.secondLabel && (
              <span
                className={` ${
                  item.secondClassName ?? 'ui-text-dark-teal ui-text-sm'
                }`}
              >
                {item.secondLabel}
              </span>
            )}
          </div>
        )
    )}
  </div>
)

export default ProgramPlanTitleBlock
