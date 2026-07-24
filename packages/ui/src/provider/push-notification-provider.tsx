'use client'

import { useEffect, useState } from 'react'
import { Button } from '#components/button'
import {
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '#components/dialog'
import { useFirebaseMessaging } from '#hooks/useFirebaseMessaging'
import { clearNotificationReminder, isReminderValid } from '#utils/notification'
import { getUserStorage } from '#utils/storage/user'
import { useTranslation } from 'react-i18next'

export function PushNotificationProvider({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { t } = useTranslation(['notification'])
  const { onForegroundMessageReceived } = useFirebaseMessaging()
  const [showPopup, setShowPopup] = useState(false)
  const userDetails = getUserStorage()

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/firebase-messaging-sw.js')
        .then((_) => {
          console.log('[SW] Success register SMILE Service Worker')
        })
        .catch((error) => {
          console.error('[SW] Failed register SMILE Service Worker', error)
        })

      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.action === 'triggerNotificationPopup') {
          setShowPopup(true)
        }
      })
    }

    onForegroundMessageReceived()

    const checkPermissionAndHandle = async () => {
      if (!userDetails?.username) return

      const permission = Notification.permission

      if (permission === 'granted') {
        setShowPopup(false)
        return
      }

      if (permission === 'default') {
        const result = await Notification.requestPermission()

        if (result === 'granted') {
          clearNotificationReminder()
          setShowPopup(false)
        } else {
          // TODO: change to true after there's a further information regarding handle reminder popup
          setShowPopup(false)
        }
      } else if (isReminderValid()) {
        // TODO: change to true after there's a further information regarding handle reminder popup
        setShowPopup(false)
      } else {
        setShowPopup(false)
      }
    }

    checkPermissionAndHandle()

    const handleFocus = () => {
      checkPermissionAndHandle()
    }

    window.addEventListener('focus', handleFocus)

    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [userDetails])

  const handleBlockOrClose = () => {
    if (!userDetails?.username) return
    setShowPopup(false)
  }

  return (
    <>
      <Dialog
        open={showPopup}
        onOpenChange={setShowPopup}
        className="ui-z-30"
        classNameOverlay="ui-z-60"
        verticalCentered
        size="lg"
      >
        <DialogCloseButton onClick={handleBlockOrClose} />
        <DialogHeader className="ui-text-center ui-text-xl ui-text-dark-teal">
          {t('information.title')}
        </DialogHeader>
        <DialogContent className="ui-text-center ui-text-[#737373] ui-pt-0 ui-pb-4">
          {t('information.description')}
        </DialogContent>
        <DialogFooter>
          <Button
            className="ui-w-full"
            variant="outline"
            onClick={handleBlockOrClose}
          >
            {t('information.button.understand')}
          </Button>
        </DialogFooter>
      </Dialog>
      {children}
    </>
  )
}
