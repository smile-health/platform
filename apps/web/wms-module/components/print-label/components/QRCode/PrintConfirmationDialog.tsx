'use client';
import { Button } from '@repo/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '@repo/ui/components/dialog';
import React from 'react';
import { useTranslation } from 'react-i18next';

type PrintConfirmationModalProps = {
  open: boolean;
  isLoading: boolean;
  onClose: () => void;
  onPrint: () => void;
};
export const PrintConfirmationModal: React.FC<PrintConfirmationModalProps> = ({
  open,
  isLoading,
  onClose,
  onPrint,
}) => {
  const { t } = useTranslation(['printLabel', 'common']);

  return (
    <Dialog open={open} onOpenChange={onClose} size="md">
      <DialogHeader className="ui-text-center ui-text-xl ui-pt-3">
        <p className="text-gray-500">{t('printLabel:modal.confirmation')}</p>
      </DialogHeader>

      <DialogContent className="ui-flex ui-text-center">
        <p className="ui-w-full ui-px-8">{t('printLabel:modal.description')}</p>
      </DialogContent>

      <DialogFooter className="ui-flex ui-justify-between ui-items-center ui-pt-3 ui-mb-4">
        <Button
          id="btn-back"
          type="button"
          variant="outline"
          onClick={() => onClose()}
          className="ui-w-full"
        >
          {t('common:back')}
        </Button>
        <Button
          id="btn-submit"
          type="submit"
          onClick={() => onPrint()}
          className="ui-w-full"
          loading={isLoading}
        >
          {t('common:save')}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};
