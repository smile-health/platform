import React from 'react'

const SignalIcon = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="21"
      fill="none"
      viewBox="0 0 22 21"
      {...props}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M15.243 4.757a6 6 0 010 8.486m-8.485 0a6 6 0 010-8.486m-2.83 11.314C.025 12.166.025 5.834 3.929 1.93m14.144 0c3.905 3.905 3.905 10.237 0 14.142M11 11a2 2 0 100-4 2 2 0 000 4zm0 0v9"
      ></path>
    </svg>
  )
}

export default SignalIcon
