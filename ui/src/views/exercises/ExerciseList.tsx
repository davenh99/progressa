import { Component, createMemo, createSignal, For, onMount, Show } from "solid-js";
import {
  ColumnDef,
  createSolidTable,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
} from "@tanstack/solid-table";
import ArrowRight from "lucide-solid/icons/arrow-right";
import Loader from "lucide-solid/icons/loader";

import { useAuthPB } from "../../config/pocketbase";
import { Exercise } from "../../../Types";
import { Input } from "../../components";
import LoadFullScreen from "../app/LoadFullScreen";
import { debounce } from "../../methods/debounce";

interface Props {
  onClick: (exercise: Exercise) => void;
}

export const ExerciseList: Component<Props> = (props) => {
  const [exercises, setExercises] = createSignal<Exercise[]>([]);
  const [loading, setLoading] = createSignal(false);
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
  });

  const getData = async () => {
    setLoading(true);
    let page = 1;
    let total = -1;
    let fetched = 0;

    try {
      while (total < 0 || fetched < total) {
        const listResult = await pb.collection<Exercise>("exercises").getList(page, 300, {
          expand: "defaultMeasurementType",
          filter: nameFilter() === "" ? "" : `name ~ '${nameFilter()}'`,
          sort: "name",
          fields: "name, description",
        });

        if (fetched === 0) {
          setExercises(listResult.items);
        } else {
          setExercises([...exercises(), ...listResult.items]);
        }
        fetched += listResult.items.length;
        total = listResult.totalItems;
        page = listResult.page + 1;
      }
    } catch (e) {
      console.error("get exercises error: ", e);
    }

    setLoading(false);
  };

  onMount(() => {
    getData();
  });

  return (
    <Show when={!!exercises()} fallback={<LoadFullScreen />}>
      <div class="overflow-x-auto h-[50vh]">
        <div class="mb-1 flex items-center">
          <Input
            noPadding
            class="flex-1"
            value={nameFilter()}
            onChange={(v) => {
              setNameFilter(v);
              debounce(getData)();
            }}
            inputProps={{ placeholder: "Search Exercises", class: "p-1" }}
          />
          {loading() && <Loader size={16} class="ml-1 animate-spin" />}
        </div>
        <Show when={table.getRowModel().rows.length === 0}>
          <div class="text-center py-4 italic">No Exercises found</div>
        </Show>
        <div class="max-h-[41vh] overflow-y-auto">
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
    </Show>
  );
};
