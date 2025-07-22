import { Accessor, Component, createMemo, For } from "solid-js";
import { createSolidTable, flexRender, getCoreRowModel, ColumnDef } from "@tanstack/solid-table";

import { UserSession } from "../../Types";

interface Props {
  sessions: Accessor<UserSession[]>;
}

const UserSessionListView: Component<Props> = (props) => {
  const columns = createMemo<ColumnDef<UserSession>[]>(() => [
    {
      accessorKey: "name",
      header: "Session Name",
    },
    {
      accessorKey: "userDay",
      header: "Date",
      cell: (info) => new Date(info.getValue<string>()).toLocaleDateString(),
    },
    {
      accessorKey: "notes",
      header: "Notes",
      cell: (info) => info.getValue() || "-",
    },
    {
      accessorKey: "tags",
      header: "Tags",
      cell: (info) => (
        <div class="flex gap-1">
          <For each={info.getValue() as string[]}>
            {(tag) => <span class="badge badge-neutral">{tag}</span>}
          </For>
        </div>
      ),
    },
  ]);

  const table = createSolidTable({
    get data() {
      return props.sessions();
    },
    columns: columns(),
    getCoreRowModel: getCoreRowModel(),
  });

  return (
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
      {props.sessions().length === 0 && <div class="text-center py-4">No sessions found</div>}
    </div>
  );
};

export default UserSessionListView;
