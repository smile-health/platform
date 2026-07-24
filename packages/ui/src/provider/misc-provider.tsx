import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ProgramEnum } from '#constants/program'
import { listActivities } from '#services/activity'
import { syncRoutineActivity } from '#utils/api'
import { getProgramStorage } from '#utils/storage/program'

export default function MiscProvider({
  children,
}: {
  readonly children: React.ReactNode
}) {
  const program = getProgramStorage()

  useQuery({
    queryKey: ['routine-activity', program.id],
    queryFn: () =>
      listActivities({
        page: 1,
        paginate: 10,
        code: 'rutin',
        program_id: program.id,
      }),
    enabled: Boolean(program.id) && program?.key === ProgramEnum.Immunization,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    const unsubscribe = syncRoutineActivity()

    return unsubscribe
  }, [])

  return <>{children}</>
}
