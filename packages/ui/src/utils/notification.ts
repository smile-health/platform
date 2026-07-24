const REMINDER_KEY = 'notification_reminder'

export function saveNotificationReminder({
  time = 0,
  whitelistUser = [],
  username = '',
}: {
  time?: number
  whitelistUser?: string[]
  username?: string
}) {
  const now = new Date()
  const isAllowed = whitelistUser?.includes(username)

  const reminderTime = isAllowed
    ? new Date(now.getTime() + time * 1000).getTime()
    : new Date(now.getTime() + 24 * 60 * 20 * 1000).getTime()
  localStorage.setItem(REMINDER_KEY, reminderTime.toString())
  // console.log(
  //   `[Reminder] Saved new reminder for ${new Date(reminderTime).toISOString()}`
  // )

  // Kirim pesan ke Service Worker
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      action: 'saveNotificationReminder',
      reminderTime,
    })
  }
}

export function clearNotificationReminder() {
  localStorage.removeItem(REMINDER_KEY)
  // console.log('[Reminder] Cleared notification reminder')

  // Kirim pesan ke Service Worker
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      action: 'clearNotificationReminder',
    })
  }
}

export function isReminderValid(): boolean {
  const value = localStorage.getItem(REMINDER_KEY)
  if (!value) return false

  const reminderTime = parseInt(value, 10)
  const now = Date.now()

  if (isNaN(reminderTime)) {
    // console.warn('[Reminder] Invalid reminder timestamp format')
    return false
  }

  const isValid = now >= reminderTime

  if (isValid) {
    // console.log('[Reminder] Reminder is valid and expired')
    return true
  }

  // Jika waktu belum sampai, tetap valid untuk penjadwalan
  return false
}

export function startReminderDebugTimer() {
  const value = localStorage.getItem(REMINDER_KEY)
  if (!value) {
    console.log('[DebugTimer] No reminder found')
    return
  }

  const reminderTime = parseInt(value, 10)
  if (isNaN(reminderTime)) {
    console.warn('[DebugTimer] Invalid reminder timestamp')
    return
  }

  const timer = setInterval(() => {
    const now = Date.now()
    const remaining = reminderTime - now
    if (remaining <= 0) {
      console.log('[DebugTimer] Reminder time reached.')
      clearInterval(timer)
    } else {
      const secondsRemaining = Math.ceil(remaining / 1000)
      console.log(
        `[DebugTimer] ${secondsRemaining} seconds remaining until reminder`
      )
    }
  }, 100000)
}
