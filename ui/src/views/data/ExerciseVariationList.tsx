import { Accessor, Component, createMemo, createSignal, For, onMount, Show } from "solid-js";
import { ColumnDef, createSolidTable, flexRender, getCoreRowModel } from "@tanstack/solid-table";

import { useAuthPB } from "../../config/pocketbase";
import { ExerciseVariation } from "../../../Types";
import Loading from "../Loading";

interface Props {
  onClick: (variation: ExerciseVariation) => void;
  variations: Accessor<ExerciseVariation[]>;
}

export const ExerciseVariationList: Component<Props> = (props) => {
  const { pb } = useAuthPB();

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
    <div class="bg-base-100 rounded-lg shadow p-6">
      <div class="overflow-x-auto">
        <table class="table w-full">
          <thead>
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
      </div>
      {props.variations.length === 0 && <div class="text-center py-4">No Variations found</div>}
    </div>
  );
};
