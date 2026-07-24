import * as React from 'react'
import { SVGProps } from 'react'

const Mobile = (props: SVGProps<SVGSVGElement>) => (
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
      d="M19 6a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v12a4 4 0 0 0 4 4h6a4 4 0 0 0 4-4V6Zm-4-2a1 1 0 0 1-.883.993L14 5h-4a1 1 0 0 1-1-1 2 2 0 0 0-1.995 1.85L7 6v12a2 2 0 0 0 1.85 1.994L9 20h6a2 2 0 0 0 1.994-1.85L17 18V6a2 2 0 0 0-1.85-1.995L15 4ZM8 6v2h2V6H8Zm5 0h-2v2h2V6Zm3 0v2h-2V6h2ZM8 9v2h2V9H8Z"
      clipRule="evenodd"
    />
  </svg>
)

export default Mobile
