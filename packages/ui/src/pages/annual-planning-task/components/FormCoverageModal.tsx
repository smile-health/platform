import { Button } from '#components/button'
import { Checkbox } from '#components/checkbox'
import {
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '#components/dialog'
import { InputSearch } from '#components/input'
import { InputNumberV2 } from '#components/input-number-v2'
import { Table, Tbody, Td, Th, Thead, Tr } from '#components/table'
import { AmountOfGivingForm, CoverageForm } from '#types/task'
import { useTranslation } from 'react-i18next'

import useFormCoverage from '../hooks/useFormCoverage'

type FormCoverageModalProps = {
  open: boolean
  amountOfGiving: AmountOfGivingForm
  listProvince: { id: number; name: string }[]
  handleClose: () => void
  handleSave: (data: CoverageForm[]) => void
}

const isMoreThan100 = (value: number | null) => {
  if (!value) return false

  const valueNumber = value.toString().replace(/\./g, '')
  return Number(valueNumber) > 100
}

const isInvalidCoverage = (coverage: CoverageForm) => {
  if (!coverage.target && coverage.isActive) return true

  return isMoreThan100(coverage.target)
}

export default function FormCoverageModal({
  open,
  amountOfGiving,
  listProvince,
  handleClose,
  handleSave,
}: Readonly<FormCoverageModalProps>) {
  const { t } = useTranslation(['common', 'task'])
  const {
    isAllActive,
    coverages,
    keywordProvince,
    setKeywordProvince,
    onChangeQuantity,
    onChangeStatus,
    onChangeAllStatus,
  } = useFormCoverage({
    provinces: listProvince,
    defaultCoverages: amountOfGiving,
  })

  const onSave = () => {
    const filteredCoverages = coverages.filter((coverage) => coverage.isActive)
    const isTargetHasInvalidValue = filteredCoverages.some((coverage) => {
      return !coverage.target || isMoreThan100(coverage.target)
    })

    if (isTargetHasInvalidValue) return

    handleSave(filteredCoverages)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose} size="xl">
      <DialogCloseButton />
      <DialogHeader>
        <h3 className="ui-text-center ui-text-[20px] ui-font-semibold">
          {t('task:coverage.title')}
        </h3>
      </DialogHeader>
      <div className="ui-h-1 ui-border-t ui-border-neutral-300" />
      <DialogContent className="ui-overflow-auto ui-my-[8px] ui-px-0">
        <div>
          <div className="ui-grid ui-grid-cols-[1fr_2fr] ui-gap-6 ui-px-6">
            <div className="ui-space-y-1">
              <h4 className="ui-text-sm ui-leading-5 ui-text-neutral-500">
                {t('task:list.columns.group_target')}:
              </h4>
              <h5 className="ui-text-base ui-leading-5 ui-text-[#0C3045] ui-font-bold">
                {amountOfGiving.group_target.label}
              </h5>
            </div>
            <div className="ui-space-y-1">
              <h4 className="ui-text-sm ui-leading-5 ui-text-neutral-500">
                {t('task:list.columns.number_of_doses')}:
              </h4>
              <h5 className="ui-text-base ui-leading-5 ui-text-[#0C3045] ui-font-bold">
                {amountOfGiving.number_of_doses}
              </h5>
            </div>
          </div>
        </div>
        <div className="ui-mt-4 ui-border-t ui-border-neutral-300 ui-py-4 ui-px-6 ui-grid ui-grid-cols-[1fr_2fr] ui-gap-6 ui-items-center">
          <h5 className="ui-text-base ui-leading-5 ui-text-[#0C3045] ui-font-bold">
            {t('task:coverage.province.list')}
          </h5>
          <InputSearch
            placeholder={t('task:coverage.province.placeholder')}
            value={keywordProvince}
            onChange={(e) => setKeywordProvince(e.target.value)}
          />
        </div>
        <div className="ui-px-6 ui-pb-4 ui-border-b ui-border-neutral-300">
          <Table overflowXAuto withBorder>
            <Thead>
              <Th className="ui-w-8">
                <Checkbox
                  checked={isAllActive}
                  onChange={() => onChangeAllStatus()}
                />
              </Th>
              <Th className="ui-w-12">No.</Th>
              <Th className="ui-w-64">{t('task:coverage.province.name')}</Th>
              <Th className="ui-w-64">
                {t('task:list.columns.target_coverage')} (%)
              </Th>
            </Thead>
            <Tbody className="ui-bg-white ui-group ui-text-sm ui-font-normal">
              {coverages.map((coverage, index) => (
                <Tr
                  key={`transaction_remove_stock_input_batch_table_${index?.toString()}`}
                >
                  <Td>
                    <Checkbox
                      checked={coverage.isActive}
                      onChange={() => onChangeStatus(coverage.id)}
                    />
                  </Td>
                  <Td>{index + 1}</Td>
                  <Td>{coverage.province.label}</Td>
                  <Td>
                    <InputNumberV2
                      placeholder={t('task:form.coverage.placeholder')}
                      value={coverage.target ? coverage.target?.toString() : ''}
                      onChange={(event) =>
                        onChangeQuantity(coverage.id, event.target.value)
                      }
                      disabled={!coverage.isActive}
                    />
                    {isInvalidCoverage(coverage) && (
                      <p className="ui-text-red-500 ui-mt-1">
                        {t('task:form.coverage.target.invalid')}
                      </p>
                    )}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </div>
      </DialogContent>
      <DialogFooter>
        <Button
          variant="outline"
          onClick={handleClose}
          className="ui-w-full"
          type="button"
        >
          {t('common:cancel')}
        </Button>
        <Button onClick={onSave} className="ui-w-full">
          {t('common:submit')}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
