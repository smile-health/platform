import { Trans } from 'react-i18next'

type Props = Readonly<{
  description?: string
  details?: string[]
}>

export default function DashoardInventoryOverviewInformation({
  description,
  details,
}: Props) {
  return (
    <div className="space-y-1">
      <p>
        <Trans
          components={{
            b: <strong />,
          }}
        >
          {description}
        </Trans>
      </p>
      <ul className="ui-list-disc ui-pl-6">
        {details?.map((item) => (
          <li key={item}>
            <Trans
              components={{
                b: <strong />,
              }}
            >
              {item}
            </Trans>
          </li>
        ))}
      </ul>
    </div>
  )
}
