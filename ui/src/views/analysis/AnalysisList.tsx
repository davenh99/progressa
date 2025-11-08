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

import { Analysis } from "../../../Types";
import { Button, Input } from "../../components";
import { useAuthPB } from "../../config/pocketbase";

interface Props {
  createAnalysis: () => Promise<void>;
  onClick: (analysis: Analysis) => void;
}

export const AnalysisList: Component<Props> = (props) => {
  const [analyses, setAnalyses] = createSignal<Analysis[]>([]);
  const [titleFilter, setTitleFilter] = createSignal<string>("");
  const { pb } = useAuthPB();

  const columns = createMemo<ColumnDef<Analysis>[]>(() => [
    {
      accessorKey: "title",
      header: "Analysis",
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
      return analyses();
    },
    columns: columns(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      get columnFilters() {
        return titleFilter() ? [{ id: "title", value: titleFilter() }] : [];
      },
    },
  });

  const getData = async () => {
    try {
      const analyses = await pb.collection<Analysis>("analyses").getFullList({ sort: "title" });

      setAnalyses(analyses);
    } catch (e) {
      console.error("get analyses error: ", e);
    }
  };

  onMount(() => {
    getData();
  });

  return (
    <>
      <div class="w-full flex justify-start items-center space-x-2 sticky top-0 bg-charcoal-500/90 pt-3 pb-2 backdrop-blur-xs">
        <Button
          class="flex text-sm items-center pl-1 pr-2"
          variant="solid"
          variantColor="good"
          onClick={() => props.createAnalysis()}
        >
          <Plus size={20} />
          New
        </Button>
        <Input
          value={titleFilter()}
          onChange={setTitleFilter}
          class="flex-1"
          inputProps={{ placeholder: "Search Analyses", class: "p-1 border-b-1 w-full" }}
        />
      </div>
      <div class="mt-2">
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
          <div class="text-center">No Analyses found.</div>
        </Show>
      </div>
    </>
  );
};

export default AnalysisList;
