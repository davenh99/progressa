import { Component, createMemo, createSignal, For, onMount, Show } from "solid-js";
import { ColumnDef, createSolidTable, flexRender, getCoreRowModel } from "@tanstack/solid-table";
import Ellipsis from "lucide-solid/icons/ellipsis";

import { useAuthPB } from "../../config/pocketbase";
import { Exercise } from "../../../Types";
import Loading from "../Loading";

interface Props {
  onclick: (exercise: Exercise) => void;
}

export const ExerciseList: Component<Props> = (props) => {
  const [exercises, setExercises] = createSignal<Exercise[]>();
  const { pb } = useAuthPB();

  const columns = createMemo<ColumnDef<Exercise>[]>(() => [
    {
      accessorKey: "name",
      header: "Exercise",
    },
    {
      header: "",
      id: "more-info",
      cell: () => <Ellipsis />,
    },
  ]);

  const table = createSolidTable({
    get data() {
      return exercises();
    },
    columns: columns(),
    getCoreRowModel: getCoreRowModel(),
  });

  const getData = async () => {
    try {
      const exercises = await pb.collection<Exercise>("exercises").getFullList({ expand: "measurementType" });

      // console.log(exercises);
      setExercises(exercises);
    } catch (e) {
      console.log("get exercises error: ", e);
    }
  };

  onMount(() => {
    getData();
  });

  return (
    <Show when={!!exercises()} fallback={<Loading />}>
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
                  <tr class="hover" onclick={() => props.onclick(row.original)}>
                    <For each={row.getVisibleCells()}>
                      {(cell) => <td>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>}
                    </For>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>
        {exercises().length === 0 && <div class="text-center py-4">No Exercises found</div>}
      </div>
    </Show>
  );
};
