import React from 'react'

const DashbaordRabiesTitleBlock = ({
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
                  item.secondClassName ??
                  'ui-text-neutral-500 ui-text-sm ui-mt-1'
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

export default DashbaordRabiesTitleBlock
