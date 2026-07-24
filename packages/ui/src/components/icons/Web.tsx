import * as React from 'react'
import { SVGProps } from 'react'

export const Web = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <path
      fill="#1BA8DF"
      fillRule="evenodd"
      d="M4 4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H4Zm0 6v8h2v-8H4Zm4 0v8h12v-8H8Z"
      clipRule="evenodd"
    />
  </svg>
)

export default Web
