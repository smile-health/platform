import { useEffect, useState } from 'react'
import dayjs from 'dayjs'

type TicketingSystemDiffTimeProps = {
  startDate: string
  endDate: string
}

export default function TicketingSystemDiffTime({
  startDate,
  endDate,
}: Readonly<TicketingSystemDiffTimeProps>) {
  const [since, setSince] = useState<string | null>(null)

  useEffect(() => {
    const now = dayjs(endDate)
    const start = dayjs(startDate)

    let totalSeconds = now.diff(start, 'second')

    const hours = Math.floor(totalSeconds / 3600)
    totalSeconds %= 3600
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60

    setSince(
      `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    )
  }, [startDate, endDate])

  return <>{since}</>
}
