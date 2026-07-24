import * as React from 'react'

const FullScreen = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    fill="none"
    viewBox="0 0 14 14"
    {...props}
  >
    <path
      stroke="#3F3F46"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.111"
      d="m8.334 5 3.333-3.333m0 0H8.334m3.333 0V5M5 5 1.667 1.667m0 0V5m0-3.333H5m0 6.666-3.333 3.334m0 0H5m-3.333 0V8.333m6.667 0 3.333 3.334m0 0V8.333m0 3.334H8.334"
    ></path>
  </svg>
)

export default FullScreen
