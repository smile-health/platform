import { Button } from '@repo/ui/components/button';
import { ButtonIcon } from '@repo/ui/components/button-icon';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
} from '@repo/ui/components/drawer';
import DotsGrid from '@repo/ui/components/icons/DotsGrid';
import Home from '@repo/ui/components/icons/Home';
import { ProgramItemLink } from '@repo/ui/components/modules/ProgramItemLink';
import { Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useProgram } from '@repo/ui/hooks/program/useProgram';
import { IconPrograms } from '@repo/ui/constants/program';

const DropdownProgram = () => {
  const {
    i18n: { language },
    t,
  } = useTranslation('common');
  const [open, setOpen] = useState(false);

  const { data: programs, getHref } = useProgram({
    isEnabled: true,
    isWms: true,
  });

  return (
    <Fragment>
      <ButtonIcon
        size="sm"
        variant="subtle"
        onClick={() => setOpen(true)}
        id="trigger-drawer-program-open"
      >
        <DotsGrid className="ui-text-blue-800" />
      </ButtonIcon>

      <Drawer open={open} onOpenChange={setOpen} placement="left">
        <DrawerHeader>
          <div className="ui-flex ui-justify-between ui-items-center">
            <ButtonIcon
              size="sm"
              variant="subtle"
              onClick={() => setOpen(false)}
              id="trigger-drawer-program-close"
            >
              <DotsGrid className="ui-text-blue-800" />
            </ButtonIcon>
            <Button
              variant="subtle"
              rightIcon={<Home className="ui-w-5" />}
              onClick={() => {
                const baseUrl = process.env.NEXT_PUBLIC_URL_FE_SMILE;
                window.location.replace(`${baseUrl}/${language}/v5/program`);
              }}
              id="navbar-program"
              className="ui-text-blue-800"
            >
              {t('dropdown_setting.back_to_smile')}
            </Button>
          </div>
        </DrawerHeader>
        <DrawerContent>
          <div className="ui-flex ui-flex-col ui-gap-3">
            <h4 className="ui-text-base ui-font-bold">SMILE App</h4>
            {programs?.map((program) => (
              <ProgramItemLink
                id={`navbar-program-${program.key}`}
                key={program.key}
                data={program}
                onClick={() => setOpen(false)}
                href={program.href || getHref(program.key)}
                className={{
                  wrapper:
                    'ui-py-2 ui-cursor-pointer ui-gap-2 hover:ui-bg-gray-100',
                  logo: 'ui-w-8 ui-h-8',
                  title: 'ui-text-sm ui-m-2',
                }}
                icon={IconPrograms[program.key]}
                sizeIcon={32}
              />
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </Fragment>
  );
};

export default DropdownProgram;
