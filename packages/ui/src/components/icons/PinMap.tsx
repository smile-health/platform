import * as React from 'react'

const PinMap = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="none"
    viewBox="0 0 16 16"
    {...props}
  >
    <path
      fill="#DC2626"
      d="M8 1.441c-2.8 0-5.334 2.147-5.334 5.467q.002 3.178 4.893 7.487c.254.22.634.22.887 0 3.253-2.874 4.887-5.367 4.887-7.487 0-3.32-2.534-5.467-5.334-5.467m0 6.667c-.734 0-1.334-.6-1.334-1.333 0-.734.6-1.334 1.333-1.334.734 0 1.334.6 1.334 1.334 0 .733-.6 1.333-1.334 1.333"
    ></path>
  </svg>
)

export default PinMap
