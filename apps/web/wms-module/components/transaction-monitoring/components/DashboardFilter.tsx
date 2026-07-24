import { Button } from '@repo/ui/components/button';
import {
  FilterFormBody,
  FilterFormFooter,
  FilterFormRoot,
  FilterResetButton,
  FilterSubmitButton,
  useFilter,
} from '@repo/ui/components/filter';
import Export from '@repo/ui/components/icons/Export';
import { useTranslation } from 'react-i18next';

type Props = Readonly<{
  filter: ReturnType<typeof useFilter>;
  onSubmit?: VoidFunction;
  filteredTime?: {
    label: string;
    value: string;
  };
  isValidatingRequiredField?: boolean;
  isUseDisabledExport?: boolean;
  isDisabledSubmit?: boolean;
  onExport?: VoidFunction;
  isLoadingExport?: boolean;
}>;

export default function DashboardFilter(props: Props) {
  const {
    filter,
    onSubmit,
    filteredTime,
    isValidatingRequiredField,
    isDisabledSubmit,
    onExport,
    isLoadingExport,
  } = props;
  const { t } = useTranslation();

  const isDisabled = !filter?.formState?.isValid && isValidatingRequiredField;

  return (
    <FilterFormRoot onSubmit={filter.handleSubmit}>
      <FilterFormBody className="ui-grid-cols-4">
        {filter.renderField()}
      </FilterFormBody>
      <FilterFormFooter>
        <div className="ui-flex ui-gap-2 ui-justify-end ui-ml-auto">
          <Button
            data-testid="btn-export"
            variant="subtle"
            type="button"
            onClick={onExport}
            loading={isLoadingExport}
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
            onClick={onSubmit}
            disabled={isDisabledSubmit || isDisabled}
          />
        </div>
      </FilterFormFooter>
      {filter.renderActiveFilter({ filteredTime })}
    </FilterFormRoot>
  );
}
