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
import Plus from "lucide-solid/icons/plus";
import Filter from "lucide-solid/icons/list-filter-plus";

import { useAuthPB } from "../../config/pocketbase";
import { Exercise } from "../../../Types";
import { Button, Input } from "../../components";
import LoadFullScreen from "../app/LoadFullScreen";
import { debounce } from "../../methods/debounce";
import { ClientResponseError } from "pocketbase";
import EquipmentSelectModal from "./EquipmentSelectModal";

interface Props {
  onClick: (exercise: Exercise) => void;
}

export const ExerciseList: Component<Props> = (props) => {
  const [exercises, setExercises] = createSignal<Exercise[]>([]);
  const [loading, setLoading] = createSignal(false);
  const [nameFilter, setNameFilter] = createSignal<string>("");
  const [showEquipmentSelect, setShowEquipmentSelect] = createSignal(false);
  const [selectedEquipment, setSelectedEquipment] = createSignal("");
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
        const listResult = await pb.collection<Exercise>("exercises").getList(page, 1000, {
          expand: "defaultMeasurementType",
          filter: nameFilter() === "" ? "" : `name ~ '${nameFilter()}'`,
          sort: "name",
          fields: "id, name, description",
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
      if (e instanceof ClientResponseError && e.isAbort) {
      } else {
        console.error("get exercises error: ", e);
      }
    }

    setLoading(false);
  };

  onMount(() => {
    getData();
  });

  return (
    <>
      <Show when={showEquipmentSelect()}>
        <EquipmentSelectModal
          setModalVisible={setShowEquipmentSelect}
          selectEquipment={setSelectedEquipment}
        />
      </Show>
      <Show when={!!exercises()} fallback={<LoadFullScreen />}>
        <div class="pb-1 sticky top-0 bg-charcoal-500/95 backdrop-blur-xs pt-3">
          <div class="flex items-center space-x-2">
            <Button
              class="flex text-sm items-center pl-1 pr-2"
              variant="solid"
              variantColor="good"
              onClick={() => {}}
            >
              <Plus size={20} />
              New
            </Button>
            <div class="w-full relative">
              <Input
                noPadding
                class="w-full"
                value={nameFilter()}
                onChange={(v) => {
                  setNameFilter(v);
                  debounce(getData)();
                }}
                inputProps={{ placeholder: "Search Exercises", class: "p-1" }}
              />
              {loading() && (
                <Loader size={16} class="absolute animate-spin top-1/2 transform -translate-y-1/2 right-2" />
              )}
            </div>
          </div>
          <div class="flex items-center space-x-2 mt-2 mb-1">
            <Button
              class="flex-1 py-0 flex items-center space-x-1 justify-center"
              onClick={() => setShowEquipmentSelect(true)}
            >
              <Filter size={16} />
              <span>Equipment</span>
            </Button>
            <Button class="flex-1 py-0 flex items-center space-x-1 justify-center">
              <Filter size={16} />
              <span>Muscles</span>
            </Button>
            <Button class="flex-1 py-0 flex items-center space-x-1 justify-center">
              <Filter size={16} />
              <span>Saved</span>
            </Button>
          </div>
          <p class="text-xs italic">{table.getRowModel().rows.length} Exercises</p>
        </div>
        <div class="overflow-y-auto">
          <table class="table w-full">
            <tbody>
              <For each={table.getRowModel().rows}>
                {(row) => (
                  <tr class="hover text-sm" onClick={() => props.onClick(row.original)}>
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
      </Show>
    </>
  );
};
