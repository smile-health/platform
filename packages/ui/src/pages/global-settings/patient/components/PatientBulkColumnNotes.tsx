import React from 'react'
import { Button } from '#components/button'
import { Trans, useTranslation } from 'react-i18next'

type Notes = { [key: string]: string[] }

type Props = {
  notes: Notes | null
  handleSeeMore: (notes: Notes) => void
}

const PatientBulkColumnNotes: React.FC<Props> = ({ notes, handleSeeMore }) => {
  const { t } = useTranslation()
  const currentNotes = notes ? Object.entries(notes) : []
  const isNeedSeeMore =
    (currentNotes.length > 0 &&
      currentNotes[0][1].length > 2 &&
      currentNotes.length > 1) ||
    currentNotes[0][1].length > 2 ||
    currentNotes.length > 2

  return (
    <div className="ui-space-y-4">
      <div className="ui-space-y-5 ui-max-h-48 ui-overflow-y-auto">
        {currentNotes.slice(0, 1).map((note, i) => (
          <div key={`modal-import-error-${note[0]}`}>
            <p className="ui-text-dark-blue ui-text-sm ui-font-bold">
              <Trans i18nKey="modal_import_error.list.title">
                {{ row: note[0] }}
              </Trans>
            </p>
            {note[1].slice(0, 2).map((item, index) => (
              <p
                key={`modal-import-error-${i}-${index}`}
                className="ui-text-dark-blue ui-text-sm ui-font-medium"
              >
                {item}
              </p>
            ))}
          </div>
        ))}
      </div>

      {isNeedSeeMore && (
        <Button
          size="sm"
          variant="subtle"
          type="button"
          className="ui-p-0 ui-font-bold"
          onClick={() => (notes ? handleSeeMore(notes) : {})}
        >
          {t('see_more')}
        </Button>
      )}
    </div>
  )
}

export default PatientBulkColumnNotes
