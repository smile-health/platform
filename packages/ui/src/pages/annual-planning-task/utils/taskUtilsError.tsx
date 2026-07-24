import { ErrorResponse } from '#types/common'
import { AxiosError } from 'axios'
import { extractErrors } from '#utils/form'

export const getErrorMessage = (error: AxiosError) => {
  const response = error.response?.data as ErrorResponse

  const errorMessages = response.errors
    ? extractErrors(response.errors)
    : response.message

  return Array.isArray(errorMessages) ? (
    <ul className='ui-list-disc ui-ml-2'>
      {errorMessages.map((message) => (
        <li key={message}>{message}</li>
      ))}
    </ul>
  ) : errorMessages
}