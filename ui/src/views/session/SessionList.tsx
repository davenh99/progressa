import { Component, createMemo, createSignal, For, onMount, Show } from "solid-js";
import { A } from "@solidjs/router";
import { createSolidTable, flexRender, getCoreRowModel, ColumnDef } from "@tanstack/solid-table";

import { Session } from "../../../Types";
import { useAuthPB } from "../../config/pocketbase";
import Loading from "../app/Loading";

export const SessionList: Component = (props) => {
  const [sessions, setSessions] = createSignal<Session[]>([]);
  const { pb } = useAuthPB();

  const columns = createMemo<ColumnDef<Session>[]>(() => [
    {
      accessorKey: "name",
      header: "Session Name",
      cell: (ctx) => ctx.getValue() || "-",
    },
    {
      accessorKey: "userDay",
      header: "Date",
      cell: (ctx) => new Date(ctx.getValue<string>()).toLocaleDateString(),
    },
  ]);

  const table = createSolidTable({
    get data() {
      return sessions();
    },
    columns: columns(),
    getCoreRowModel: getCoreRowModel(),
  });

  const getData = async () => {
    try {
      const sessions = await pb.collection<Session>("sessions").getFullList({ sort: "-userDay" });

      setSessions(sessions);
    } catch (e) {
      console.log("get sessions error: ", e);
    }
  };

  onMount(() => {
    getData();
  });

  return (
    <Show when={!!sessions()} fallback={<Loading />}>
      <div class="w-full">
        <For each={table.getHeaderGroups()}>
          {(headerGroup) => (
            <div class="flex flex-row w-full justify-between sticky top-0 bg-charcoal-500/80 text-dark-slate-gray-900 backdrop-blur-sm p-2">
              <For each={headerGroup.headers}>
                {(header) => (
                  <div class="text-left font-bold">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </div>
                )}
              </For>
            </div>
          )}
        </For>
        <For each={table.getRowModel().rows}>
          {(row) => (
            <A
              href={`/log?date=${row.original.userDay}`}
              class={`bg-charcoal-600 text-dark-slate-gray-900 hover:opacity-80 flex flex-row w-full
                justify-between p-2 border-b-1 border-charcoal-500`}
            >
              <For each={row.getVisibleCells()}>
                {(cell) => <div>{flexRender(cell.column.columnDef.cell, cell.getContext())}</div>}
              </For>
            </A>
          )}
        </For>
        {sessions().length === 0 && <div class="text-center py-4">No sessions found</div>}
      </div>
    </Show>
  );
};
