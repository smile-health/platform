'use client'

import { Dispatch, SetStateAction } from 'react'
import { Button } from '#components/button'
import {
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '#components/dialog'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import FileUpload from '#components/modules/FileUpload'
import { OptionType, ReactSelect } from '#components/react-select'
import { useTranslation } from 'react-i18next'

import { generatedYearOptions } from '../../../program-plan/form/libs/program-plan-form.common'
import { ImportPopulationValues } from '../constants/population.type'
import useFileUpload from '../hooks/useFileUpload'
import useImportPopulation from '../hooks/useImportPopulation'

type ModalImportProps = Readonly<{
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  accept?: string
  maxSize?: number
  yearsActive: number[]
}>

export function ModalImportPopulation({
  open = false,
  setOpen,
  accept,
  maxSize,
  yearsActive,
}: ModalImportProps) {
  const { t } = useTranslation(['common', 'population'])
  const {
    errorFile,
    importFile,
    reset: resetFile,
    handleChangeFile,
    setErrorFile,
  } = useFileUpload()
  const {
    register,
    setValue,
    handleSubmit,
    reset,
    errors,
    setError,
    handleImport,
  } = useImportPopulation()

  const validateFile = () => {
    if (!importFile) setErrorFile(t('population:import.form.file.error'))
  }

  const handleSubmitForm = (data: ImportPopulationValues) => {
    if (!importFile) return

    const formData = new FormData()
    formData.append('file', importFile, importFile?.name)

    handleImport(
      { year: data.year_plan, data: formData },
      { onSuccess: handleClose }
    )
  }

  const handleClose = () => {
    resetFile()
    reset()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault()

          validateFile()
          handleSubmit(handleSubmitForm)(e)
        }}
      >
        <DialogCloseButton />
        <DialogHeader className="ui-text-center ui-text-xl">
          {t('common:import')}
        </DialogHeader>
        <DialogContent className="ui-overflow-visible">
          <FormControl>
            <FormLabel htmlFor="year_plan" required>
              {t('population:import.form.year.label')}
            </FormLabel>
            <ReactSelect
              {...register('year_plan')}
              id="year_plan"
              isClearable
              onChange={(value: OptionType) => {
                setValue('year_plan', value?.value)
                setError('year_plan', { message: '' })
              }}
              options={generatedYearOptions(yearsActive, t)}
              placeholder={t('population:import.form.year.placeholder')}
              error={!!errors?.year_plan?.message}
            />
            <FormErrorMessage>{errors?.year_plan?.message}</FormErrorMessage>
          </FormControl>
          <FormControl className="ui-mt-4">
            <FormLabel htmlFor="fileinput" required>
              {t('common:attach_file')}
            </FormLabel>
            <FileUpload
              accept={accept}
              onChange={handleChangeFile}
              maxSize={maxSize}
            />
            <FormErrorMessage>{errorFile}</FormErrorMessage>
          </FormControl>
        </DialogContent>
        <DialogFooter className="ui-justify-center">
          <div className="ui-grid ui-grid-cols-2 ui-gap-4 ui-w-9/12 mx-auto">
            <Button
              id="btn-close-modal-import"
              type="button"
              variant="default"
              onClick={handleClose}
            >
              {t('common:cancel')}
            </Button>
            <Button id="btn-submit-modal-import" type="submit">
              {t('common:import')}
            </Button>
          </div>
        </DialogFooter>
      </form>
    </Dialog>
  )
}
