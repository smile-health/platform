import useWmsRouter from '@/utils/hooks/useWmsRouter';
import { Button } from '@repo/ui/components/button';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

type Action = 'detail' | 'edit' | 'activation';
type ButtonActionTableProps = {
  path: string;
  id?: string | number;
  hidden?: Array<Action> | Array<string>;
  isActive?: boolean;
  onActivationClick?: VoidFunction;
  isLoadingActivation?: boolean;
};

export function ButtonActionTable({
  id,
  path,
  hidden,
  isActive,
  onActivationClick,
  isLoadingActivation,
}: Readonly<ButtonActionTableProps>) {
  const { t } = useTranslation();
  const router = useWmsRouter();

  const isShow = (action: Action) => {
    return !hidden?.includes(action);
  };

  const getMainLink = () => {
    return router.getAsLink(`${path}/${id}`);
  };

  return (
    <div className="ui-flex ui-gap-0.5 ui-items-center">
      {isShow('detail') && (
        <Button
          asChild
          data-testid="btn-link-detail"
          size="sm"
          variant="subtle"
          className="ui-px-1.5 ui-text-[#0069D2]"
        >
          <Link href={getMainLink()}>Detail</Link>
        </Button>
      )}
      {isShow('edit') && (
        <Button
          asChild
          data-testid="btn-link-edit"
          size="sm"
          variant="subtle"
          className="ui-px-1.5 ui-text-[#0069D2]"
        >
          <Link href={`${getMainLink()}/edit`}>{t('edit')}</Link>
        </Button>
      )}
      {isShow('activation') && (
        <Button
          data-testid="btn-activation"
          size="sm"
          variant="subtle"
          color={isActive ? 'danger' : 'success'}
          disabled={isLoadingActivation}
          onClick={onActivationClick}
          className="ui-px-1.5"
        >
          {isActive ? t('status.deactivate') : t('status.activate')}
        </Button>
      )}
    </div>
  );
}
