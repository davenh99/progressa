import { Component, createMemo, createSignal, For, onMount, Show } from "solid-js";
import ArrowRight from "lucide-solid/icons/arrow-right";
import Plus from "lucide-solid/icons/plus";
import {
  ColumnDef,
  createSolidTable,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
} from "@tanstack/solid-table";

import { Routine } from "../../../Types";
import { Button, Input } from "../../components";
import { useAuthPB } from "../../config/pocketbase";

interface Props {
  createRoutine: () => Promise<void>;
  onClick: (routine: Routine) => void;
}

export const RoutineList: Component<Props> = (props) => {
  const [exercises, setExercises] = createSignal<Routine[]>([]);
  const [nameFilter, setNameFilter] = createSignal<string>("");
  const { pb } = useAuthPB();

  const columns = createMemo<ColumnDef<Routine>[]>(() => [
    {
      accessorKey: "name",
      header: "Routine",
      cell: (ctx) => (
        <div>
          <p>{ctx.getValue() as string}</p>
          <p class="text-sm">{ctx.row.original.description}</p>
        </div>
      ),
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
      const exercises = await pb.collection<Routine>("routines").getFullList({ sort: "name" });

      setExercises(exercises);
    } catch (e) {
      console.error("get exercises error: ", e);
    }
  };

  onMount(() => {
    getData();
  });

  return (
    <>
      <div class="w-full flex justify-start items-center space-x-2">
        <Button
          class="flex text-sm items-center pl-1 pr-2"
          variant="solid"
          variantColor="good"
          onClick={() => props.createRoutine()}
        >
          <Plus size={20} />
          New
        </Button>
        <Input
          value={nameFilter()}
          onChange={setNameFilter}
          class="flex-1"
          inputProps={{ placeholder: "Search Routines", class: "p-1 border-b-1 w-full" }}
        />
      </div>
      <div class="mt-4">
        <div class="space-y-2">
          <For each={table.getRowModel().rows}>
            {(row) => (
              <div
                class="rounded-md bg-charcoal-600 flex justify-between"
                onClick={() => props.onClick(row.original)}
              >
                <For each={row.getVisibleCells()}>
                  {(cell) => {
                    const classes = `p-1 flex items-center ${cell.column.getIndex() === 0 ? "flex-1" : ""}`;

                    return (
                      <div class={classes}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</div>
                    );
                  }}
                </For>
              </div>
            )}
          </For>
        </div>
        <Show when={table.getRowModel().rows.length === 0}>
          <div class="text-center">No Routines found.</div>
        </Show>
      </div>
    </>
  );
};

export default RoutineList;
