import { TOperatorThirdparty } from '@/types/partnership-operator';
import useWmsRouter from '@/utils/hooks/useWmsRouter';
import { setUserOperatorStorage } from '@/utils/storage/user-operator';
import { Button } from '@repo/ui/components/button';
import { useTranslation } from 'react-i18next';

type ButtonActionTableProps = {
  data: TOperatorThirdparty;
};

export function ButtonActionTableEdit({
  data,
}: Readonly<ButtonActionTableProps>) {
  const { t } = useTranslation();
  const router = useWmsRouter();
  const url = router.getAsLink('user-operator/edit');

  return (
    <Button
      data-testid="btn-link-edit"
      size="sm"
      variant="subtle"
      className="ui-px-1.5 ui-text-[#0069D2]"
      type="button"
      onClick={() => {
        setUserOperatorStorage(data);
        router.push(url);
      }}
    >
      {t('edit')}
    </Button>
  );
}
