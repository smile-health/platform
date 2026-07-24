import { CommonType } from '@/types/common';
import {
  FilterExpandButton,
  FilterFormBody,
  FilterFormFooter,
  FilterFormRoot,
  FilterResetButton,
  FilterSubmitButton,
  useFilter,
} from '@repo/ui/components/filter';

type Props = CommonType & {
  page: number;
  paginate: number;
  filter: ReturnType<typeof useFilter>;
  handleChangePage: (page: number) => void;
};

export default function NotificationFilter({
  filter,
  handleChangePage,
}: Props) {
  const handleReset = () => {
    handleChangePage(1);
    filter.reset();
  };

  const renderButtonFilter = () => {
    return (
      <div className="ui-w-full ui-flex ui-justify-end ui-gap-2">
        <FilterResetButton onClick={handleReset} variant="subtle" />
        <FilterSubmitButton
          onClick={() => handleChangePage(1)}
          className="ui-w-[202px]"
          variant="outline"
          data-testid="btn-filter-manufacturer"
        />
      </div>
    );
  };

  return (
    <FilterFormRoot onSubmit={filter.handleSubmit}>
      <FilterFormBody className="ui-grid-cols-4">
        {filter.renderField()}
      </FilterFormBody>
      <FilterFormFooter>{renderButtonFilter()}</FilterFormFooter>
      {filter.renderActiveFilter()}
    </FilterFormRoot>
  );
}
