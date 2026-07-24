import { useCallback, useEffect, useMemo, useState } from 'react'
import { AmountOfGivingForm, CoverageForm } from '#types/task'

type Props = {
  provinces: { id: number; name: string }[]
  defaultCoverages: AmountOfGivingForm
}

const DEFAULT_COVERAGE = 100

export default function useFormCoverage({
  provinces,
  defaultCoverages,
}: Props) {
  const [keywordProvince, setKeywordProvince] = useState('')
  const [listCoverage, setListCoverage] = useState<CoverageForm[]>([])

  const filteredCoverages = useMemo(() => {
    return listCoverage.filter((coverage) => {
      return coverage.province.label
        .toLowerCase()
        .includes(keywordProvince.toLowerCase())
    })
  }, [listCoverage, keywordProvince])

  const handleChangeQuantity = (id: number, target: string) => {
    setListCoverage((prev) =>
      prev.map((coverage) =>
        coverage.id === id ? { ...coverage, target: Number(target) } : coverage
      )
    )
  }

  const handleChangeStatus = (id: number) => {
    setListCoverage((prev) =>
      prev.map((coverage) =>
        coverage.id === id
          ? {
              ...coverage,
              isActive: !coverage.isActive,
              target: coverage.isActive ? null : DEFAULT_COVERAGE,
            }
          : coverage
      )
    )
  }

  const isAllActive = useMemo(() => {
    return listCoverage.every((coverage) => coverage.isActive)
  }, [listCoverage])

  const handleChangeAllStatus = useCallback(() => {
    setListCoverage((prev) =>
      prev.map((coverage) => ({
        ...coverage,
        target: !isAllActive ? DEFAULT_COVERAGE : null,
        isActive: !isAllActive,
      }))
    )
  }, [isAllActive])

  const generateDefaultCoverages = () => {
    const getProvinceCoverage = (provinceId: number) => {
      return defaultCoverages.target_coverage.find(
        (item) => item.province_id === provinceId
      )
    }

    const list: CoverageForm[] = provinces.map((province) => ({
      id: province.id,
      province: {
        label: province.name,
        value: province.id,
      },
      isActive: Boolean(getProvinceCoverage(province.id)),
      target: getProvinceCoverage(province.id)?.coverage_number || null,
    }))

    setListCoverage(list)
  }

  useEffect(() => {
    generateDefaultCoverages()
  }, [provinces, defaultCoverages])

  return {
    isAllActive,
    coverages: filteredCoverages,
    keywordProvince,
    setKeywordProvince,
    onChangeQuantity: handleChangeQuantity,
    onChangeStatus: handleChangeStatus,
    onChangeAllStatus: handleChangeAllStatus,
  }
}
