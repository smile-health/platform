import { ErrorResponse } from '#types/common'
import { AxiosError } from 'axios'
import { UseFormSetError } from 'react-hook-form'

import { toast } from '#components/toast'
import { OrderRelocationCreateForm } from './order-create-relocation.types'

export const handleOrderRelocationErrors = (
  error: AxiosError,
  setError: UseFormSetError<OrderRelocationCreateForm>
) => {
  if (!(error instanceof AxiosError)) return

  let response = error.response?.data as ErrorResponse

  toast.danger({ description: response.message })

  const orderItemsErrors = response.errors?.order_items

  if (orderItemsErrors && typeof orderItemsErrors === 'object') {
    const combinedErrors: Record<number, string[]> = {}

    // Loop melalui setiap index di order_items (0, 1, dst.)
    for (const index in orderItemsErrors) {
      const fieldErrors = orderItemsErrors[index]

      if (typeof fieldErrors === 'object') {
        for (const fieldKey in fieldErrors) {
          const errorMessages = fieldErrors[fieldKey]

          if (Array.isArray(errorMessages)) {
            // Gabungkan error recommended_stock ke ordered_qty
            if (
              fieldKey === 'recommended_stock' ||
              fieldKey === 'ordered_qty'
            ) {
              combinedErrors[Number(index)] = [
                ...(combinedErrors[Number(index)] || []),
                ...errorMessages,
              ]
            } else {
              // Tangani error lain di dalam order_items
              setError(
                `order_items.${Number(index)}.value.${fieldKey}` as keyof OrderRelocationCreateForm,
                {
                  message: errorMessages as unknown as string,
                }
              )
            }
          }
        }
      }
    }

    // Set error ordered_qty setelah recommended_stock digabungkan
    for (const index in combinedErrors) {
      setError(
        `order_items.${Number(index)}.value.ordered_qty` as keyof OrderRelocationCreateForm,
        {
          message: combinedErrors[index] as unknown as string,
        }
      )
    }
  }

  // Tangani error lain di luar order_items
  if (response.errors) {
    Object.entries(response.errors).forEach(([key, errorValue]) => {
      if (key !== 'order_items') {
        setError(key as keyof OrderRelocationCreateForm, {
          message: (Array.isArray(errorValue)
            ? errorValue
            : [errorValue]) as unknown as string,
        })
      }
    })
  }
}
