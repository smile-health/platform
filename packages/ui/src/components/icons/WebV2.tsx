import * as React from 'react'
import { SVGProps } from 'react'

export const WebV2 = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="21"
    height="20"
    fill="none"
    viewBox="0 0 21 20"
    {...props}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M7.332 17.5h6.667m-3.334-3.333V17.5m-4.333-3.333h8.667c1.4 0 2.1 0 2.635-.273a2.5 2.5 0 0 0 1.092-1.092c.273-.535.273-1.235.273-2.635V6.5c0-1.4 0-2.1-.273-2.635a2.5 2.5 0 0 0-1.092-1.093c-.535-.272-1.235-.272-2.635-.272H6.332c-1.4 0-2.1 0-2.635.272a2.5 2.5 0 0 0-1.092 1.093C2.332 4.4 2.332 5.1 2.332 6.5v3.667c0 1.4 0 2.1.273 2.635a2.5 2.5 0 0 0 1.092 1.092c.535.273 1.235.273 2.635.273"
    ></path>
  </svg>
)

export default WebV2
