import { Component, createMemo, createSignal, For, onMount, Show } from "solid-js";
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
    {
      id: "more-info",
      header: "",
      cell: (ctx) => (
        <a href={`/workouts/log/${ctx.row.original.id}`}>
          <ArrowRight />
        </a>
      ),
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
                  <tr class="hover">
                    <For each={row.getVisibleCells()}>
                      {(cell) => <td>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>}
                    </For>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>
        {sessions().length === 0 && <div class="text-center py-4">No sessions found</div>}
      </div>
    </Show>
  );
};
