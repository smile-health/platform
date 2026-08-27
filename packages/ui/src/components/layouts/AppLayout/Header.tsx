import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { Avatar } from "#components/avatar";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from "#components/dropdown-menu";
import Account from "#components/icons/Account";
import ExportHistory from "#components/icons/ExportHistory";
import Inventory from "#components/icons/Inventory";
import Logout from "#components/icons/Logout";
import Setting from "#components/icons/Settings";
import { toast } from "#components/toast";
import { USER_ROLE } from "#constants/roles";
import { useProgram } from "#hooks/program/useProgram";
import useSmileRouter from "#hooks/useSmileRouter";
import { requestlogout } from "#services/auth";
import { hasPermission } from "#shared/permission/index";
import { useAuth } from "#store/auth.store";
import { useLoadingPopupStore } from "#store/loading.store";
import { getUserStorage } from "#utils/storage/user";
import { truncateText } from "#utils/strings";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";

import LanguageChanger from "../LanguageChanger";
import DropdownProgram from "./DropdownProgram";
import NotificationInbox from "./NotificationInbox";

const Header: React.FC = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation(["common", "login"]);

  const user = getUserStorage();
  const program = useProgram();

  const { setLoadingPopup } = useLoadingPopupStore();
  const { logout } = useAuth();
  const router = useSmileRouter();

  const { mutate: handleLogout } = useMutation({
    onMutate: () => setLoadingPopup(true),
    mutationFn: requestlogout,
    onError: (err: AxiosError) => {
      const { message } = err.response?.data as { message: string };

      toast.danger({ description: message });
    },
    onSettled: () => setLoadingPopup(false),
    onSuccess: () => {
      toast.success({
        description: t("login:success_logout"),
        id: "toast-success-logout",
      });
      logout();
    },
  });

  const isVendorIot = user?.role === USER_ROLE.VENDOR_IOT;

  return (
    <div className="ui-flex ui-items-center ui-justify-between ui-px-4 ui-py-4 ui-mx-auto ui-border ui-border-neutral-200">
      <div className="ui-flex ui-flex-row ui-space-x-4 ui-divide-x-2 ui-divide-[#D9D9D9] ui-items-center">
        <div className="ui-flex ui-gap-4 ui-items-center">
          <DropdownProgram />
          <p className="ui-text-base font-bold">
            {program?.activeProgram?.name ?? "SMILE Indonesia"}
          </p>
        </div>
        <div className="ui-flex ui-gap-6 ui-pl-4 ui-items-center">
          <img
            className="ui-h-7 ui-w-auto"
            src="/images/logo-smile.svg"
            alt="smile-logo"
          />
          <img
            className="ui-h-7 ui-w-auto"
            src="/images/logo-undp.png"
            alt="undp-logo"
          />
          {user?.entity?.name && (
            <p className="ui-text-base ui-font-bold">
              {truncateText(user.entity.name, 75)}
            </p>
          )}
        </div>
      </div>
      <div className="ui-flex ui-items-center ui-space-x-4 ui-divide-x-2 ui-divide-[#D9D9D9]">
        <div className="ui-flex ui-items-center ui-gap-4">
          {hasPermission("global-asset-managements-menu") && (
            <div>
              <Link
                href={router.getAsLinkGlobal(
                  `/v5/global-asset/management/${
                    isVendorIot
                      ? "monitoring-device-inventory"
                      : "operational-asset-inventory"
                  }`,
                )}
                className="ui-flex ui-items-center ui-space-x-3 ui-text-blue-800"
                rel="noreferrer"
              >
                <Inventory />
                <div>
                  {t("common:dropdown_setting.global_asset_managements")}
                </div>
              </Link>
            </div>
          )}
          <div>
            <Link
              href={router.getAsLinkGlobal(`/v5/export-history`)}
              className="hover:ui-text-blue-700 ui-relative ui-text-blue-800 ui-cursor-pointer"
              rel="noreferrer"
            >
              <ExportHistory />
            </Link>
          </div>
          <NotificationInbox />
          <LanguageChanger />
        </div>

        <div className="ui-flex ui-gap-4 ui-pl-4 ui-items-center">
          <DropdownMenuRoot>
            <DropdownMenuTrigger>
              <button
                className="ui-items-center flex flex-row focus:outline-none"
                id="trigger-dropdown-header"
              >
                {user && (
                  <Avatar
                    name={`${user?.firstname} ${user?.lastname}`}
                  ></Avatar>
                )}
                <div className="ui-min-w-[140px] ui-tex-[#414042] px-2 py-1 text-left">
                  {user?.firstname ?? ""} {user?.lastname ?? ""}
                </div>
                <div className="py-2">
                  <img src="/images/ic-expand-more.png" alt="expand-icon" />
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <Link
                href={`/${language}/v5/account`}
                id="dropdown-header-account"
              >
                <DropdownMenuItem>
                  <div className="ui-my-1 ui-flex ui-gap-3 ui-items-center ui-min-w-60 focus:outline-none">
                    <Account />
                    {t("common:dropdown_setting.view_profile")}
                  </div>
                </DropdownMenuItem>
              </Link>
              {hasPermission("global-settings-menu") && (
                <Link
                  href={`/${language}/v5/global-settings/entity`}
                  id="dropdown-header-global-settings/entity"
                >
                  <DropdownMenuItem>
                    <div className="ui-my-1 ui-flex ui-gap-3 ui-items-center ui-min-w-60 focus:outline-none">
                      <Setting />
                      {t("common:dropdown_setting.global_settings")}
                    </div>
                  </DropdownMenuItem>
                </Link>
              )}
              <DropdownMenuItem
                onSelect={() => handleLogout()}
                id="dropdown-header-logout"
              >
                <div className="ui-my-1 ui-flex ui-gap-3 ui-items-center ui-min-w-60 focus:outline-none">
                  <Logout />
                  {t("common:dropdown_setting.logout")}
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenuRoot>
        </div>
      </div>
    </div>
  );
};

export default Header;
