import React from "react"
import { Button } from "#components/button"
import { Trans, useTranslation } from "react-i18next"

type Notes = { [key: string]: string[] }

type Props = {
  notes: Notes | null
  handleSeeMore: (notes: Notes) => void
}

const EntityMaterialBulkColumnNotes: React.FC<Props> = ({ notes, handleSeeMore }) => {
  const { t } = useTranslation()
  const currentNotes = notes ? Object.entries(notes) : []
  const isNeedSeeMore =
    (currentNotes[0][1].length > 2 && currentNotes.length > 1) ||
    currentNotes[0][1].length > 2 ||
    currentNotes.length > 2


  return (
    <div className="ui-space-y-4">
      <div className="ui-space-y-5 ui-max-h-48 ui-overflow-y-auto">
        {currentNotes.map((x, i) => i < 1 && (
          <div key={`modal-import-error-${x[0]}`}>
            <p className="ui-text-dark-blue ui-text-sm ui-font-bold">
              <Trans i18nKey="modal_import_error.list.title">
                {{ row: x[0] }}
              </Trans>
            </p>
            {x[1].map((y, index) => index < 3 && <p key={`modal-import-error-${i}-${index}`} className="ui-text-dark-blue ui-text-sm ui-font-medium">{y}</p>)}
          </div>
        ))}
      </div>

      {isNeedSeeMore && (
        <Button
          size="sm"
          variant="subtle"
          type="button"
          className="ui-p-0 ui-font-bold"
          onClick={() => notes ? handleSeeMore(notes) : {}}
        >
          {t('see_more')}
        </Button>
      )}
    </div>
  )
}

export default EntityMaterialBulkColumnNotes