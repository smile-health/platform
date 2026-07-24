import cx from '#lib/cx'

export function Skeleton({ className, ...props }: { className?: string }) {
  return (
    <div
      className={cx('ui-animate-pulse ui-rounded ui-bg-gray-300', className)}
      {...props}
    />
  )
}
