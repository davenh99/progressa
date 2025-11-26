import { Component, createMemo, createSignal, For, onMount, Show } from "solid-js";
import { A } from "@solidjs/router";
import { createSolidTable, flexRender, getCoreRowModel, ColumnDef } from "@tanstack/solid-table";
import Loader from "lucide-solid/icons/loader";

import { Session } from "../../../Types";
import { useAuthPB } from "../../config/pocketbase";
import LoadFullScreen from "../app/LoadFullScreen";
import { Button } from "../../components";

export const SessionList: Component = () => {
  const [sessions, setSessions] = createSignal<Session[]>([]);
  const [totalSessions, setTotalSessions] = createSignal(0);
  const [loading, setLoading] = createSignal(false);
  const [page, setPage] = createSignal(1);
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
    setLoading(true);
    try {
      if (sessions().length === 0 || sessions().length < totalSessions()) {
        const listResult = await pb
          .collection<Session>("sessions")
          .getList(page(), 50, { sort: "-userDay", fields: "name, notes, userDay" });

        setTotalSessions(listResult.totalItems);
        setPage(listResult.page + 1);
        setSessions([...sessions(), ...listResult.items]);
      }
    } catch (e) {
      console.error("get sessions error: ", e);
    } finally {
      setLoading(false);
    }
  };

  onMount(() => {
    getData();
  });

  return (
    <Show when={!!sessions()} fallback={<LoadFullScreen />}>
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
                justify-between p-2 border-b-1 border-charcoal-500/40`}
            >
              <For each={row.getVisibleCells()}>
                {(cell) => <div>{flexRender(cell.column.columnDef.cell, cell.getContext())}</div>}
              </For>
            </A>
          )}
        </For>
        <Show when={sessions().length < totalSessions()}>
          <div class="w-full flex justify-center mt-5">
            <Button disabled={loading()} onClick={getData} class="flex items-center space-x-1">
              <span>Load More</span>
              {loading() && <Loader size={16} class="animate-spin" />}
            </Button>
          </div>
        </Show>
        {sessions().length === 0 && <div class="text-center py-4">No sessions found</div>}
      </div>
    </Show>
  );
};
