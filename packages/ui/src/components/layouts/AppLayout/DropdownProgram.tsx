import { Fragment, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { Button } from '#components/button'
import { ButtonIcon } from '#components/button-icon'
import { Drawer, DrawerContent, DrawerHeader } from '#components/drawer'
import DotsGrid from '#components/icons/DotsGrid'
import Home from '#components/icons/Home'
import { ProgramItemLink } from '#components/modules/ProgramItemLink'
import { IconPrograms } from '#constants/program'
import { useProgram } from '#hooks/program/useProgram'
import { useTranslation } from 'react-i18next'

const DropdownProgram = () => {
  const {
    i18n: { language },
  } = useTranslation()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const { data, getHref } = useProgram({ isEnabled: false })

  let programs = useMemo(() => {
    let temp = data || []
    return temp
  }, [data])

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
              onClick={() => router.push(`/${language}/v5/program`)}
              id="navbar-program"
              className="ui-text-blue-800"
            >
              Back to Home
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
                target={
                  program.key === 'waste-management' ? '_blank' : undefined
                }
                icon={IconPrograms[program.key]}
                sizeIcon={32}
              />
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </Fragment>
  )
}

export default DropdownProgram
