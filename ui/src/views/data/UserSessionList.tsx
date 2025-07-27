import { Component, createMemo, createSignal, For, onMount, Show } from "solid-js";
import { createSolidTable, flexRender, getCoreRowModel, ColumnDef } from "@tanstack/solid-table";
import Ellipsis from "lucide-solid/icons/ellipsis";

import { Tag, UserSession } from "../../../Types";
import { useAuthPB } from "../../config/pocketbase";
import Loading from "../Loading";

export const UserSessionList: Component = (props) => {
  const [sessions, setSessions] = createSignal<UserSession[]>([]);
  const { pb } = useAuthPB();

  const columns = createMemo<ColumnDef<UserSession>[]>(() => [
    {
      accessorKey: "name",
      header: "Session Name",
    },
    {
      accessorKey: "userDay",
      header: "Date",
      cell: (ctx) => new Date(ctx.getValue<string>()).toLocaleDateString(),
    },
    {
      accessorKey: "notes",
      header: "Notes",
      cell: (ctx) => ctx.getValue() || "-",
    },
    {
      accessorFn: (row) => (row.expand.tags ? row.expand.tags : []),
      header: "Tags",
      cell: (ctx) => (
        <div class="flex gap-1">
          <For each={ctx.getValue() as Tag[]}>
            {(tag) => <span class="badge badge-neutral">{tag.name}</span>}
          </For>
        </div>
      ),
    },
    {
      id: "more-info",
      header: "",
      cell: (ctx) => (
        <a href={`/workouts/log/${ctx.row.original.id}`}>
          <Ellipsis />
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
      const sessions = await pb.collection<UserSession>("userSessions").getFullList({ expand: "tags" });

      // console.log(sessions[0]);
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
        <h3 class="text-xl font-bold mb-4">Your Workout Sessions</h3>
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
