import React, { useCallback, useEffect, useState } from 'react'
import { Button } from '#components/button'
import { useTranslation } from 'react-i18next'

type Props = {
  title: string
  setIsEdit: (value: boolean) => void
}

const EntityDetailActivityImplementationTimeTopStickedButton: React.FC<
  Props
> = ({ setIsEdit, title }) => {
  const { t } = useTranslation(['common', 'entity'])
  const [isAppear, setIsAppear] = useState(false)

  const handleScroll = useCallback(() => {
    if (window.scrollY > 450) {
      setIsAppear(true)
    } else {
      setIsAppear(false)
    }
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <>
      <div
        className={`${isAppear ? 'appear' : ''} ui-fixed ui-w-full ui-left-0 ui-bg-white ui-h-20 ui-z-10 ui-shadow-md sliding-div ui-flex ui-justify-between ui-items-center ui-px-40`}
      >
        <p className="ui-font-bold ">{title}</p>
        <div className="ui-w-auto ui-flex ui-justify-end ui-items-center">
          <div className="ui-mr-[16px]">
            <Button
              id="btn__link__entity__cancel__2"
              variant="outline"
              onClick={() => setIsEdit(false)}
            >
              {t('common:cancel')}
            </Button>
          </div>
          <div>
            <Button
              id="btn__link__entity__save__2"
              variant="solid"
              type="submit"
            >
              {t('common:save')}
            </Button>
          </div>
        </div>
      </div>
      <style>{`
        .sliding-div {
            top: -450px;
            transition: top 0.3s ease;
        }

        .sliding-div.appear {
            top: 0;
        }
      `}</style>
    </>
  )
}

export default EntityDetailActivityImplementationTimeTopStickedButton
