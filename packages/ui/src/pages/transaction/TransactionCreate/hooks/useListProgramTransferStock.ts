import { useState } from 'react'
import { useFormContext } from 'react-hook-form'

import { CreateTransctionForm } from '../transaction-create.type'
import { useQuery } from '@tanstack/react-query'
import { listPrograms } from '../TransactionTransferStock/transaction-transfer-stock.services'

export default function useListProgramTransferStock() {
  const { watch, control, setValue } = useFormContext<CreateTransctionForm>()
  const { entity, destination_program_id, items } = watch()
  const [keyword, setKeyword] = useState<string>('')

  const {
    data,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['list-programs-transaction', entity, keyword],
    queryFn: () => listPrograms({entity_id : entity?.value, keyword}),
    refetchOnWindowFocus: false,
    enabled: !! entity?.value,
  })


  return {
    keyword,
    setKeyword,
    destination_program_id,
    setValue,
    control,
    data : entity?.value ? data : [],
    isLoading : isLoading || isFetching,
    items,
    entity
  }
}
