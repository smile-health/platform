import { useFeatureValue } from "@growthbook/growthbook-react"
import { useQuery } from "@tanstack/react-query"
import { listProtocol } from "../pages/protocol/protocol.service"
import { getProgramStorage } from "#utils/storage/program"
import { useMemo } from "react"

const pagination = {
  page: 1,
  paginate: 10,
}
export const useTransactionBeneficiaryConfigFlag = () => {
  const program = getProgramStorage()

  const programId = useMemo(() => {
    return program.id
  }, [program])

  const {
    data,
  } = useQuery({
    queryKey: ['protocols-navbar'],
    queryFn: () => listProtocol(pagination),
    select: (data) => {
      return data.data
    },
    enabled: !!programId,
  })

  const configBeneficiaryConsumption = useFeatureValue('transaction.beneficiary_consumption', {
    "global_protocol": false,
    "protocol": false,
    "material_activity_patient": false
  })

  const isContainProtocol = data && data.length > 0

  return {
    showFieldProtocol: configBeneficiaryConsumption.global_protocol,
    showMenuProtocol: configBeneficiaryConsumption.protocol && isContainProtocol,
    showMaterialActivityPatient: configBeneficiaryConsumption.material_activity_patient,
  }
}