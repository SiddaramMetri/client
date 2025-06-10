import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  statuses?: { label: string; value: string }[];
  priorities?: { label: string; value: string }[];
  AddButtonText?: string;
  AddButtonFun?: () => void;
  isAddButtonDisabled?: boolean;
  showAddButton?: boolean;
  searchColumn?: string;
  searchPlaceholder?: string;
  // Server-side pagination props
  pageCount?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (pageSize: number) => void;
  totalSize?: number;
  onTotalSizeChange?: (totalSize: number) => void;
  totalCount?: number;
  search: string;
  handleSearchChange: (value: string) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  statuses = [],
  priorities = [],
  AddButtonText = "Add",
  AddButtonFun = () => {},
  isAddButtonDisabled = false,
  showAddButton = false,
  searchColumn = "name",
  searchPlaceholder = "Search...",
  // Server-side pagination props
  pageCount,
  currentPage,
  onPageChange,
  pageSize: externalPageSize,
  onPageSizeChange,
  totalCount,
  search,
  handleSearchChange,
}: DataTableProps<TData, TValue>) {

  console.log("data =====", data);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);

  // Determine if server-side pagination is being used
  const isServerSide = Boolean(pageCount && currentPage !== undefined && onPageChange);
  const defaultPageSize = externalPageSize || 10;

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      ...(isServerSide && {
        pagination: {
          pageIndex: (currentPage || 1) - 1, // Convert 1-based to 0-based
          pageSize: defaultPageSize,
        },
      }),
    },
    initialState: {
      pagination: {
        pageSize: defaultPageSize,
        pageIndex: 0,
      },
    },
    pageCount: isServerSide ? pageCount : undefined,
    manualPagination: isServerSide,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: isServerSide 
      ? (updater) => {
          if (typeof updater === 'function') {
            const newPagination = updater({
              pageIndex: (currentPage || 1) - 1,
              pageSize: defaultPageSize,
            });
            onPageChange?.(newPagination.pageIndex + 1); // Convert back to 1-based
            onPageSizeChange?.(newPagination.pageSize);
          }
        }
      : undefined,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <div className="flex flex-col gap-4">
      <DataTableToolbar
        table={table}
        AddButtonText={AddButtonText}
        AddButtonFun={AddButtonFun}
        statuses={statuses}
        priorities={priorities ?? []}
        isAddButtonDisabled={isAddButtonDisabled}
        showAddButton={showAddButton}
        searchColumn={searchColumn}
        searchPlaceholder={searchPlaceholder}
        search={search}
        handleSearchChange={handleSearchChange}
      />
      <div className="rounded-md border overflow-x-auto">
        <div className="min-w-full inline-block align-middle">
          <div className="overflow-hidden">
            <Table>
              <TableHeader className="bg-muted sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead
                          key={header.id}
                          colSpan={header.colSpan}
                          className="whitespace-nowrap px-4 text-left text-sm"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className="whitespace-nowrap px-4 text-sm"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No results found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <DataTablePagination table={table} totalCount={totalCount} />
      </div>
    </div>
  );
}
