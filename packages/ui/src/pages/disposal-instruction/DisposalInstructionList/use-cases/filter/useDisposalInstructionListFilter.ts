import { useFilter } from '#components/filter'

import { DisposalInstructionListFilterValues } from '../../disposal-instruction-list.type'
import useDisposalInstructionFilterSchema from './useDisposalInstructionListFilter.schema'

const useDisposalInstructionListFilter = () => {
  const schema = useDisposalInstructionFilterSchema()
  const filter = useFilter(schema)
  return {
    ...filter,
    query: filter.query as DisposalInstructionListFilterValues,
  }
}

export default useDisposalInstructionListFilter
