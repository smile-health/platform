import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { detailDisposal } from "../services/disposal-list"
import { useSetLoadingPopupStore } from "#hooks/useSetLoading"
import useSmileRouter from "#hooks/useSmileRouter"

export const useDisposalDetailPage = () => {
  const { t, i18n: { language } } = useTranslation(['common', 'disposalList'])
  const { query, push } = useSmileRouter()
  const {
    entity_id,
    material_id,
    batch_ids,
    expired_from,
    expired_to,
    activity_id
  } = query as Record<string, string>

  // Enhanced guard to prevent API call with undefined/'undefined'
  const isReady =
    !!entity_id &&
    !!material_id &&
    entity_id !== 'undefined' &&
    material_id !== 'undefined';

  const {
    data,
    isFetching,
  } = useQuery({
    queryKey: ['disposal-detail', entity_id, material_id, language],
    queryFn: () => {
      const params = {
        entity_id: Number(entity_id),
        material_id: Number(material_id),
        ...batch_ids && { batch_ids },
        ...expired_from && { expired_from },
        ...expired_to && { expired_to },
        ...activity_id && { activity_id: Number(activity_id) },
      }

      return detailDisposal(params)
    },
    enabled: isReady
  });

  const handleBack = () => push('/v5/stock-pemusnahan')

  useSetLoadingPopupStore(isFetching);

  return {
    t,
    data,
    handleBack,
  }
}