import { Button } from '#components/button'
import { FormControl, FormErrorMessage } from '#components/form-control'
import { TextArea } from '#components/text-area'
import { Form } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useComment } from './useComment'

export const CommentForm = () => {
  const { t, i18n } = useTranslation(['disposalInstructionDetail'])

  const comment = useComment()

  return (
    <Form control={comment.form.methods.control} className="ui-flex ui-gap-2">
      <FormControl className="ui-space-y-0 ui-w-full">
        <TextArea
          {...comment.form.methods.register('comment')}
          placeholder={t(
            'disposalInstructionDetail:form.field.comment.placeholder'
          )}
          className="ui-min-h-[80px] ui-text-sm"
          disabled={comment.form.isLoading}
          error={Boolean(comment.form.errors.comment?.message)}
        />
        {comment.form.errors.comment?.message && (
          <FormErrorMessage>
            {comment.form.errors.comment?.message}
          </FormErrorMessage>
        )}
      </FormControl>
      <Button
        type="submit"
        variant="outline"
        size="sm"
        className="ui-min-w-[150px]"
        disabled={
          comment.form.isLoading || !comment.form.methods.watch('comment')
        }
        onClick={comment.form.submit}
      >
        {t('button.submit_comment')}
      </Button>
    </Form>
  )
}
