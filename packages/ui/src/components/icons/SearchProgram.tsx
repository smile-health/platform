export default function SearchProgram({
  className,
}: {
  readonly className?: string
}) {
  return (
    <svg
      width="56"
      height="56"
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="4" y="4" width="48" height="48" rx="24" fill="#E4E4E7" />
      <rect
        x="4"
        y="4"
        width="48"
        height="48"
        rx="24"
        stroke="#F4F4F5"
        strokeWidth="8"
      />
      <path
        d="M37 37L33.5001 33.5M36 27.5C36 32.1944 32.1944 36 27.5 36C22.8056 36 19 32.1944 19 27.5C19 22.8056 22.8056 19 27.5 19C32.1944 19 36 22.8056 36 27.5Z"
        stroke="#52525B"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
