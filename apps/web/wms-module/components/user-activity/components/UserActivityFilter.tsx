import {
  FilterFormBody,
  FilterFormFooter,
  FilterFormRoot,
  FilterResetButton,
  FilterSubmitButton,
  useFilter,
} from '@repo/ui/components/filter';
import { Button } from '@repo/ui/components/button';
import Export from '@repo/ui/components/icons/Export';
import { useSetLoadingPopupStore } from '@repo/ui/hooks/useSetLoading';
import { useTranslation } from 'react-i18next';

import { handleFilter } from '../utils/helper';
import { useDownloadUserActivity } from '../hooks/useDownloadUserActivity';

type Props = Readonly<{
  filter: ReturnType<typeof useFilter>;
  onSearch?: VoidFunction;
  isDisabledExport?: boolean;
}>;

export default function UserActivityFilter({
  filter,
  onSearch,
  isDisabledExport = false,
}: Props) {
  const { t } = useTranslation();
  const { downloadUserActivity, isLoading } = useDownloadUserActivity();

  useSetLoadingPopupStore(isLoading);

  const handleExport = () => {
    const params = handleFilter({ ...filter.query });
    downloadUserActivity(params);
  };

  return (
    <FilterFormRoot onSubmit={filter.handleSubmit}>
      <FilterFormBody className="ui-grid ui-grid-cols-4 ui-gap-4">
        {filter.renderField()}
      </FilterFormBody>
      <FilterFormFooter>
        <div className="ui-flex ui-gap-2 ui-justify-end ui-ml-auto">
          <Button
            data-testid="btn-export"
            variant="subtle"
            type="button"
            disabled={isDisabledExport}
            onClick={handleExport}
            loading={isLoading}
            leftIcon={<Export className="ui-size-5" />}
          >
            {t('export')}
          </Button>
          <span className="ui-h-full ui-w-px ui-bg-neutral-300" />
          <FilterResetButton onClick={filter.reset} variant="subtle" />
          <FilterSubmitButton
            variant="outline"
            className="ui-w-[202px]"
            text={t('show_report')}
            onClick={onSearch}
          />
        </div>
      </FilterFormFooter>
      {filter.renderActiveFilter()}
    </FilterFormRoot>
  );
}
