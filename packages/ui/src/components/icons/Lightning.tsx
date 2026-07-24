import * as React from 'react'

const Lightning = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={14}
    height={16}
    fill="none"
    {...props}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M7.667 1.332 1.73 8.457c-.233.28-.35.419-.351.537-.002.102.044.2.124.264.091.074.273.074.636.074h4.862l-.667 5.333 5.938-7.125c.232-.279.348-.418.35-.536a.333.333 0 0 0-.124-.265c-.091-.074-.273-.074-.636-.074H7l.666-5.333Z"
    />
  </svg>
)
export default Lightning
