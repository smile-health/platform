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

export type PopupImportType =
  | 'non_hierarchy'
  | 'trademark'
  | 'material_active_substance_and_strength'
  | 'model_asset_cce_with_pqs'
  | 'model_asset_cce_without_pqs'
  | 'model_asset_non_cce'
  | undefined

type ModalImportProps = Readonly<{
  isGlobal?: boolean
  open?: boolean
  setOpen?: Dispatch<SetStateAction<boolean>>
  onSubmit?: (file: FormData) => void
  handleClose?: () => void
  popupImportType?: PopupImportType
  accept?: string
  description?: ReactNode
  maxSize?: number
}>
export function ModalImport({
  isGlobal,
  open = false,
  setOpen,
  onSubmit,
  handleClose,
  popupImportType,
  accept,
  description,
  maxSize,
}: ModalImportProps) {
  const { t } = useTranslation(['common', 'material'])
  const [importFile, setImportFile] = useState<File | null>(null)
  const [error, setError] = useState('')

  const handlePopupTitle = () => {
    const defaultPrefix = t('common:import')
    if (popupImportType) {
      switch (popupImportType) {
        case 'non_hierarchy':
          return `${defaultPrefix} ${t('material:button.non_hierarchy')}`
        case 'material_active_substance_and_strength':
          return `${defaultPrefix} ${t('material:button.material_active_substance_and_strength')}`
        case 'trademark':
          return `${defaultPrefix} ${t('material:button.trademark')}`
        default:
          return defaultPrefix
      }
    }
    return defaultPrefix
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e?.target?.files?.[0]) {
      setImportFile(e?.target?.files?.[0])
    }
  }

  const handleFileUpload = useCallback(() => {
    const formData = new FormData()

    if (importFile) {
      formData.append('file', importFile, importFile?.name)

      if (popupImportType) {
        const importLevel =
          popupImportType === 'material_active_substance_and_strength' ? 2 : 3

        if (isGlobal) {
          const importHierarchy = popupImportType === 'non_hierarchy' ? 0 : 1
          formData.append('is_hierarchy', importHierarchy.toString())
        }

        formData.append('material_level_id', importLevel.toString())
      }
      onSubmit?.(formData)
      setOpen?.(!open)
      setImportFile(null)
      handleClose?.()
    } else setError('Required')
  }, [onSubmit, importFile, setOpen, open])

  const handleOpenChange = (flag: boolean) => {
    setError('')
    setOpen?.(flag)
    setImportFile(null)
    handleClose?.()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogCloseButton />
      <DialogHeader className="ui-text-center ui-text-xl">
        {handlePopupTitle()}
      </DialogHeader>
      <DialogContent>
        <FormControl>
          <FormLabel htmlFor="fileinput" required>
            {t('common:attach_file')}
          </FormLabel>
          <FileUpload
            accept={accept}
            onChange={handleImport}
            maxSize={maxSize}
          />
          {description && (
            <p className="ui-text-sm ui-text-neutral-500">{description}</p>
          )}
          {error && <FormErrorMessage>{error}</FormErrorMessage>}
        </FormControl>
      </DialogContent>
      <DialogFooter className="ui-justify-center">
        <div className="ui-grid ui-grid-cols-2 ui-gap-4 ui-w-9/12 mx-auto">
          <Button
            id="btn-close-modal-import"
            variant="default"
            onClick={() => {
              setOpen?.(!open)
              handleClose?.()
              setImportFile(null)
            }}
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
