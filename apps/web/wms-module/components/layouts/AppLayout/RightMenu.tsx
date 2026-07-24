import { ReactNode, useRef, useState } from 'react';
import { useOnClickOutside } from '@repo/ui/hooks/useOnClickOutside';

type Props = {
  title: string;
  left: number;
  children: ReactNode;
};

const RightMenu: React.FC<Props> = (props) => {
  const { title, left, children } = props;
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useOnClickOutside(ref, () => setShow(false));

  return (
    <div className="ui-relative ui-cursor-pointer ui-text-left ui-block ui-text-primary-500 hover:ui-text-primary-700 hover:ui-bg-gray-100 ui-px-6 ui-py-1">
      <button
        {...props}
        id={`trigger-${title}`}
        className="ui-flex ui-justify-between ui-text-primary"
        onClick={() => setShow((prev) => !prev)}
      >
        {title}{' '}
        <span className="ui-flex ui-items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="ui-w-4 ui-h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </span>
      </button>
      {show ? (
        <div
          ref={ref}
          style={{ left: left || 300, top: 0 }}
          className="ui-absolute ui-z-50 ui-py-1 ui-origin-top-right ui-bg-white ui-border ui-border-gray-400 ui-rounded-sm ui-w-max"
        >
          <div className="ui-flex ui-flex-col">{children}</div>
        </div>
      ) : null}
    </div>
  );
};

export default RightMenu;
