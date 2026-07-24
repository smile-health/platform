import * as React from 'react'
import { SVGProps } from 'react'

const CrossCircleIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={15}
    height={15}
    fill="none"
    {...props}
  >
    <path
      stroke="#DC2626"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.67}
      d="m9.503 5.502-4 4m0-4 4 4m4.666-2a6.667 6.667 0 1 1-13.333 0 6.667 6.667 0 0 1 13.333 0Z"
    />
  </svg>
)
export default CrossCircleIcon
