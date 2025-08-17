import { Component, For, ParentComponent, createEffect, createSignal, type JSX } from "solid-js";
import {
  attachClosestEdge,
  extractClosestEdge,
  type Edge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { pointerOutsideOfPreview } from "@atlaskit/pragmatic-drag-and-drop/element/pointer-outside-of-preview";
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview";
import invariant from "tiny-invariant";
import { flexRender, type Row as RowType } from "@tanstack/solid-table";
import Grip from "lucide-solid/icons/grip-vertical";

import { SessionExerciseRow } from "./";

export const Table: ParentComponent = (props) => {
  return <table class="table w-full border-separate border-spacing-y-1">{props.children}</table>;
};

export const TableBody: ParentComponent = (props) => {
  return <tbody>{props.children}</tbody>;
};

export const TableHeader: ParentComponent = (props) => {
  return <thead>{props.children}</thead>;
};

export const Row: ParentComponent = (props) => {
  return <tr>{props.children}</tr>;
};

interface DraggableRowProps {
  row: RowType<SessionExerciseRow>;
}

export const DraggableRow: Component<DraggableRowProps> = (props) => {
  let ref: HTMLTableRowElement | undefined = undefined;
  let dragHandleRef: HTMLTableCellElement | undefined = undefined;
  const [dragging, setDragging] = createSignal<boolean>(false);

  createEffect(() => {
    const element = ref;
    const dragHandle = dragHandleRef;
    invariant(element);
    invariant(dragHandle);

    draggable({
      element,
      dragHandle,
      onDragStart() {
        setDragging(true);
      },
      onDrop() {
        setDragging(false);
      },
    });
  });

  return (
    <tr ref={ref} class={`${dragging() ? "opacity-40" : ""}`}>
      <For each={props.row.getVisibleCells()}>
        {(cell) => (
          <Cell>
            {cell.column.id === "handle" ? (
              <div ref={dragHandleRef} class="cursor-grab active:cursor-grabbing">
                <Grip />
              </div>
            ) : (
              flexRender(cell.column.columnDef.cell, cell.getContext())
            )}
          </Cell>
        )}
      </For>
    </tr>
  );
};

export const Cell: ParentComponent = (props) => {
  return (
    <td
      class={`p-1 border-t-1 border-b-1 first-of-type:border-l-1 first-of-type:rounded-bl-md first-of-type:rounded-tl-md
        last-of-type:border-r-1 last-of-type:rounded-br-md last-of-type:rounded-tr-md`}
    >
      {props.children}
    </td>
  );
};

export const TableHeaderCell: ParentComponent = (props) => {
  return <td class="text-left p-3">{props.children}</td>;
};
