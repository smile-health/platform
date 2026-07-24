import {
  menuAssetWMS,
  menuReportWMS,
  menuSettingWMS,
  menuWasteWMS,
  logisticKeslingMenuWMS,
  staticMenuWMS,
} from '@/constants/menus';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { ButtonGroup } from '@repo/ui/components/button';
import DropdownNav from './DropdownNav';
import { getUserStorage } from '@/utils/storage/user';
import { ENTITY_TYPE } from '@/types/entity';
import { getAuthTokenCookies, getAuthTokenStorage } from '@/utils/storage/auth';

const styleHover =
  'hover:ui-text-primary-300 ui-flex ui-flex-row ui-text-white ui-cursor-pointer ui-items-center ui-px-[2px]';

const Navbar: React.FC = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const user = getUserStorage();
  const isThirdParty = user?.entity?.type === ENTITY_TYPE.THIRD_PARTY;

  const filteredMenuAsset = menuAssetWMS(t).filter((item) => item.isExist);
  // Logic for dashboard executive menu visibility
  const shouldShowStaticMenu =
    isThirdParty || process.env.NEXT_PUBLIC_DASHBOARD_EXECUTIVE_MENU === '1';
  const filteredStaticMenu = shouldShowStaticMenu
    ? staticMenuWMS(t).filter((item) => item.isExist)
    : [];

  const filteredMenuWaste = menuWasteWMS(t).filter((item) => item.isExist);
  const filteredMenuReport = menuReportWMS(t).filter((item) => item.isExist);
  const filteredMenuSetting = menuSettingWMS(t).filter((item) => item.isExist);
  const DEFAULT_KESLING_PATH = 'kesling/v5/dashboard/transaction-monitoring';

  const hasKeslingProgram = !!user?.programs?.some(
    (program) => program.key === 'kesling' && program.status === 1
  );

  const tokenCookies = getAuthTokenCookies();
  const tokenLocalStorage = getAuthTokenStorage();
  const token = tokenCookies ?? tokenLocalStorage;

  return (
    <div className="ui-bg-primary-500 ui-h-10">
      <ButtonGroup className="ui-gap-x-3 ui-container ui-mx-auto ui-px-6 ui-h-full">
        {filteredStaticMenu.map((item) => {
          const linkTarget = isThirdParty ? undefined : '_blank';
          const linkHref = isThirdParty
            ? item.link
            : `${process.env.NEXT_PUBLIC_URL_DASHBOARD_EXECUTIVE}/validate-token?token=${token}`;
          return (
            <Link
              key={item.link}
              id={item.id}
              className={styleHover}
              target={linkTarget}
              href={linkHref}
            >
              {item.title}
            </Link>
          );
        })}
        {filteredMenuWaste?.length > 0 && (
          <DropdownNav
            title={t('menu.waste.title') as string}
            className={styleHover}
            navChild={filteredMenuWaste}
            show={true}
          />
        )}
        {filteredMenuAsset?.length > 0 && (
          <DropdownNav
            title={t('menu.asset.title') as string}
            className={styleHover}
            navChild={filteredMenuAsset}
            show={true}
          />
        )}
        {filteredMenuReport?.length > 0 && (
          <DropdownNav
            title={t('menu.reporting.title') as string}
            className={styleHover}
            navChild={filteredMenuReport}
            show={true}
          />
        )}
        {filteredMenuSetting?.length > 0 && (
          <DropdownNav
            title={t('menu.setting.title') as string}
            className={styleHover}
            navChild={filteredMenuSetting}
            show={true}
          />
        )}
      </ButtonGroup>
    </div>
  );
};

export default Navbar;
