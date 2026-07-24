import { Fragment, ReactNode } from 'react'
import { Skeleton } from '#components/skeleton'
import cx from '#lib/cx'

export type DataPair = {
  id?: string
  label: string
  value?: ReactNode
  hidden?: boolean
  labelClassName?: string
  valueClassName?: string
  showColon?: boolean
  loading?: boolean
}

type SingleValueProps = DataPair & {
  skipEmptyValue?: boolean
  separator?: string
}

type RenderDetailValueProps = {
  data: DataPair[]
  loading?: boolean
  className?: string
  labelsClassName?: string
  valuesClassName?: string
  showColon?: boolean
  separator?: string
  skipEmptyValue?: boolean
}

export function SingleValue({
  id,
  label,
  value,
  hidden = false,
  labelClassName = '',
  valueClassName = '',
  showColon = true,
  separator = ':',
  loading = false,
  skipEmptyValue = true,
}: Readonly<SingleValueProps>) {
  if (!value && skipEmptyValue) return null
  const renderArray = (value: string[]) => {
    return value?.length > 0 ? value?.join(', ') : '-'
  }
  return hidden ? null : (
    <Fragment>
      <p id={id} className={cx('ui-text-[#787878]', labelClassName)}>
        {label}
      </p>
      {showColon && <span className={valueClassName}>{separator}</span>}
      {loading ? (
        <Skeleton className="ui-w-full ui-h-5 ui-bg-gray-200" />
      ) : (
        <p className={cx('ui-break-all', valueClassName)}>
          {Array.isArray(value) ? renderArray(value) : (value ?? '-')}
        </p>
      )}
    </Fragment>
  )
}

export function RenderDetailValue({
  data,
  loading = false,
  className = '',
  labelsClassName,
  valuesClassName,
  showColon = true,
  separator = ':',
  skipEmptyValue = false,
}: Readonly<RenderDetailValueProps>) {
  if (!data?.length) return null
  return (
    <div
      className={cx(
        'ui-gap-y-4',
        { 'ui-grid ui-grid-cols-[264px_3px_1fr] ui-gap-x-2 ': showColon },
        { 'ui-grid ui-grid-cols-[230px_1fr] ui-gap-x-2 ': !showColon },
        className
      )}
    >
      {data?.map(
        ({ id, label, value, hidden, labelClassName, valueClassName }) => (
          <SingleValue
            key={id ?? label}
            id={id ?? 'id'}
            label={label}
            value={value}
            hidden={hidden}
            labelClassName={labelClassName ?? labelsClassName}
            valueClassName={valueClassName ?? valuesClassName}
            showColon={showColon}
            separator={separator}
            loading={loading}
            skipEmptyValue={skipEmptyValue}
          />
        )
      )}
    </div>
  )
}
