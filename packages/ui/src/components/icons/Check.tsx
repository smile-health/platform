import { SVGProps } from 'react'

export default function Check(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M8.00065 1.33594C4.32065 1.33594 1.33398 4.3226 1.33398 8.0026C1.33398 11.6826 4.32065 14.6693 8.00065 14.6693C11.6807 14.6693 14.6673 11.6826 14.6673 8.0026C14.6673 4.3226 11.6807 1.33594 8.00065 1.33594ZM6.66732 11.3359L3.33398 8.0026L4.27398 7.0626L6.66732 9.44927L11.7273 4.38927L12.6673 5.33594L6.66732 11.3359Z"
        fill="#15803D"
      />
    </svg>
  )
}
