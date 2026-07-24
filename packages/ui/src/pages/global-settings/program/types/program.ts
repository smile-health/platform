export type ProgramForm = {
  key: string
  name: string
  description: string
  config: {
    color: string
    material: {
      is_hierarchy_enabled: boolean
    }
  }
  protocol_ids: number[]
}

export type ListProgramsParams = {
  page: string | number
  paginate: string | number
  keyword?: string
  is_hierarchy_enabled?: number
}

export type UpdateProgramsStatusBody = {
  status: number
}
