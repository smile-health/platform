import { Button } from '@repo/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '@repo/ui/components/dialog';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

type Props = Readonly<{
  open?: boolean;
  setOpen?: (open: boolean) => void;
  title?: string;
  description?: string;
  children?: ReactNode;
}>;

export default function TooltipModal({
  open,
  setOpen,
  title,
  description,
  children,
}: Props) {
  const { t } = useTranslation('common');

  return (
    <Dialog open={open} onOpenChange={setOpen} size="lg">
      <DialogHeader className="ui-text-center">{title}</DialogHeader>
      <DialogContent className="ui-space-y-3">
        <p>{description}</p>
        {children}
      </DialogContent>
      <DialogFooter className="ui-grid ui-grid-cols-1 ui-mb-6">
        <Button variant="outline" onClick={() => setOpen?.(!open)}>
          {t('close')}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
