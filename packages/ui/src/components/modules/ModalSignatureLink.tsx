'use client'

import { Dispatch, SetStateAction, useEffect, useState } from 'react'
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
import { Input } from '#components/input'
import ChainIcon from '#components/icons/ChainIcon'
import { useTranslation } from 'react-i18next'

export type SignaturePayload = {
  signature_url: string
  name: string
  position: string
  program: string
}

type ModalSignatureLinkProps = Readonly<{
  open?: boolean
  setOpen?: Dispatch<SetStateAction<boolean>>
  onSubmit?: (data: SignaturePayload) => void
  handleClose?: () => void
  isLoading?: boolean
  defaultValues?: Partial<SignaturePayload>
  /**
   * When true, hides position and program fields.
   * Use this for kako users — only name and signature link will be shown.
   */
  hideProgram?: boolean
  requireProgramAndPosition?: boolean
}>

const IMAGE_URL_REGEX = /\.(jpg|jpeg|png|bmp|webp)(\?.*)?$/i
const GOOGLE_DRIVE_URL_REGEX = /^(https?:\/\/)?(www\.)?(drive\.google\.com\/file\/d\/[A-Za-z0-9_-]+\/(view|preview)(\?.*)?|drive\.google\.com\/open\?id=[A-Za-z0-9_-]+(\&.*)?|drive\.google\.com\/uc\?export=download&id=[A-Za-z0-9_-]+(\&.*)?)$/i


const isValidSignatureLink = (value: string) => {
  const trimmedValue = value.trim()
  return IMAGE_URL_REGEX.test(trimmedValue) || GOOGLE_DRIVE_URL_REGEX.test(trimmedValue)
}

async function checkUrlAccessible(url: string): Promise<boolean> {
  try {
    await fetch(url, { method: 'HEAD', mode: 'no-cors' })
    return true
  } catch {
    return false
  }
}

