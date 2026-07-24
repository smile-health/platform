self.addEventListener('install', (event) => {
  console.log('[SW] Installed')
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('[SW] Activated')
  self.clients.claim()
})

self.addEventListener('message', (event) => {
  if (event.data.action === 'saveNotificationReminder') {
    const reminderTime = event.data.reminderTime
    console.log(`[SW] Reminder scheduled at ${new Date(reminderTime).toISOString()}`)
    scheduleReminderCheck(reminderTime)
  }

  if (event.data.action === 'clearNotificationReminder') {
    console.log('[SW] Reminder cleared')
    // Nothing to clear since we're not storing in localStorage
  }
})

function scheduleReminderCheck(reminderTime) {
  const now = Date.now()
  const delay = reminderTime - now

  if (delay <= 0) {
    triggerPopup()
  } else {
    setTimeout(() => {
      triggerPopup()
    }, delay)
  }
}

function triggerPopup() {
  console.log('[SW] Triggering popup dialog to client')
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        action: 'triggerNotificationPopup',
      })
    })
  })
}
