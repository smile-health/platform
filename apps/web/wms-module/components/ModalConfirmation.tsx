import cx from '@/lib/cx';
import { Button } from '@repo/ui/components/button';
import {
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '@repo/ui/components/dialog';
import { Dispatch, ReactNode, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';

type ModalConfirmation = {
  open?: boolean;
  setOpen?: Dispatch<SetStateAction<boolean>>;
  onSubmit?: VoidFunction;
  onReject?: VoidFunction;
  title?: string;
  description: ReactNode;
  subDescription?: ReactNode;
  type?: 'delete' | 'update' | 'info' | 'dual-action';
  confirmText?: string;
  cancelText?: string;
  titleClassName?: string;
  contentClassName?: string;
  loadingReject?: boolean;
  loadingSubmit?: boolean;
};

export function ModalConfirmation({
  open,
  setOpen,
  onSubmit,
  onReject,
  title,
  description,
  subDescription,
  type = 'update',
  confirmText,
  cancelText,
  titleClassName,
  contentClassName,
  loadingReject,
  loadingSubmit,
}: Readonly<ModalConfirmation>) {
  const { t } = useTranslation();
  const handleClose = () => {
    setOpen?.(false);
  };

  const handleSubmit = () => {
    if (loadingSubmit) return;
    onSubmit?.();
  };

  const handleReject = () => {
    if (loadingReject) return;
    onReject?.();
  };

  return (
    <Dialog
      size="lg"
      open={open}
      onOpenChange={setOpen}
      className="ui-fixed ui-z-50"
      classNameOverlay="ui-fixed ui-z-50"
    >
      <DialogCloseButton />
      <DialogHeader className={cx('ui-text-center ui-text-xl', titleClassName)}>
        {title ?? t('confirmation')}
      </DialogHeader>
      <DialogContent
        className={cx('ui-space-y-4', contentClassName)}
        aria-describedby="dialog-description"
      >
        <p className="ui-text-center ui-text-neutral-500">{description}</p>
        {subDescription && (
          <p className="ui-text-center ui-text-dark-blue ui-font-medium">
            {subDescription}
          </p>
        )}
      </DialogContent>

      <DialogFooter className="ui-flex ui-justify-center ui-py-4">
        {type === 'info' && (
          <div className="ui-w-full">
            <Button
              id="btn-close-info-modal"
              type="button"
              variant="outline"
              className="ui-w-full"
              onClick={handleClose}
            >
              {cancelText ?? t('close')}
            </Button>
          </div>
        )}

        {type === 'dual-action' && (
          <div className="ui-grid ui-grid-cols-2 ui-gap-4 ui-w-full ui-mx-auto">
            <Button
              id="btn-reject-modal"
              type="button"
              variant="outline"
              className="ui-w-full"
              loading={loadingReject}
              onClick={handleReject}
            >
              {cancelText ?? t('reject')}
            </Button>
            <Button
              id="btn-accept-modal"
              type="button"
              color="primary"
              className="ui-w-full"
              loading={loadingSubmit}
              onClick={handleSubmit}
            >
              {confirmText ?? t('accept')}
            </Button>
          </div>
        )}

        {(type === 'update' || type === 'delete') && (
          <div className="ui-grid ui-grid-cols-2 ui-gap-4 ui-w-full ui-mx-auto">
            <Button
              id="btn-cancel-modal"
              type="button"
              variant={type === 'delete' ? 'solid' : 'outline'}
              color={type === 'delete' ? 'danger' : 'primary'}
              onClick={handleClose}
            >
              {cancelText ?? t('cancel')}
            </Button>
            <Button
              id="btn-confirm-modal"
              type="button"
              color={type === 'delete' ? 'success' : 'primary'}
              loading={loadingSubmit}
              onClick={handleSubmit}
            >
              {confirmText ?? t('yes')}
            </Button>
          </div>
        )}
      </DialogFooter>
    </Dialog>
  );
}
