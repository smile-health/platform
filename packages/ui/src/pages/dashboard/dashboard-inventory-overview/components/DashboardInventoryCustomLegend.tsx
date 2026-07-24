import cx from '#lib/cx'

type Props = Readonly<{
  label: string
  colorClass: string
}>

export default function DashboardInventoryCustomLegend({
  label,
  colorClass,
}: Props) {
  return (
    <div className="ui-flex ui-items-center ui-gap-1">
      <div className={cx('ui-size-3.5 ui-rounded-full', colorClass)} />
      <span className="ui-text-[11.5px] ui-font-sans">{label}</span>
    </div>
  )
}
