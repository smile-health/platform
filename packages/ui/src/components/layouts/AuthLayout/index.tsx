import React, { Fragment, ReactNode, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Button } from '#components/button'
import {
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '#components/dialog'
import { Divider } from '#components/divider'
import SendEmail from '#components/icons/SendEmail'
import cx from 'clsx'
import { useTranslation, Trans } from 'react-i18next'

import LanguageChanger from '../LanguageChanger'
import Meta from '../Meta'

type Props = {
  children: ReactNode
}

const AuthLayout: React.FC<Props> = (props) => {
  const { children } = props
  const router = useRouter()
  const {
    t,
    i18n: { language },
  } = useTranslation('login')

  const [isBadr, setIsBadr] = useState<boolean>(false)
  const [showModal, setShowModal] = useState<boolean>(false)
  const [showDisclaimer, setShowDisclaimer] = useState<boolean>(false)
  const [showPrivacy, setShowPrivacy] = useState<boolean>(false)

  useEffect(() => {
    setIsBadr(window.location.hostname == 'smile.badr.co.id')
    if (window.location.hash === '#privacy-policy') {
      setShowPrivacy(true)
    }
  }, [])

  return (
    <Fragment>
      <Meta title="SMILE | Login" />

      <div className="ui-flex ui-flex-col ui-justify-center ui-py-6 ui-px-10">
        <div className="ui-flex ui-justify-between">
          <div className="ui-mt-4 ui-p-0 ui-text-black">
            <LanguageChanger />
          </div>

          <div className="ui-flex ui-mt-6 ui-space-x-3">
            <div
              className={cx('ui-font-semibold', {
                'ui-text-primary-500 ui-font-bold':
                  router.pathname === '/[lang]/v5/login',
                'ui-text-gray-500': router.pathname !== '/[lang]/v5/login',
              })}
            >
              <Link id="redirect-login" href={`/${language}/v5/login`}>
                Login
              </Link>
            </div>
            <div className="text-gray-700">|</div>
            {isBadr ? (
              <div
                className={cx('ui-font-semibold', {
                  'ui-text-primary-500 ui-font-bold':
                    router.pathname === '/[lang]/about',
                  'ui-text-gray-500': router.pathname !== '/[lang]/about',
                })}
              >
                <Link id="redirect-about" href={`/${language}/about`}>
                  {t('about')}
                </Link>
              </div>
            ) : (
              <Fragment>
                <a
                  className="ui-font-semibold ui-text-gray-500 ui-cursor-pointer"
                  onClick={() => setShowDisclaimer(true)}
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setShowDisclaimer(true);
                    }
                  }}
                  role='button'
                  tabIndex={0}
                >
                  {t('disclaimer.title')}
                </a>
                <div className="ui-text-gray-700">|</div>
                <a
                  className="ui-font-semibold ui-text-gray-500 ui-cursor-pointer"
                  onClick={() => setShowPrivacy(true)}
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setShowPrivacy(true);
                    }
                  }}
                  role='button'
                  tabIndex={0}
                >
                  {t('privacy_policy.title')}
                </a>
              </Fragment>
            )}
          </div>
        </div>
        <div className="md:ui-min-w-[542px] ui-relative ui-flex ui-flex-col ui-overflow-auto ui-py-0 md:ui-mx-auto md:ui-mt-[68px]">
          <div className="ui-flex-grow md:ui-px-[79px]">
            <div className="ui-my-[40px] ui-mx-auto">
              <img
                className="ui-m-auto"
                width={180}
                src="/images/logo-smile.svg"
                alt="smile=logo"
              />
            </div>

            {children}
          </div>
          <div className="ui-w-full ui-mb-[40px]">
            <div className="ui-flex ui-items-center ui-justify-center">
              <img src="/images/logo-kemenkes.png" alt="kemenkes-logo" />
              <img
                src="/images/logo-undp.png"
                className="ui-ml-[56px]"
                alt="undp-logo"
              />
              {isBadr && (
                <img
                  src="/images/logo-badr.png"
                  className="ui-ml-[56px]"
                  alt="badr-logo"
                />
              )}
            </div>
            <div className="ui-clear-both">&nbsp;</div>
            <Divider position="center">
              <button
                id="show-help-center"
                onClick={() => setShowModal(true)}
                className="ui-bg-white ui-p-[0 10px] ui-cursor-pointer ui-text-[#fa6400] ui-font-bold"
              >
                {t('help_center.title')}
              </button>
            </Divider>
          </div>
        </div>
      </div>
      <Dialog
        open={showModal}
        onOpenChange={() => setShowModal(false)}
        className="ui-z-20"
        size="lg"
        key="modal-help-center"
      >
        <DialogCloseButton />
        <DialogHeader
          className="ui-text-center ui-text-xl ui-text-dark-blue"
          border
        >
          {t('help_center.title')}
        </DialogHeader>
        <DialogContent>
          <div className="ui-flex ui-flex-col ui-space-y-6 ui-p-5">
            <a
              href={`mailto:halo@smile-indonesia.id`}
              target="_blank"
              rel="noopener noreferrer"
              className="ui-flex"
            >
              <div className="ui-w-10 ui-text-primary ui-pt-1 ui-text-[#004990]">
                <SendEmail />
              </div>
              <div className="ui-w-full ui-flex ui-justify-between">
                <div className="ui-justify-start">
                  <div className="ui-text-md-1">
                    {t('help_center.send_email')}
                  </div>
                  <div>halo@smile-indonesia.id</div>
                </div>
                <div className="ui-justify-end">
                  <img src="/images/ic-expand-right.png" alt="ic-expand-right" />
                </div>
              </div>
            </a>
            <a
              href={`tel:+628041501900`}
              target="_blank"
              rel="noopener noreferrer"
              className="ui-flex ui-flex-row"
            >
              <div className="ui-w-10 ui-pt-1">
                <img src="/images/ic-call.png" alt="ic-call" />
              </div>
              <div className="ui-w-full ui-flex ui-justify-between">
                <div className="ui-justify-start">
                  <div className="ui-text-md-1">
                    {t('help_center.no_handphone')}
                  </div>
                  <span>08041 501900</span>
                </div>
                <div className="ui-justify-start">
                  <img src="/images/ic-expand-right.png" alt="ic-expand-right" />
                </div>
              </div>
            </a>
            <a
              href={`https://wa.me/+6281288933314`}
              target="_blank"
              rel="noopener noreferrer"
              className="ui-flex ui-flex-row"
            >
              <div className="ui-w-10 ui-pt-1">
                <img src="/images/wa.png" className="h-8 w-8" alt="wa" />
              </div>
              <div className="ui-w-full ui-flex ui-justify-between">
                <div className="ui-justify-start">
                  <div className="ui-text-md-1">
                    {t('help_center.whatsapp')}
                  </div>
                  <span>+62812 8893 3314</span>
                </div>
                <div className="ui-justify-start">
                  <img src="/images/ic-expand-right.png" alt="ic-expand-right" />
                </div>
              </div>
            </a>
            <div className="ui-bg-[#F4F4F5] ui-flex ui-flex-col ui-items-center ui-space-y-2 ui-p-6">
              <div className="ui-text-dark-blue ui-font-bold">
                {t('help_center.smile_help_desk')}
              </div>
              <div className="flex items-center">
                <img src="/images/qr-wa.png" alt="wa" />
              </div>
              <div className="ui-text-label-dark ui-text-center ui-font-medium">
                {t('help_center.desc')}
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogFooter className="ui-border-t">
          <Button
            onClick={() => setShowModal(false)}
            variant="outline"
            color="primary"
            className="ui-w-full"
          >
            {t('close')}
          </Button>
        </DialogFooter>
      </Dialog>
      <Dialog
        open={showDisclaimer}
        onOpenChange={() => setShowDisclaimer(false)}
        className="ui-z-20"
        size="lg"
        key="modal-disclaimer"
      >
        <DialogCloseButton />
        <DialogHeader
          className="ui-text-center ui-text-xl ui-text-dark-blue"
          border
        >
          {t('disclaimer.title')}
        </DialogHeader>
        <DialogContent>
          <div className="ui-p-5 ui-text-justify ui-text-neutral-500">
            <Trans i18nKey="disclaimer.desc" t={t} />
          </div>
        </DialogContent>
        <DialogFooter className="ui-border-t">
          <Button
            onClick={() => setShowDisclaimer(false)}
            variant="outline"
            color="primary"
            className="ui-w-full"
          >
            {t('close')}
          </Button>
        </DialogFooter>
      </Dialog>
      <Dialog
        open={showPrivacy}
        onOpenChange={() => setShowPrivacy(false)}
        className="ui-z-20"
        size="lg"
        key="modal-privacy-policy"
      >
        <DialogCloseButton />
        <DialogHeader
          className="ui-text-center ui-text-xl ui-text-dark-blue"
          border
        >
          {t('privacy_policy.title')}
        </DialogHeader>
        <DialogContent>
          <div className="ui-p-5 ui-flex ui-flex-col ui-space-y-5 ui-h-80">
            <div className="ui-flex ui-flex-col ui-space-y-5 ui-text-left">
              <div>
                <div className="ui-font-bold ui-text-dark-blue">
                  {t('privacy_policy.sub_title_one')}
                </div>
                <div className="ui-text-neutral-500">
                  {t('privacy_policy.effective_date')}
                </div>
              </div>
              <div className="ui-text-neutral-500">
                {t('privacy_policy.desc_one')}
              </div>
            </div>
            <div className="ui-flex ui-flex-col ui-space-y-5 ui-text-left">
              <div className="ui-font-bold ui-text-dark-blue">
                {t('privacy_policy.sub_title_two')}
              </div>
              <div className="ui-text-neutral-500">
                {t('privacy_policy.desc_two')}
              </div>
              <div className="ui-ml-5 ui-text-neutral-500">
                <ul className="ui-list-disc ui-space-y-1">
                  {(
                    t('privacy_policy.desc_two_list', {
                      returnObjects: true,
                    }) as string[]
                  ).map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="ui-flex ui-flex-col ui-space-y-5 ui-text-left">
              <div className="ui-font-bold ui-text-dark-blue">
                {t('privacy_policy.sub_title_three')}
              </div>
              <div className="ui-text-neutral-500">
                {t('privacy_policy.desc_three')}
              </div>
              <div className="ui-ml-5 ui-text-neutral-500">
                <ul className="ui-list-disc ui-space-y-1">
                  {(
                    t('privacy_policy.desc_three_list', {
                      returnObjects: true,
                    }) as string[]
                  ).map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="ui-flex ui-flex-col ui-space-y-5 ui-text-left">
              <div className="ui-font-bold ui-text-dark-blue">
                {t('privacy_policy.sub_title_four')}
              </div>
              <div className="ui-text-neutral-500">
                {t('privacy_policy.desc_four')}
              </div>
            </div>
            <div className="ui-flex ui-flex-col ui-space-y-5 ui-text-left">
              <div className="ui-font-bold ui-text-dark-blue">
                {t('privacy_policy.sub_title_five')}
              </div>
              <div className="ui-text-neutral-500">
                {t('privacy_policy.desc_five')}
              </div>
            </div>
            <div className="ui-flex ui-flex-col ui-space-y-5 ui-text-left">
              <div className="ui-font-bold ui-text-dark-blue">
                {t('privacy_policy.sub_title_six')}
              </div>
              <div className="ui-text-neutral-500">
                {t('privacy_policy.desc_six')}
              </div>
            </div>
            <div className="ui-flex ui-flex-col ui-space-y-5 ui-text-left">
              <div className="ui-font-bold ui-text-dark-blue">
                {t('privacy_policy.sub_title_seven')}
              </div>
              <div className="ui-text-neutral-500">
                {t('privacy_policy.desc_seven')}
              </div>
            </div>
            <div className="ui-flex ui-flex-col ui-space-y-5 ui-text-left">
              <div className="ui-font-bold ui-text-dark-blue">
                {t('privacy_policy.sub_title_eight')}
              </div>
              <div className="ui-text-neutral-500">
                {t('privacy_policy.desc_eight')}
              </div>
            </div>
            <div className="ui-flex ui-flex-col ui-space-y-5 ui-text-left">
              <div className="ui-font-bold ui-text-dark-blue">
                {t('privacy_policy.sub_title_nine')}
              </div>
              <div className="ui-text-neutral-500">
                {t('privacy_policy.desc_nine')}{' '}
                <Link href="mailto:smile.dev.contact@gmail.com">
                  smile.dev.contact@gmail.com
                </Link>
                {', '}
                <Link href="mailto:helpdesk@kemkes.go.id">
                  helpdesk@kemkes.go.id
                </Link>
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogFooter className="ui-border-t">
          <Button
            onClick={() => setShowPrivacy(false)}
            variant="outline"
            color="primary"
            className="ui-w-full"
          >
            {t('close')}
          </Button>
        </DialogFooter>
      </Dialog>
    </Fragment>
  )
}

export default AuthLayout
