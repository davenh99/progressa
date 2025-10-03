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
import { SessionMeal } from "../../../Types";
import Loading from "../app/Loading";
import { Input } from "../../components";

interface Props {
  onClick: (meal: SessionMeal) => void;
}

export const MealList: Component<Props> = (props) => {
  const [meals, setMeals] = createSignal<SessionMeal[]>([]);
  const [nameFilter, setNameFilter] = createSignal<string>("");
  const { pb, user } = useAuthPB();

  const columns = createMemo<ColumnDef<SessionMeal>[]>(() => [
    {
      accessorKey: "name",
      header: "Meal",
    },
    {
      header: "",
      id: "continue",
      cell: () => <ArrowRight class="self-end" />,
    },
  ]);

  const table = createSolidTable({
    get data() {
      return meals() || [];
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
      const meals = await pb.collection<SessionMeal>("sessionMeals").getFullList({
        filter: `session.user = '${user.id}' && name != ''`,
        sort: "name",
      });

      setMeals(meals);
    } catch (e) {
      console.log("get meals error: ", e);
    }
  };

  onMount(() => {
    getData();
  });

  return (
    <Show when={!!meals()} fallback={<Loading />}>
      <div class="p-1 flex flex-col flex-1 overflow-hidden">
        <Input
          noPadding
          value={nameFilter()}
          onChange={setNameFilter}
          inputProps={{
            placeholder: "Search Past Meals",
            class: "p-1",
          }}
        />

        <div class="overflow-y-auto flex-1">
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
        <Show when={table.getRowModel().rows.length === 0}>
          <div class="text-center py-4">No meals found</div>
        </Show>
      </div>
    </Show>
  );
};
