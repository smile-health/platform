import { useEffect, useRef, useState } from 'react'
import dayjs from 'dayjs'

type CallbackFunction = () => void

type UseInterval = (callback: CallbackFunction, delay: number | null) => void

const useInterval: UseInterval = (callback, delay) => {
  const savedCallback = useRef<CallbackFunction>()

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    function tick() {
      if (savedCallback.current) {
        savedCallback.current()
      }
    }
    if (delay !== null) {
      const id = setInterval(tick, delay)
      return () => clearInterval(id)
    }
  }, [delay])
}

type TicketingSystemReversedCountdownProps = {
  startDate: string
}

export default function TicketingSystemReversedCountdown({
  startDate,
}: Readonly<TicketingSystemReversedCountdownProps>) {
  const [since, setSince] = useState<string | null>(null)

  useInterval(() => {
    const now = dayjs()
    const start = dayjs(startDate)

    let totalSeconds = now.diff(start, 'second')

    const hours = Math.floor(totalSeconds / 3600)
    totalSeconds %= 3600
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60

    setSince(
      `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    )
  }, 1000)

  return <>{since}</>
}
