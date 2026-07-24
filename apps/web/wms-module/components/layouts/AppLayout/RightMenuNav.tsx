import Link from 'next/link';

import RightMenu from './RightMenu';
import useWmsRouter from '@/utils/hooks/useWmsRouter';

type Props = {
  title: string;
  rNavChild: Array<{
    className: string;
    title: string;
    link: string;
    isExist?: boolean;
  }>;
  left: number;
};

const RightMenuNav: React.FC<Props> = (props) => {
  const { rNavChild, title, ...navProps } = props;
  const router = useWmsRouter();

  return (
    <RightMenu {...navProps} title={title}>
      {rNavChild.map((item) => (
        <Link
          className={`${item.className} ui-text-left ui-block ui-text-primary-500 ui-cursor-pointer hover:ui-text-primary-700 hover:ui-bg-gray-100 ui-px-6 ui-py-1`}
          id={`navbar-${item.link}`}
          key={`navbar-${item.link}`}
          href={router.getAsLink(item.link)}
        >
          {item.title}
        </Link>
      ))}
    </RightMenu>
  );
};

export default RightMenuNav;
