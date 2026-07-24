import { useTranslation } from "react-i18next"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { formSchemaPopulationCorrection } from "../annual-planning-process.schemas"
import { FormPopulationCorrectionDataForm, FormPopulationCorrectionForm, ListPopulationTargetHealthCare } from "../annual-planning-process.types"
import { useContext, useEffect, useRef, useState } from "react"
import { AnnualPlanningProcessCreateContext } from "../context/ContextProvider"
import { PreviewPopulationCorrectionHandle } from "../components/PreviewPopulationCorrection"

export const useFormPopulationCorrectionDistrict = () => {
  const { t, i18n: { language } } = useTranslation(['annualPlanningProcess', 'common'])
  const refPreview = useRef<PreviewPopulationCorrectionHandle>(null)
  const {
    parentForm,
    updateForm,
    isRevision,
  } = useContext(AnnualPlanningProcessCreateContext)
  const [dataSelected, setDataSelected] = useState<{
    index: number | null,
    data: FormPopulationCorrectionForm | null
  }>({ index: null, data: null })

  const methods = useForm<FormPopulationCorrectionDataForm>({
    resolver: yupResolver(formSchemaPopulationCorrection(t)),
    mode: 'onChange',
    defaultValues: {
      data: parentForm?.population_correction ?? []
    },
  })

  const {
    watch,
    formState: { isValid },
    setValue,
  } = methods
  const data = watch('data')

  useEffect(() => {
    if (data.length === 0) {
      setValue('data', parentForm?.population_correction ?? [], { shouldValidate: true })
    }
  }, [parentForm?.population_correction])

  const onClickRow = (index: number, data: ListPopulationTargetHealthCare) => {
    setDataSelected({ index, data })
  }

  const handleClose = () => setDataSelected({ index: null, data: null })

  const handleNextStep = () => updateForm('population_correction', data)

  return {
    t,
    language,
    refPreview,
    isRevision,
    dataSelected,
    setValue,
    data,
    methods,
    isValid,
    onClickRow,
    handleClose,
    handleNextStep,
  }
}