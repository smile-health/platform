import { SVGProps } from 'react'

export default function PlugIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      fill="none"
      {...props}
    >
      <path
        stroke="currentColor"
        strokeWidth={1.5}
        d="M2 8.71v-.645a2 2 0 0 1 2-2h8c1.105 0 2 .765 2 1.87v.775c0 2.645-.546 5.29-2.727 5.29H5c-2.182 0-3-1.984-3-5.29Z"
      />
      <path
        fill="currentColor"
        d="M6.75 2a.75.75 0 0 0-1.5 0h1.5ZM6 6h.75V2h-1.5v4H6Z"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth={1.5}
        d="M6 10v1M10 10v1"
      />
      <path
        fill="currentColor"
        d="M10.75 2a.75.75 0 0 0-1.5 0h1.5ZM10 6h.75V2h-1.5v4H10Z"
      />
    </svg>
  )
}
