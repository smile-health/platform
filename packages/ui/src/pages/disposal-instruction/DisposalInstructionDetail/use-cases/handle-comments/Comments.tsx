import { DisposalInstructionBox } from '#pages/disposal-instruction/components/DisposalInstructionBox'
import { useTranslation } from 'react-i18next'

import { useDisposalInstructionDetail } from '../../DisposalInstructionDetailContext'
import { CommentForm } from './CommentForm'
import { CommentList } from './CommentList'
import { CommentSkeleton } from './CommentSkeleton'

export const Comments = () => {
  const { t } = useTranslation(['disposalInstructionDetail'])

  const disposalInstructionDetail = useDisposalInstructionDetail()

  return (
    <DisposalInstructionBox
      title={t('disposalInstructionDetail:section.comment.title')}
      enableShowHide
    >
      <CommentForm />

      {!disposalInstructionDetail.data ? <CommentSkeleton /> : <CommentList />}
    </DisposalInstructionBox>
  )
}
