import {
  DropdownMenuContent,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from '@repo/ui/components/dropdown-menu';
import Link from 'next/link';
import React from 'react';

import useWmsRouter from '@/utils/hooks/useWmsRouter';
import Image from 'next/image';
import RightMenuNav from './RightMenuNav';

type Props = {
  show?: boolean;
  title: string;
  navChild: Array<{
    className: string;
    title: string;
    link: string | null;
    isExist?: boolean;
    roles?: string[];
    rNavChild?: Array<{
      className: string;
      title: string;
      link: string;
      isExist?: boolean;
      roles?: string[];
    }>;
  }>;
  className?: string;
};

const DropdownNav: React.FC<Props> = ({
  show = true,
  title,
  navChild,
  className,
}) => {
  const router = useWmsRouter();

  if (!show) return null;

  return (
    <DropdownMenuRoot>
      <DropdownMenuTrigger>
        <div className={className} id={`trigger-${title}`}>
          <div>{title}</div>
          <div className="ui-py-1 ui-pl-2">
            <Image
              src="/images/ic-expand-more-gray.png"
              alt="expand-icon"
              width={16}
              height={16}
            />
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent hidden={!show}>
        <div className="ui-flex ui-flex-col ui-gap-1">
          {navChild
            .filter((item) => item.isExist)
            .map((item) => {
              if (item?.rNavChild) {
                return (
                  <RightMenuNav
                    title={item.title}
                    left={220}
                    rNavChild={item.rNavChild}
                    key={item.link}
                  />
                );
              }
              return (
                <Link
                  className={`${item.className} ui-text-left ui-block ui-text-primary-500 ui-cursor-pointer hover:ui-text-primary-700 hover:ui-bg-gray-100 ui-px-6 ui-py-1`}
                  id={`navbar-${item.link}`}
                  key={`navbar-${item.link}`}
                  href={router.getAsLink(item.link ?? '')}
                >
                  {item.title}
                </Link>
              );
            })}
        </div>
      </DropdownMenuContent>
    </DropdownMenuRoot>
  );
};

export default DropdownNav;
