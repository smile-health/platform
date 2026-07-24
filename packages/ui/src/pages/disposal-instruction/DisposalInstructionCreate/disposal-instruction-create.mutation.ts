import { useMutation } from '@tanstack/react-query'
import { toast } from '#components/toast'
import useSmileRouter from '#hooks/useSmileRouter'
import { AxiosError } from 'axios'
import { useTranslation } from 'react-i18next'

import {
  createDisposalInstruction,
  CreateDisposalInstructionPayload,
} from './disposal-instruction-create.service'
import { DisposalInstructionCreateFormValues } from './disposal-instruction-create.type'

export const useDisposalInstructionCreateMutation = () => {
  const router = useSmileRouter()
  const { t } = useTranslation(['common', 'disposalInstructionCreate'])

  const mutation = useMutation({
    mutationKey: ['disposal-instruction-create'],
    mutationFn: (values: DisposalInstructionCreateFormValues.Root) => {
      const payload: CreateDisposalInstructionPayload.Root = {
        activity_id: values.activity?.value,
        customer_id: values.entity?.value,
        disposal_comments: values.disposal_comments,
        bast_no: values.bast_no!,
        instruction_type_id: values.instruction_type?.value,
        disposal_items:
          values.disposal_items?.map((disposalItem) => ({
            material_id: disposalItem.material?.id!,
            stocks: disposalItem.stocks
              .filter((stock) => {
                return stock.disposal_stocks?.some(
                  (disposalStock) =>
                    (disposalStock.discard_qty ??
                      disposalStock.received_qty ??
                      0) > 0
                )
              })
              .map(
                (stock): CreateDisposalInstructionPayload.Stock => ({
                  disposal_stocks:
                    stock.disposal_stocks
                      ?.filter(
                        (disposalStock) =>
                          (disposalStock.discard_qty ??
                            disposalStock.received_qty ??
                            0) > 0
                      )
                      ?.map(
                        (
                          disposalStock
                        ): CreateDisposalInstructionPayload.DisposalStock => ({
                          discard_qty: disposalStock.discard_qty ?? 0,
                          received_qty: disposalStock.received_qty ?? 0,
                          disposal_stock_id: disposalStock.disposal_stock_id!,
                          transaction_reasons: {
                            id: disposalStock.transaction_reasons?.id!,
                          },
                        })
                      ) ?? [],
                })
              ),
          })) ?? [],
      }

      return createDisposalInstruction(payload)
    },
    onSuccess: (response) => {
      toast.success({
        description: t('disposalInstructionCreate:api.create_success'),
      })
      router.push(`/v5/disposal-instruction/${response.id}`)
    },
    onError: (err: AxiosError) => {
      const { message, errors } = err.response?.data as { message: string, errors: {
    [key: string]: string[];
  } }
      const messageErrorBast = errors?.bast_no?.[0]
      if(messageErrorBast){
        toast.danger({ description: messageErrorBast })
        return
      }
      toast.danger({ description: message })
    },
  })

  return mutation
}
