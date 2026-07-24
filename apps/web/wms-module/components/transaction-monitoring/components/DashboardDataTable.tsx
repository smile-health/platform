import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@repo/ui/components/data-table';
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '@repo/ui/components/pagination';

export type DashboardTableProps<Value> = Readonly<{
  data: Value[];
  columns: ColumnDef<any>[];
  page: number;
  paginate: number;
  totalItem?: number;
  totalPage?: number;
  onChangePage: (page: number) => void;
  onChangePaginate: (page: number) => void;
  listPagination?: number[];
  isLoading?: boolean;
}>;

export default function DashboardDataTable<Value>({
  data,
  page,
  columns,
  paginate,
  totalItem,
  totalPage = 1,
  onChangePage,
  onChangePaginate,
  listPagination,
  isLoading,
}: DashboardTableProps<Value>) {
  return (
    <div className="ui-space-y-4">
      <DataTable data={data} columns={columns} isLoading={isLoading} />
      <PaginationContainer>
        <PaginationSelectLimit
          size={paginate}
          onChange={onChangePaginate}
          perPagesOptions={listPagination}
        />
        <PaginationInfo size={paginate} currentPage={page} total={totalItem} />
        <Pagination
          totalPages={totalPage || 1}
          currentPage={page}
          onPageChange={onChangePage}
        />
      </PaginationContainer>
    </div>
  );
}