export function ModalSignatureLink({
  open = false,
  setOpen,
  onSubmit,
  handleClose,
  isLoading = false,
  defaultValues,
  hideProgram = false,
  requireProgramAndPosition = false,
}: ModalSignatureLinkProps) {
  const { t } = useTranslation(['bmhpApproval', 'common'])
  const [signatureLink, setSignatureLink] = useState('')
  const [name, setName] = useState('')
  const [position, setPosition] = useState('')
  const [program, setProgram] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [checkingUrl, setCheckingUrl] = useState(false)

  useEffect(() => {
    if (open) {
      setSignatureLink(defaultValues?.signature_url ?? '')
      setName(defaultValues?.name ?? '')
      setPosition(defaultValues?.position ?? '')
      setProgram(defaultValues?.program ?? '')
      setErrors({})
    }
  }, [open])

  const handleSave = async () => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = t('common:required', { defaultValue: 'Required' })
    }
    if (requireProgramAndPosition && !program.trim()) {
      newErrors.program = t('common:required', { defaultValue: 'Required' })
    }
    if (requireProgramAndPosition && !position.trim()) {
      newErrors.position = t('common:required', { defaultValue: 'Required' })
    }

    if (!signatureLink.trim()) {
      newErrors.signatureLink = t('common:required', { defaultValue: 'Required' })
    } else if (!isValidSignatureLink(signatureLink)) {
      newErrors.signatureLink = t('bmhpApproval:statement_letter.signature_link_image_error', {
        defaultValue: 'Signature link must be a valid image URL (jpg, jpeg, png, webp)',
      })
    } else {
      setCheckingUrl(true)
      const accessible = await checkUrlAccessible(signatureLink.trim())
      setCheckingUrl(false)
      if (!accessible) {
        newErrors.signatureLink = t('bmhpApproval:statement_letter.signature_link_image_error', {
        defaultValue: 'Signature link must be a valid image URL (jpg, jpeg, png, webp)',        })
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit?.({
      signature_url: signatureLink.trim(),
      name: name.trim(),
      position: position.trim(),
      program: program.trim(),
    })
    handleOpenChange(false)
  }

  const handleOpenChange = (flag: boolean) => {
    setErrors({})
    setSignatureLink('')
    setName('')
    setPosition('')
    setProgram('')
    setOpen?.(flag)
    if (!flag) handleClose?.()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogCloseButton />

      <DialogHeader className="ui-text-center ui-text-xl">
        {t('bmhpApproval:button.add_signature_link')}
      </DialogHeader>

      <DialogContent className="ui-space-y-4">
        {/* Name — always visible */}
        <FormControl>
          <FormLabel htmlFor="signatureNameInput" required>
            {t('bmhpApproval:statement_letter.name_label', {
              defaultValue: 'Name',
            })}
          </FormLabel>
          <Input
            id="signatureNameInput"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (errors.name) setErrors({ ...errors, name: '' })
            }}
            placeholder={t(
              'bmhpApproval:statement_letter.name_placeholder',
              { defaultValue: 'Input Name' }
            )}
            error={!!errors.name}
          />
          {errors.name && <FormErrorMessage>{errors.name}</FormErrorMessage>}
        </FormControl>

        {/* Program — hidden when hideProgram=true (kako) */}
        {!hideProgram && (
          <FormControl>
            <FormLabel htmlFor="signatureProgramInput" required={requireProgramAndPosition}>
              {t('bmhpApproval:statement_letter.program_label', {
                defaultValue: 'Program',
              })}
            </FormLabel>
            <Input
              id="signatureProgramInput"
              value={program}
              onChange={(e) => {
                setProgram(e.target.value)
                if (errors.program) setErrors({ ...errors, program: '' })
              }}
              placeholder={t(
                'bmhpApproval:statement_letter.program_placeholder',
                { defaultValue: 'Input Program' }
              )}
              error={!!errors.program}
            />
            {errors.program && <FormErrorMessage>{errors.program}</FormErrorMessage>}
          </FormControl>
        )}

        {/* Position — hidden when hideProgram=true (kako) */}
        {!hideProgram && (
          <FormControl>
            <FormLabel htmlFor="signaturePositionInput">
              {t('bmhpApproval:statement_letter.position_label', {
                defaultValue: 'Position',
              })}
            </FormLabel>
            <Input
              id="signaturePositionInput"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder={t(
                'bmhpApproval:statement_letter.position_placeholder',
                { defaultValue: 'Input Position' }
              )}
            />
          </FormControl>
        )}

        {/* Signature Link — always visible */}
        <FormControl>
          <FormLabel htmlFor="signatureLinkInput" required>
            {t('bmhpApproval:statement_letter.signature_link_label', {
              defaultValue: 'Signature Link',
            })}
          </FormLabel>
          <Input
            id="signatureLinkInput"
            type="url"
            value={signatureLink}
            onChange={(e) => {
              setSignatureLink(e.target.value)
              if (errors.signatureLink) setErrors({ ...errors, signatureLink: '' })
            }}
            placeholder={t(
              'bmhpApproval:statement_letter.signature_link_placeholder',
              { defaultValue: 'Input link of Signature' }
            )}
            leftIcon={<ChainIcon />}
            error={!!errors.signatureLink}
          />
          {errors.signatureLink && <FormErrorMessage>{errors.signatureLink}</FormErrorMessage>}
        </FormControl>
      </DialogContent>

      <DialogFooter className="ui-justify-center">
        <div className="ui-grid ui-grid-cols-2 ui-gap-4 ui-w-9/12 mx-auto">
          <Button
            id="btn-cancel-signature-link"
            variant="default"
            onClick={() => handleOpenChange(false)}
          >
            {t('common:cancel')}
          </Button>
          <Button
            id="btn-save-signature-link"
            loading={isLoading || checkingUrl}
            disabled={isLoading || checkingUrl}
            onClick={handleSave}
          >
            {t('common:save')}
          </Button>
        </div>
      </DialogFooter>
    </Dialog>
  )
}
