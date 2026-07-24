import { useRouter } from 'next/router';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import { listLanguage } from '@repo/ui/constants/language';
import { useTranslation } from 'react-i18next';

import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from '@repo/ui/components/dropdown-menu';

const LanguageChanger: React.FC = () => {
  const router = useRouter();
  const {
    i18n: { language },
  } = useTranslation();

  const handleLocaleChange = (value: string) => {
    const regex = new RegExp(
      `^/(${listLanguage.map((x) => x.value).join('|')})`
    );
    // handle for base error page 404
    router.push(router.pathname, router.asPath.replace(regex, `/${value}`));
  };

  const currentLang = listLanguage.find((x) => x.value === language);

  return (
    <DropdownMenuRoot>
      <DropdownMenuTrigger>
        {currentLang && (
          <div
            key={currentLang.value}
            className="ui-bg-[#F5F5F4] ui-flex ui-gap-2 ui-items-center ui-p-[6px] ui-w-[80px] ui-cursor-pointer"
            id="trigger-language-changer"
          >
            <currentLang.icon className="ui-rounded-full" />
            {currentLang.value.toUpperCase()}
            <ChevronDownIcon className="ui-w-3" />
          </div>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {listLanguage.map((x) => (
          <DropdownMenuItem
            key={x.value}
            onClick={() => handleLocaleChange(x.value)}
            id={`language-${x.value}`}
          >
            <div className="ui-flex ui-gap-2 ui-items-center">
              <x.icon className="ui-rounded-full" />
              {x.value.toUpperCase()}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenuRoot>
  );
};

export default LanguageChanger;
