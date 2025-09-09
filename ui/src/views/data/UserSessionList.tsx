import { Component, createMemo, createSignal, For, onMount, Show } from "solid-js";
import { A } from "@solidjs/router";
import { createSolidTable, flexRender, getCoreRowModel, ColumnDef } from "@tanstack/solid-table";
import ArrowRight from "lucide-solid/icons/arrow-right";

import { UserSession } from "../../../Types";
import { useAuthPB } from "../../config/pocketbase";
import Loading from "../Loading";

export const UserSessionList: Component = (props) => {
  const [sessions, setSessions] = createSignal<UserSession[]>([]);
  const { pb } = useAuthPB();

  const columns = createMemo<ColumnDef<UserSession>[]>(() => [
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
    // {
    //   id: "select",
    //   header: "",
    //   cell: (ctx) => (
    //     <A >
    //       <ArrowRight />
    //     </A>
    //   ),
    // },
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
      const sessions = await pb.collection<UserSession>("userSessions").getFullList({ sort: "-userDay" });

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
      <div class="p-4 w-full">
        <For each={table.getHeaderGroups()}>
          {(headerGroup) => (
            <div class="flex flex-row w-full justify-between">
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
              class="hover flex flex-row w-full justify-between py-2 border-b-2 border-ash-gray-800"
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
