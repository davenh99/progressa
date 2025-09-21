import { Component, createMemo, createSignal, For, onMount, Show } from "solid-js";
import {
  ColumnDef,
  createSolidTable,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
} from "@tanstack/solid-table";
import ArrowRight from "lucide-solid/icons/arrow-right";

import { useAuthPB } from "../../config/pocketbase";
import { Exercise } from "../../../Types";
import Loading from "../Loading";
import { Input } from "../../components";

interface Props {
  onClick: (exercise: Exercise) => void;
}

export const ExerciseList: Component<Props> = (props) => {
  const [exercises, setExercises] = createSignal<Exercise[]>([]);
  const [nameFilter, setNameFilter] = createSignal<string>("");
  const { pb } = useAuthPB();

  const columns = createMemo<ColumnDef<Exercise>[]>(() => [
    {
      accessorKey: "name",
      header: "Exercise",
    },
    {
      header: "",
      id: "continue",
      cell: () => <ArrowRight />,
    },
  ]);

  const table = createSolidTable({
    get data() {
      return exercises();
    },
    columns: columns(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      get columnFilters() {
        return nameFilter() ? [{ id: "name", value: nameFilter() }] : [];
      },
    },
  });

  const getData = async () => {
    try {
      const exercises = await pb
        .collection<Exercise>("exercises")
        .getFullList({ expand: "defaultMeasurementType, exerciseVariations_via_exercise", sort: "name" });

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
      <div class="bg-base-100 rounded-lg shadow px-6 py-3">
        <div class="overflow-x-auto">
          <table class="table w-full">
            <thead class="sticky top-0 bg-base-100 z-10">
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
          </table>
          <Input
            type="text"
            placeholder="Search Exercises"
            class="p-1"
            value={nameFilter()}
            onInput={(e) => setNameFilter(e.currentTarget.value)}
          />

          <div class="max-h-[40vh] overflow-y-auto">
            <table class="table w-full">
              <tbody>
                <For each={table.getRowModel().rows}>
                  {(row) => (
                    <tr class="hover" onClick={() => props.onClick(row.original)}>
                      <For each={row.getVisibleCells()}>
                        {(cell) => (
                          <td class="p-1">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                        )}
                      </For>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </div>
        </div>
        <Show when={table.getRowModel().rows.length === 0}>
          <div class="text-center py-4">No Exercises found</div>
        </Show>
      </div>
    </Show>
  );
};
