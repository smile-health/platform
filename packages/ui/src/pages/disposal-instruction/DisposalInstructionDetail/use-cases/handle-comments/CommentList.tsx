import { UserIcon } from '@heroicons/react/24/solid'
import { getFullName } from '#utils/strings'
import dayjs from 'dayjs'

import { useDisposalInstructionDetail } from '../../DisposalInstructionDetailContext'

export const CommentList = () => {
  const disposalInstructionDetail = useDisposalInstructionDetail()

  return (
    <div className="ui-space-y-4">
      {disposalInstructionDetail.data?.disposal_comments.map((comment) => (
        <div
          data-testid={`comment-item-${comment.id}`}
          className="ui-border ui-rounded ui-p-4 ui-flex ui-gap-2 ui-items-start"
        >
          <UserIcon className="ui-min-w-5 ui-w-5 ui-fill-gray-500 ui-mt-0.5" />
          <div className="ui-space-y-1">
            <div className="ui-flex ui-gap-1.5">
              <span className="ui-text-dark-blue ui-font-semibold ">
                {getFullName(comment.user?.firstname, comment.user?.lastname)}
              </span>
              <span className="ui-text-gray-500">
                {dayjs(comment.created_at)
                  .format('DD MMM YYYY HH:mm')
                  .toUpperCase()}{' '}
              </span>
            </div>
            <div className="ui-text-dark-blue ui-break-all">
              {comment.comment}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
