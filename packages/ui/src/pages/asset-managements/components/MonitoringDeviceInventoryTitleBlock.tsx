const MonitoringDeviceInventoryTitleBlock = ({
  arrText,
}: {
  arrText: Array<{
    label: string | JSX.Element
    label2?: string
    label3?: string
    className?: string
    className2?: string
    className3?: string
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
            {item.label3 && (
              <span
                className={` ${
                  item.className3 ?? 'ui-text-dark-teal ui-text-sm'
                }`}
              >
                {item.label3}
              </span>
            )}
          </div>
        )
    )}
  </div>
)

export default MonitoringDeviceInventoryTitleBlock
