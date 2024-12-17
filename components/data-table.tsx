import React, { ButtonHTMLAttributes, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
  Column,
  ColumnDef,
} from "@tanstack/react-table";
import {
  ArrowDownUp,
  ChevronFirst,
  ChevronLeft,
  ChevronRight,
  ChevronLast,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { cn } from "@/lib/utils";

interface DataTableProps<TData extends object> {
  data: TData[];
  columns: ColumnDef<TData>[];
  paginate?: boolean;
}

function toggleSortState(Column: Column<any, any>) {
  if (Column.getIsSorted() == false) {
    Column.toggleSorting(true);
  } else if (Column.getIsSorted() == "asc") {
    Column.toggleSorting(undefined);
  } else {
    Column.toggleSorting(false);
  }
}

function DataTable<TData extends object>({
  data,
  columns,
  paginate = true,
}: DataTableProps<TData>) {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });

  const table = useReactTable({
    data,
    columns,
    state: {
      pagination,
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: paginate ? getPaginationRowModel() : undefined,
    onPaginationChange: setPagination,
  });

  const {
    getHeaderGroups,
    getRowModel,
    getState,
    previousPage,
    nextPage,
    setPageSize,
  } = table;
  const { pageSize, pageIndex } = getState().pagination;
  const numRows = data?.length ?? 0;

  return (
    <>
      <div className="relative w-full overflow-x-auto border rounded-md">
        <Table className="w-full table-auto border-collapse">
          <TableHeader>
            {getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="group px-2 py-1 md:py-3 text-left tracking-wide"
                  >
                    <div className="flex items-center justify-between">
                      <Button
                        className="bg-transparent text-black group-hover:bg-transparent h-12 align-middle text-neutral-500 [&:has([role=checkbox])]:pr-0 dark:text-neutral-400 text-left uppercase font-bold px-0 py-4"
                        onClick={() => toggleSortState(header.column)}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {header.column.getIsSorted() ? (
                          header.column.getIsSorted() === "desc" ? (
                            <SortDesc className="w-4 h-4 ml-2" />
                          ) : (
                            <SortAsc className="w-4 h-4 ml-2" />
                          )
                        ) : (
                          <ArrowDownUp className="w-4 h-4 opacity-0 group-hover:opacity-100 ml-2" />
                        )}
                      </Button>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="bg-white divide-y divide-gray-200">
            {getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className="px-2 py-4 text-sm md:text-base"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {paginate && numRows > 5 && (
        <div className="py-3 flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <PageButton
              className="w-[72px]"
              onClick={() => previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-5 w-5" />
            </PageButton>
            <PageButton
                className="w-[72px]"
              onClick={() => nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-5 w-5" />
            </PageButton>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div className="flex gap-x-2 items-baseline">
              <span className="">
                Page <span className="font-medium">{pageIndex + 1}</span> of{" "}
                <span className="font-medium">{table.getPageCount()}</span>
              </span>
              <label>
                <span className="sr-only">Items Per Page</span>
                <Select
                  value={pageSize.toString()}
                  onValueChange={(value) => setPageSize(Number(value))}
                >
                  <SelectTrigger className="w-[110px]">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 10, 20].map((size) => (
                      <SelectItem key={size} value={size.toString()}>
                        Show {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
            </div>
            <div>
              <nav className="relative z-0 inline-flex space-x-1">
                <PageButton
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronFirst className="h-5 w-5" />
                </PageButton>
                <PageButton
                  onClick={() => previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronLeft className="h-5 w-5" />
                </PageButton>
                <PageButton
                  onClick={() => nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronRight className="h-5 w-5" />
                </PageButton>
                <PageButton
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronLast className="h-5 w-5" />
                </PageButton>
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

type ButtonProps = {
  children: React.ReactNode;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

function PageButton({ children, className, ...rest }: ButtonProps) {
  return (
    <Button
      type="button"
      className={cn(
        "relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm text-black disabled:opacity-50 font-medium enabled:hover:bg-gray-50",
        className ?? "",
      )}
      {...rest}
    >
      {children}
    </Button>
  );
}

export default DataTable;
