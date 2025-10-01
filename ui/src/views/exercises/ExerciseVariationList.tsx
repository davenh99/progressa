import { Accessor, Component, createMemo, For, Show } from "solid-js";
import { ColumnDef, createSolidTable, flexRender, getCoreRowModel } from "@tanstack/solid-table";

import { ExerciseVariation } from "../../../Types";

interface Props {
  onClick: (variation: ExerciseVariation) => void;
  variations: Accessor<ExerciseVariation[]>;
}

export const ExerciseVariationList: Component<Props> = (props) => {
  const columns = createMemo<ColumnDef<ExerciseVariation>[]>(() => [
    {
      accessorKey: "name",
      header: "Variation",
    },
    {
      accessorKey: "description",
      header: "Description",
    },
  ]);

  const table = createSolidTable({
    get data() {
      return props.variations();
    },
    columns: columns(),
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div class="mt-2 flex-1 overflow-y-auto max-h-[35vh]">
      <table class="w-full">
        <thead class="sticky top-0 bg-charcoal-500">
          <For each={table.getHeaderGroups()}>
            {(headerGroup) => (
              <tr>
                <For each={headerGroup.headers}>
                  {(header) => <th>{flexRender(header.column.columnDef.header, header.getContext())}</th>}
                </For>
              </tr>
            )}
          </For>
        </thead>
        <tbody>
          <For each={table.getRowModel().rows}>
            {(row) => (
              <tr class="hover" onClick={() => props.onClick(row.original)}>
                <For each={row.getVisibleCells()}>
                  {(cell) => <td>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>}
                </For>
              </tr>
            )}
          </For>
        </tbody>
      </table>
      <Show when={props.variations().length === 0}>
        <div class="text-center py-4">No Variations found</div>
      </Show>
    </div>
  );
};
