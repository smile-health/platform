'use client'

import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useState,
} from 'react'
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
import { useTranslation } from 'react-i18next'

import FileUpload from './FileUpload'

export type ImportType =
  | 'non_hierarchy'
  | 'trademark'
  | 'material_active_substance_and_strength'
  | 'model_asset_cce_with_pqs'
  | 'model_asset_cce_without_pqs'
  | 'model_asset_non_cce'
  | 'model_asset_warehouse'
  | 'asset_type_cce'
  | 'asset_type_warehouse'

export type PopupImportData = {
  type: ImportType
  templateType?: number
  data: {
    id: string
    params: {
      [key: string]: string | number | undefined
    }
    accept?: string
    description?: ReactNode
    header?: ReactNode
  }
}

type ModalImportV2Props = Readonly<{
  open?: boolean
  setOpen?: Dispatch<SetStateAction<PopupImportData | undefined>>
  onSubmit?: (file: FormData) => void
  handleClose?: () => void
  popupImportData?: PopupImportData

  maxSize?: number
}>
export function ModalImportV2({
  open = false,
  setOpen,
  onSubmit,
  handleClose,
  popupImportData,
  maxSize,
}: ModalImportV2Props) {
  const { t } = useTranslation(['common', 'material'])
  const [importFile, setImportFile] = useState<File | null>(null)
  const [error, setError] = useState('')

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e?.target?.files?.[0]) {
      setImportFile(e?.target?.files?.[0])
    }
  }

  const handleFileUpload = useCallback(() => {
    const formData = new FormData()

    if (importFile) {
      formData.append('file', importFile, importFile?.name)
      if (Object.keys(popupImportData?.data?.params || {}).length) {
        Object.entries(popupImportData?.data?.params || {}).forEach(
          ([key, value]) => {
            if (value !== undefined) {
              formData.append(key, value.toString())
            }
          }
        )
      }
      onSubmit?.(formData)
      setOpen?.(undefined)
      setImportFile(null)
    } else setError('Required')
  }, [onSubmit, importFile, setOpen, open])

  const handleOpenChange = () => {
    setError('')
    setOpen?.(undefined)
    setImportFile(null)
    handleClose?.()
  }

  const handleCloseModal = () => {
    setOpen?.(undefined)
    handleClose?.()
    setImportFile(null)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogCloseButton />
      <DialogHeader className="ui-text-center ui-text-xl">
        {popupImportData?.data?.header}
      </DialogHeader>
      <DialogContent>
        <FormControl>
          <FormLabel htmlFor="fileinput" required>
            {t('common:attach_file')}
          </FormLabel>
          <FileUpload
            accept={popupImportData?.data?.accept}
            onChange={handleImport}
            maxSize={maxSize}
          />
          {popupImportData?.data?.description && (
            <p className="ui-text-sm ui-text-neutral-500">
              {popupImportData?.data?.description}
            </p>
          )}
          {error && <FormErrorMessage>{error}</FormErrorMessage>}
        </FormControl>
      </DialogContent>
      <DialogFooter className="ui-justify-center">
        <div className="ui-grid ui-grid-cols-2 ui-gap-4 ui-w-9/12 mx-auto">
          <Button
            id="btn-close-modal-import"
            variant="default"
            onClick={() => handleCloseModal()}
          >
            {t('common:cancel')}
          </Button>
          <Button
            id="btn-submit-modal-import"
            onClick={handleFileUpload}
            disabled={!importFile}
          >
            {t('common:import')}
          </Button>
        </div>
      </DialogFooter>
    </Dialog>
  )
}
