export default function Import({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M13.3327 9.99739L9.99935 6.66406M9.99935 6.66406L6.66602 9.9974M9.99935 6.66406V14.3307C9.99935 15.4897 9.99935 16.0691 10.4581 16.7179C10.7629 17.149 11.6405 17.681 12.1637 17.7519C12.9511 17.8586 13.2501 17.7026 13.8482 17.3906C16.5132 16.0004 18.3327 13.2114 18.3327 9.99739C18.3327 5.39502 14.6017 1.66406 9.99935 1.66406C5.39697 1.66406 1.66602 5.39502 1.66602 9.9974C1.66602 13.0819 3.34184 15.775 5.83268 17.2159"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
