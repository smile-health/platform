import { SVGProps } from 'react';

// Arabic is spoken across many countries, so the icon is a neutral green disc
// with the letter ع instead of a single national flag.
export default function FlagAr(props: SVGProps<SVGSVGElement>) {
  const { dominantBaseline, textAnchor, ...svgProps } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 512 512"
      {...svgProps}
    >
      <path fill="#006c35" d="M0 0h512v512H0Z"></path>
      <text
        x="256"
        y="300"
        fill="#fff"
        fontSize="300"
        fontFamily="sans-serif"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        ع
      </text>
    </svg>
  );
}
