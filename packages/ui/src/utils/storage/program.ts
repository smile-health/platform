import { TProgramPoc } from '#constants/program'
import axios from '#lib/axios'
import { TProgram } from '#types/program'

const STORAGE_NAME = {
  PROGRAM: `${process.env.STORAGE_PREFIX}PROGRAM`,
}

export const setProgramStorage = (data: TProgram | TProgramPoc) => {
  axios.defaults.headers.common['x-program-id'] = data.id
  sessionStorage.setItem(STORAGE_NAME.PROGRAM, JSON.stringify(data))
}

export const getProgramStorage = (): TProgram => {
  const response = sessionStorage.getItem(STORAGE_NAME.PROGRAM) ?? '{}'
  return JSON.parse(response)
}

export const removeProgramStorage = () => {
  delete axios.defaults.headers.common['x-program-id']
  sessionStorage.removeItem(STORAGE_NAME.PROGRAM)
}
