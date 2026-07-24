import { useContext, useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { transformDataCentral } from "../annual-planning-process.utils";
import { useInformationPopulationTarget } from "./useInformationPopulationTarget";
import { AnnualPlanningProcessCreateContext } from "../context/ContextProvider";
import { FormPopulationCorrectionForm } from "../annual-planning-process.types";
import { useDataGroupTarget } from "../store/group-target.store";

type Data = { name: string;[key: string]: number | string }[]
export const useFormPopulationCorrection = () => {
  const { t } = useTranslation('annualPlanningProcess')
  const {
    userTag,
    parentForm,
  } = useContext(AnnualPlanningProcessCreateContext)
  const { central_population } = useInformationPopulationTarget()
  const { group_target } = useDataGroupTarget()
  const [data, setData] = useState<Data>([])

  const initData = () => {
    const defaultData: Data = [
      {
        name: 'Pusdatin',
        ...transformDataCentral(central_population.population_data, group_target)[0]
      },
      {
        name: t('create.form.adjustment'),
        ...transformDataCentral(central_population.population_data, group_target, 0)[0]
      }
    ]

    parentForm.population_correction?.forEach(item => {
      item.data?.forEach(subItem => {
        if (
          subItem.key &&
          typeof defaultData[1][subItem.key] === 'number' &&
          subItem.change_qty !== null &&
          subItem.change_qty !== undefined
        ) {
          defaultData[1][subItem.key] = (defaultData[1][subItem.key] as number) + subItem.change_qty
        }
      })
    })

    setData(defaultData)
  }

  const calculateData = (population: FormPopulationCorrectionForm[]) => {
    const newData = [...data]

    if (newData[1]) {
      for (const key in newData[1]) {
        const value = newData[1][key];
        newData[1][key] = typeof value === "number" ? 0 : value;
      }
      population?.forEach(item => {
        item.data?.forEach(subItem => {
          if (
            subItem.key &&
            typeof newData[1][subItem.key] === 'number' &&
            subItem.change_qty !== null &&
            subItem.change_qty !== undefined
          ) {
            newData[1][subItem.key] = (newData[1][subItem.key] as number) + subItem.change_qty
          }
        })
      })
      setData(newData)
    }
  }

  useEffect(() => {
    if (
      (parentForm.population_correction &&
        parentForm.population_correction.length > 0) ||
      (central_population.population_data &&
        central_population.population_data.length > 0)
    ) {
      initData()
    }
  }, [central_population, group_target, parentForm.population_correction])

  useEffect(() => {
    if (parentForm.population_correction && parentForm.population_correction.length > 0) {
      calculateData(parentForm.population_correction)
    }
  }, [parentForm.population_correction])

  const contextValue = useMemo(() => ({
    data,
    calculateData,
  }), [data, calculateData])

  return {
    contextValue,
    userTag,
  }
}
