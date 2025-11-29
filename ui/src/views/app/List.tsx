import {
  ColumnDef,
  ColumnFiltersState,
  createSolidTable,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  Row,
} from "@tanstack/solid-table";
import { Accessor, For, JSXElement, Show, createMemo, createSignal } from "solid-js";
import Loader from "lucide-solid/icons/loader";
import Plus from "lucide-solid/icons/plus";

import LoadFullScreen from "./LoadFullScreen";
import { Button, Input } from "../../components";

interface ListProps<T> {
  data?: Accessor<T[]>;
  filters?: Accessor<ColumnFiltersState>;
  createFunc?: () => Promise<void>; // if not set, don't show 'new' button
  headerActions?: JSXElement;
  columns: Accessor<ColumnDef<T>[]>;
  onRowClick: (item: T) => void;
  loading: Accessor<boolean>;
  emptyState?: JSXElement;
  loadingFallback?: JSXElement;
  searchPlaceholder?: string;
  renderBody?: (rows: Row<T>[], onRowClick: (item: T) => void) => JSXElement;
  showItemCount?: boolean;
}

interface TableBodyProps<T> {
  rows: Row<T>[];
  onRowClick: (item: T) => void;
}

const DefaultTableBody = <T,>(props: TableBodyProps<T>): JSXElement => {
  return (
    <table class="table w-full">
      <tbody>
        <For each={props.rows}>
          {(row) => (
            <tr class="hover text-sm" onClick={() => props.onRowClick(row.original)}>
              <For each={row.getVisibleCells()}>
                {(cell) => <td class="p-1">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>}
              </For>
            </tr>
          )}
        </For>
      </tbody>
    </table>
  );
};

export const List = <T,>(props: ListProps<T>): JSXElement => {
  const [globalFilter, setGlobalFilter] = createSignal<string>();

  const table = createSolidTable({
    get data() {
      return props.data?.() || [];
    },
    columns: props.columns(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      get globalFilter() {
        return globalFilter();
      },
      get columnFilters() {
        return props.filters?.();
      },
    },
  });

  const rowCount = createMemo(() => table.getRowModel().rows.length);
  const dataExists = createMemo(() => (props.data && props.data.length > 0) || props.loading);
  const rows = createMemo(() => table.getRowModel().rows);

  return (
    <Show when={dataExists()} fallback={props.loadingFallback || <LoadFullScreen />}>
      <div class="pb-1 sticky top-0 bg-charcoal-500/95 backdrop-blur-xs pt-3">
        <div class="flex items-center space-x-2">
          <Show when={props.createFunc}>
            <Button
              class="flex text-sm items-center pl-1 pr-2"
              variant="solid"
              variantColor="good"
              onClick={() => {}}
            >
              <Plus size={20} />
              New
            </Button>
          </Show>

          <div class="w-full relative">
            <Input
              noPadding
              class="w-full"
              value={globalFilter()}
              onChange={setGlobalFilter}
              inputProps={{ placeholder: props.searchPlaceholder ?? "Search", class: "p-1" }}
            />
            {props.loading() && (
              <Loader size={16} class="absolute animate-spin top-1/2 transform -translate-y-1/2 right-2" />
            )}
          </div>
        </div>

        <div class="flex items-center space-x-2 mt-2 mb-1">{props.headerActions}</div>

        <Show when={props.showItemCount}>
          <p class="text-xs italic">{rowCount()} items found.</p>
        </Show>
      </div>

      <div class="overflow-y-auto">
        <Show
          when={rowCount() > 0}
          fallback={props.emptyState || <div class="text-center py-4">No results found.</div>}
        >
          {props.renderBody ? (
            props.renderBody(rows(), props.onRowClick)
          ) : (
            <DefaultTableBody<T> rows={rows()} onRowClick={props.onRowClick} />
          )}
        </Show>
      </div>
    </Show>
  );
};

export default List;
