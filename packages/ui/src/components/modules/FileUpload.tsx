import React, { ChangeEvent, ChangeEventHandler, useState } from 'react'
import { Button } from '#components/button'
import { toast } from '#components/toast'
import cx from '#lib/cx'
import { useTranslation } from 'react-i18next'

type Props = {
  onChange?: ChangeEventHandler<HTMLInputElement>
  accept?: string
  maxSize?: number
  id?: string
}

const FileUpload: React.FC<Props> = ({
  onChange,
  accept = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  maxSize,
  id,
}) => {
  const { t } = useTranslation('common')
  const [fileName, setFileName] = useState(t('file.placeholder'))

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.size > maxSize! * 1024 * 1024) {
      toast.danger({ description: t('file.file_size', { size: maxSize }) })
      return
    }
    if (file && !accept?.split(',').includes(file.type)) {
      toast.danger({
        description: t('file.cannot_file_type'),
      })
      return
    }
    setFileName(file ? file.name : t('file.placeholder'))
    onChange?.(event)
  }

  return (
    <div className="ui-flex ui-flex-col ui-gap-[10px]">
      <input
        type="file"
        id={id || 'fileUpload'}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        accept={accept}
      />
      <div className="ui-flex">
        <Button
          asChild
          className={cx(
            'ui-border ui-border-gray-300 ui-rounded-e-none ui-cursor-pointer ui-m-0 ui-text-sm ui-text-neutral-500 ui-bg-gray-100 hover:!ui-bg-gray-100'
          )}
          variant="subtle"
        >
          <label htmlFor="fileUpload">{t('file.title')}</label>
        </Button>
        <Button
          asChild
          className="ui-border-r-[1px] ui-border-y-[1px] ui-rounded-s-none ui-border-gray-300 ui-flex-grow ui-cursor-pointer ui-m-0 ui-text-sm ui-text-neutral-500 ui-justify-start hover:!ui-bg-white"
          variant="subtle"
        >
          <label htmlFor="fileUpload">{fileName}</label>
        </Button>
      </div>
    </div>
  )
}

export default FileUpload
