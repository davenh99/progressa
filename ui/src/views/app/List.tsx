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
import { createVirtualizer } from "@tanstack/solid-virtual";
import { tv } from "tailwind-variants";
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
  loading?: boolean;
  emptyState?: JSXElement;
  loadingFallback?: JSXElement;
  searchPlaceholder?: string;
  renderRow?: (row: Row<T>, onRowClick: (item: T) => void) => JSXElement;
  showItemCount?: boolean;
  containerClass?: string;
}

const containerClass = tv({
  base: "overflow-y-auto relative flex-1",
});

export const DefaultRowRenderer = <T,>(props: {
  row: Row<T>;
  columns: Accessor<ColumnDef<T>[]>;
  onClick: (item: T) => void;
}): JSXElement => {
  return (
    <div
      class="flex items-center hover:bg-gray-700/50 cursor-pointer text-sm border-b border-gray-700 py-2"
      onClick={() => props.onClick(props.row.original)}
    >
      <For each={props.row.getVisibleCells()}>
        {(cell) => (
          <div class="flex-1 overflow-hidden truncate">
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </div>
        )}
      </For>
    </div>
  );
};

export const List = <T,>(props: ListProps<T>): JSXElement => {
  const [globalFilter, setGlobalFilter] = createSignal<string>();
  let parentRef!: HTMLDivElement;

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
  const dataExists = createMemo(() => props.data?.() || props.loading);
  const rows = createMemo(() => table.getRowModel().rows);

  const virtualizer = createVirtualizer({
    get count() {
      return rows().length;
    },
    getScrollElement: () => {
      return parentRef;
    },
    estimateSize: () => 41,
    get getItemKey() {
      return (index: number) => rows()[index].id;
    },
  });

  const virtualRows = createMemo(() => virtualizer.getVirtualItems());
  const totalSize = createMemo(() => virtualizer.getTotalSize());

  const containerStyle = createMemo(() => containerClass({ class: props.containerClass }));

  return (
    <div class="flex flex-col h-full max-h-[inherit]">
      <Show when={dataExists()} fallback={props.loadingFallback || <LoadFullScreen />}>
        <div class="pb-1 sticky top-0 bg-charcoal-500/95 backdrop-blur-xs pt-3">
          <div class="flex items-center space-x-2">
            <Show when={props.createFunc}>
              <Button
                class="flex text-sm items-center pl-1 pr-2"
                variant="solid"
                variantColor="good"
                onClick={props.createFunc}
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
              {props.loading && (
                <Loader size={16} class="absolute animate-spin top-1/2 transform -translate-y-1/2 right-2" />
              )}
            </div>
          </div>

          <Show when={props.headerActions}>{props.headerActions}</Show>

          <Show when={props.showItemCount}>
            <p class="text-xs italic">{rowCount()} items</p>
          </Show>
        </div>

        <div ref={parentRef} class={containerStyle()}>
          <Show
            when={rowCount() > 0}
            fallback={props.emptyState || <div class="text-center py-4">No results found.</div>}
          >
            <div
              class="w-full"
              style={{
                height: `${totalSize()}px`,
                position: "relative",
              }}
            >
              <For each={virtualRows()}>
                {(virtualRow) => {
                  const row = rows()[virtualRow.index];

                  return (
                    <div
                      data-index={virtualRow.index}
                      ref={(el) => queueMicrotask(() => virtualizer.measureElement(el))}
                      class="absolute w-full"
                      style={{ transform: `translateY(${virtualRow.start}px)` }}
                    >
                      <Show
                        when={props.renderRow}
                        fallback={
                          <DefaultRowRenderer row={row} columns={props.columns} onClick={props.onRowClick} />
                        }
                      >
                        {props.renderRow!(row, props.onRowClick)}
                      </Show>
                    </div>
                  );
                }}
              </For>
            </div>
          </Show>
        </div>
      </Show>
    </div>
  );
};

export default List;
