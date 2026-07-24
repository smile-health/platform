import React from 'react'

const BatteryIcon = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="14"
      fill="none"
      viewBox="0 0 22 14"
      {...props}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M5.5 5v4m4-4v4M21 8V6M5.8 13h7.4c1.68 0 2.52 0 3.162-.327a3 3 0 001.311-1.311C18 10.72 18 9.88 18 8.2V5.8c0-1.68 0-2.52-.327-3.162a3 3 0 00-1.311-1.311C15.72 1 14.88 1 13.2 1H5.8c-1.68 0-2.52 0-3.162.327a3 3 0 00-1.311 1.311C1 3.28 1 4.12 1 5.8v2.4c0 1.68 0 2.52.327 3.162a3 3 0 001.311 1.311C3.28 13 4.12 13 5.8 13z"
      ></path>
    </svg>
  )
}

export default BatteryIcon
