import { Avatar } from '@repo/ui/components/avatar';
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from '@repo/ui/components/dropdown-menu';
import Logout from '@repo/ui/components/icons/Logout';
import { toast } from '@repo/ui/components/toast';
import { useTranslation } from 'react-i18next';

import { getUserStorage } from '@/utils/storage/user';
import Image from 'next/image';
import LanguageChanger from '../LanguageChanger';
import WeightChanger from '../WeightChanger';
import DropdownProgram from './DropdownProgram';
import NotificationInbox from './NotificationInbox';

const Header: React.FC = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'login']);
  const user = getUserStorage();

  const handleBackToSmile = () => {
    toast.success({
      description: t('login:success_back_to_smile'),
      id: 'toast-success-back-to-smile',
    });

    // Just navigate — AUTH_TOKEN is the shared Smile session cookie now, so
    // clearing it here (as this used to, back when WMS had its own separate
    // session) would end the user's real Smile session too.
    setTimeout(() => {
      window.location.replace(
        `${process.env.NEXT_PUBLIC_URL_FE_SMILE}/${language}/v5/program`
      );
    }, 1000);
  };

  return (
    <div className="ui-flex ui-items-center ui-justify-between ui-px-4 ui-py-4 ui-mx-auto ui-border ui-border-neutral-200">
      <div className="ui-flex ui-flex-row ui-space-x-4 ui-divide-x-2 ui-divide-[#D9D9D9] ui-items-center">
        <div className="ui-flex ui-gap-4 ui-items-center">
          <DropdownProgram />
          <p className="ui-text-base font-bold">{t('titleHeader')}</p>
        </div>
        <div className="ui-flex ui-gap-4 ui-pl-4 ui-items-center">
          <Image
            className="ui-mr-4 ui-h-7 ui-w-auto"
            src="/images/logo-smile.svg"
            alt="smile-logo"
            width={200}
            height={200}
          />
          <Image
            className="ui-mr-4 ui-h-7 ui-w-auto"
            src="/images/logo-kemenkes.png"
            alt="kemenkes-logo"
            width={100}
            height={100}
          />
          <Image
            className="ui-mr-4 ui-h-7 ui-w-auto"
            src="/images/logo-kesling.png"
            alt="kesling-logo"
            width={100}
            height={100}
          />
          <Image
            className="ui-mr-4 ui-h-7 ui-w-auto"
            src="/images/logo-undp.png"
            alt="undp-logo"
            width={100}
            height={100}
          />
          {user?.entity?.name && (
            <p className="ui-text-base font-bold">{user.entity.name}</p>
          )}
        </div>
      </div>
      <div className="ui-flex ui-items-center ui-space-x-4 ui-divide-x-2 ui-divide-[#D9D9D9]">
        <div className="ui-flex ui-items-center ui-gap-4">
          <NotificationInbox />
          <LanguageChanger />
          <WeightChanger />
        </div>

        <div className="ui-flex ui-gap-4 ui-pl-4 ui-items-center">
          <DropdownMenuRoot>
            <DropdownMenuTrigger>
              <button
                className="ui-items-center focus:ui-outline-none ui-flex ui-flex-row"
                id="trigger-dropdown-header"
              >
                <Avatar name={user?.username}></Avatar>
                <div className="ui-min-w-[140px] ui-text-[#414042] ui-px-2 ui-py-1 ui-text-left">
                  {user?.firstname} {user?.lastname}
                </div>
                <div className="ui-py-2">
                  <Image
                    src="/images/ic-expand-more.png"
                    alt="expand-icon"
                    width={16}
                    height={16}
                  />
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {/* <Link
								href={`/${language}/v5/account`}
								id="dropdown-header-account"
							>
								<DropdownMenuItem>
									<div className="ui-my-1 ui-flex ui-gap-3 ui-items-center ui-min-w-60 focus:outline-none">
										<Account />
										{t('common:dropdown_setting.view_profile')}
									</div>
								</DropdownMenuItem>
							</Link> */}
              <DropdownMenuItem>
                <button
                  className="ui-my-1 ui-flex ui-gap-3 ui-items-center ui-min-w-60 focus:outline-none"
                  onClick={() => handleBackToSmile()}
                  id="dropdown-header-back-to-smile"
                  type="button"
                >
                  <Logout />
                  {t('common:dropdown_setting.back_to_smile')}
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenuRoot>
        </div>
      </div>
    </div>
  );
};

export default Header;
