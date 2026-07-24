import * as React from 'react'
import cx from '#lib/cx'

const sizeMapping = {
  xl: { svgSize: 160, stroke: 12 },
  lg: { svgSize: 88, stroke: 8 },
  md: { svgSize: 64, stroke: 6 },
  sm: { svgSize: 32, stroke: 4 },
  xs: { svgSize: 24, stroke: 4 },
}

export type CircularProgressElement = SVGSVGElement

export type CircularProgressProps = Omit<
  React.SVGProps<SVGSVGElement>,
  'value'
> & {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'danger'
  /**
   * The progress value.
   */
  value?: number

  /**
   * The maximum progress value.
   */
  max?: number

  /**
   * A function to get the accessible label text representing the current value in a human-readable format.
   * If not provided, the value label will be read as the numeric value as a percentage of the max value.
   */
  getLabelValue?: (value: number, max: number) => string

  /**
   * If `true`, the additional styles will be applied to indicate that the progress bar is disabled.
   */
  disabled?: boolean

  /**
   * If `true`, the progress bar CSS transition will be disabled.
   */
  disableAnimation?: boolean
}

/* -------------------------------- Component ------------------------------- */
export const CircularProgress = React.forwardRef<
  CircularProgressElement,
  CircularProgressProps
>(
  (
    {
      className,
      color = 'primary',
      disableAnimation = false,
      disabled,
      getLabelValue,
      max = 100,
      size = 'md',
      value = 0,
      ...otherProps
    },
    ref
  ) => {
    const { svgSize, stroke } = sizeMapping[size]
    const radius = (svgSize - stroke) / 2
    const circumference = 2 * Math.PI * radius

    // Adjust the value to be a percentage of the max
    const adjustedValue = (value / max) * 100

    const defaultLabelValue = (value: number, max: number) =>
      `${Math.round((value / max) * 100)}%`

    const labelValue = getLabelValue
      ? getLabelValue(value, max)
      : value !== undefined
        ? defaultLabelValue(value, max)
        : ''

    return (
      <div
        className={cx('ui-relative', disabled && 'ui-opacity-50')}
        style={{ width: svgSize, height: svgSize }}
      >
        <svg
          ref={ref}
          width={svgSize}
          height={svgSize}
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          className={cx(
            'ui-scale-100 ui-fill-none ui-stroke-gray-100',
            {
              'ui-text-primary-500': color === 'primary',
              'ui-text-secondary-500': color === 'secondary',
              'ui-text-success-500': color === 'success',
              'ui-text-info-500': color === 'info',
              'ui-text-warning-500': color === 'warning',
              'ui-text-danger-500': color === 'danger',
            },
            className
          )}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          fill="none"
          data-max={max}
          data-value={value ?? null}
          data-state={
            value === undefined
              ? 'indeterminate'
              : adjustedValue < 100
                ? 'loading'
                : 'complete'
          }
          {...otherProps}
        >
          {/* Background Circle */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            className="stroke-inherit"
            strokeWidth={stroke}
            fill="none"
          />

          {/* Foreground Circle */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (value / 100) * circumference}
            strokeLinecap="round"
            className={cx(
              'ui-h-full',
              !disableAnimation &&
                'ui-transition-all ui-duration-300 ui-ease-linear'
            )}
            transform={`rotate(-90 ${svgSize / 2} ${svgSize / 2})`} // Rotate the circle to start from 12 o'clock
            fill="none"
          />
        </svg>

        {['xl', 'lg', 'md'].includes(size) ? (
          <span
            className={cx(
              'ui-absolute ui-inset-0 ui-flex ui-items-center ui-justify-center',
              size === 'xl' && 'ui-text-2xl',
              size === 'lg' && 'ui-text-base',
              size === 'md' && 'ui-text-xs'
            )}
          >
            {labelValue}
          </span>
        ) : null}
      </div>
    )
  }
)

CircularProgress.displayName = 'CircularProgress'
