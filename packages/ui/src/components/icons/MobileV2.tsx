import * as React from 'react'
import { SVGProps } from 'react'

const MobileV2 = (props: SVGProps<SVGSVGElement>) => (
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
      d="M13.165 1.667v1.166c0 .467 0 .7-.09.879a.83.83 0 0 1-.365.364c-.178.09-.411.09-.878.09H9.499c-.467 0-.7 0-.879-.09a.83.83 0 0 1-.364-.364c-.09-.179-.09-.412-.09-.879V1.667m-.667 16.666h6.333c.933 0 1.4 0 1.757-.181.313-.16.568-.415.728-.729.182-.356.182-.823.182-1.756V4.333c0-.933 0-1.4-.182-1.756a1.67 1.67 0 0 0-.728-.729c-.357-.181-.824-.181-1.757-.181H7.499c-.934 0-1.4 0-1.757.181-.314.16-.569.415-.728.729-.182.356-.182.823-.182 1.756v11.334c0 .933 0 1.4.182 1.756.16.314.414.569.728.729.357.181.823.181 1.757.181"
    ></path>
  </svg>
)

export default MobileV2
