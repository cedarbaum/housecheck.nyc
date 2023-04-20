import React, { ButtonHTMLAttributes, useMemo } from "react";
import {
  useTable,
  useSortBy,
  usePagination,
  Column,
  Cell,
  Row,
} from "react-table";
import "tailwindcss/tailwind.css";
import { classNames } from "@/utils/Styling";
import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/20/solid";

interface TableProps<TData extends object> {
  data: TData[];
  columns: Column<TData>[];
  paginate?: boolean;
}

function Table<TData extends object>({
  data,
  columns,
  paginate,
}: TableProps<TData>) {
  const {
    //Core
    rows,
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,

    // Pagination
    // @ts-ignore
    canPreviousPage,
    // @ts-ignore
    page,
    // @ts-ignore
    canNextPage,
    // @ts-ignore
    pageOptions,
    // @ts-ignore
    pageCount,
    // @ts-ignore
    gotoPage,
    // @ts-ignore
    nextPage,
    // @ts-ignore
    previousPage,
    // @ts-ignore
    setPageSize,

    // @ts-ignore
    state,
  } = useTable(
    {
      columns,
      data,
      initialState: { pageSize: paginate ? 5 : Number.MAX_SAFE_INTEGER } as any,
    },
    useSortBy,
    usePagination
  );

  return (
    <>
      <div className="relative w-full overflow-x-auto border">
        <table
          {...getTableProps()}
          className="w-full table-auto border-collapse"
        >
          <thead>
            {headerGroups.map((headerGroup, rowIdx) => (
              <tr {...headerGroup.getHeaderGroupProps()} key={rowIdx}>
                {headerGroup.headers.map((column, colIdx) => (
                  <th
                    scope="col"
                    className="group px-2 py-1 md:py-3 text-left uppercase tracking-wider text-sm md:text-base"
                    {
                      // @ts-ignore
                      ...column.getHeaderProps(column.getSortByToggleProps())
                    }
                    key={colIdx}
                  >
                    <div className="flex items-center justify-between">
                      {column.render("Header")}
                      {/* Add a sort direction indicator */}
                      <span>
                        {
                          /* @ts-ignore */
                          column.isSorted ? (
                            /* @ts-ignore */
                            column.isSortedDesc ? (
                              <SortDownIcon className="w-4 h-4" />
                            ) : (
                              <SortUpIcon className="w-4 h-4" />
                            )
                          ) : (
                            <SortIcon className="w-4 h-4 opacity-0 group-hover:opacity-100" />
                          )
                        }
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody
            {...getTableBodyProps()}
            className="bg-white divide-y divide-gray-200"
          >
            {page.map((row: Row<TData>, rowIdx: number) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()} key={rowIdx}>
                  {row.cells.map((cell: Cell<TData>, cellIdx: number) => {
                    return (
                      <td
                        {...cell.getCellProps()}
                        key={cellIdx}
                        className="px-2 py-4 text-sm md:text-base"
                        role="cell"
                      >
                        {
                          // @ts-ignore
                          cell.column.Cell.name === "defaultRenderer" ? (
                            <div>{cell.render("Cell")}</div>
                          ) : (
                            cell.render("Cell")
                          )
                        }
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      {paginate && rows.length > 5 && (
        <div className="py-3 flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button onClick={() => previousPage()} disabled={!canPreviousPage}>
              Previous
            </Button>
            <Button onClick={() => nextPage()} disabled={!canNextPage}>
              Next
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div className="flex gap-x-2 items-baseline">
              <span className="">
                Page{" "}
                <span className="font-medium">
                  {(state as any).pageIndex + 1}
                </span>{" "}
                of <span className="font-medium">{pageOptions.length}</span>
              </span>
              <label>
                <span className="sr-only">Items Per Page</span>
                <select
                  className="mt-1 block w-full border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-white"
                  value={(state as any).pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                  }}
                >
                  {[5, 10, 20].map((pageSize) => (
                    <option key={pageSize} value={pageSize}>
                      Show {pageSize}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex -space-x-px"
                aria-label="Pagination"
              >
                <PageButton
                  onClick={() => gotoPage(0)}
                  disabled={!canPreviousPage}
                >
                  <span className="sr-only">First</span>
                  <ChevronDoubleLeftIcon
                    className="h-5 w-5"
                    aria-hidden="true"
                  />
                </PageButton>
                <PageButton
                  onClick={() => previousPage()}
                  disabled={!canPreviousPage}
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                </PageButton>
                <PageButton onClick={() => nextPage()} disabled={!canNextPage}>
                  <span className="sr-only">Next</span>
                  <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                </PageButton>
                <PageButton
                  onClick={() => gotoPage(pageCount - 1)}
                  disabled={!canNextPage}
                >
                  <span className="sr-only">Last</span>
                  <ChevronDoubleRightIcon
                    className="h-5 w-5"
                    aria-hidden="true"
                  />
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

function Button({ children, className, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      className={classNames(
        "relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm text-black disabled:opacity-50 font-medium bg-white enabled:hover:bg-gray-50",
        className ?? ""
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

function PageButton({ children, className, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      className={classNames(
        "relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm text-black disabled:opacity-50 font-medium enabled:hover:bg-gray-50",
        className ?? ""
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

function SortIcon({ className }: { className: string }) {
  return (
    <svg
      className={className}
      stroke="currentColor"
      fill="currentColor"
      strokeWidth="0"
      viewBox="0 0 320 512"
      height="1em"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M41 288h238c21.4 0 32.1 25.9 17 41L177 448c-9.4 9.4-24.6 9.4-33.9 0L24 329c-15.1-15.1-4.4-41 17-41zm255-105L177 64c-9.4-9.4-24.6-9.4-33.9 0L24 183c-15.1 15.1-4.4 41 17 41h238c21.4 0 32.1-25.9 17-41z"></path>
    </svg>
  );
}

function SortUpIcon({ className }: { className: string }) {
  return (
    <svg
      className={className}
      stroke="currentColor"
      fill="currentColor"
      strokeWidth="0"
      viewBox="0 0 320 512"
      height="1em"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M279 224H41c-21.4 0-32.1-25.9-17-41L143 64c9.4-9.4 24.6-9.4 33.9 0l119 119c15.2 15.1 4.5 41-16.9 41z"></path>
    </svg>
  );
}

function SortDownIcon({ className }: { className: string }) {
  return (
    <svg
      className={className}
      stroke="currentColor"
      fill="currentColor"
      strokeWidth="0"
      viewBox="0 0 320 512"
      height="1em"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M41 288h238c21.4 0 32.1 25.9 17 41L177 448c-9.4 9.4-24.6 9.4-33.9 0L24 329c-15.1-15.1-4.4-41 17-41z"></path>
    </svg>
  );
}

export default Table;
