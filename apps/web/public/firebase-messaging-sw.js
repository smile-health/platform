importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: 'AIzaSyBU7Kv5lSHhVd-emcIgwVUQrN5bo3ZPNo8',
  authDomain: 'smile-platform.firebaseapp.com',
  projectId: 'smile-platform',
  messagingSenderId: '39330161703',
  appId: '1:39330161703:web:097f935a8dbfa219c41a02',
})

const messaging = firebase.messaging()

const processedMessages = new Set()

messaging.onBackgroundMessage(function (payload) {
  const messageId = payload.messageId || payload.data?.messageId || Date.now().toString()
  // console.log(`[firebase-messaging-sw.js] Received background message (ID: ${messageId})`, payload)

  if (processedMessages.has(messageId)) {
    console.log(`[firebase-messaging-sw.js] Message already processed (ID: ${messageId}). Skipping.`)
    return
  }

  processedMessages.add(messageId)
  // console.log(`[firebase-messaging-sw.js] Processing message (ID: ${messageId})`)

  self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
    let lang = 'id'

    if (clients.length > 0) {
      const activeClient = clients[0]
      const url = new URL(activeClient.url)
      const pathSegments = url.pathname.split('/').filter((segment) => segment)

      lang = pathSegments[0] || 'id'
      // console.log('Active page lang:', lang)
    } else {
      console.log('No active clients found. Using def ault lang:', lang)
    }
    const title = payload.data.title?.split(',')?.[0] || payload.notification.title?.split(',')?.[0] || 'Title Default'
    const body = payload.data.body?.split(',')?.[0] || payload.notification.body?.split(',')?.[0] || 'Default body'
    const icon = payload.data.icon?.split(',')?.[0] || payload.notification.icon?.split(',')?.[0] || '/default-icon.png'
    const url =
      payload.data.url?.split(',')?.[0] || payload.notification.url?.split(',')?.[0] || `/${lang}/v5/notification`

    const notificationOptions = {
      body: body,
      icon: icon,
      data: {
        url: url,
      },
    }

    // Tampilkan notifikasi kustom
    // console.log(`[firebase-messaging-sw.js] Showing notification: ${title}`)
    self.registration.showNotification(title, notificationOptions)
  })
})

self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked')
  event.notification.close()

  const urlToOpen = event.notification.data.url

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          console.log('[firebase-messaging-sw.js] Focusing existing tab:', urlToOpen)
          return client.focus()
        }
      }

      if (self.clients.openWindow) {
        console.log('[firebase-messaging-sw.js] Opening new tab:', urlToOpen)
        return self.clients.openWindow(urlToOpen)
      }
    })
  )
})
