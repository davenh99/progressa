import {
  Accessor,
  Component,
  For,
  ParentComponent,
  Show,
  createEffect,
  createSignal,
  type JSX,
} from "solid-js";
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
  return <div class="w-full">{props.children}</div>;
};

export const TableBody: ParentComponent = (props) => {
  return <div class="space-y-1">{props.children}</div>;
};

export const TableHeader: ParentComponent = (props) => {
  return <div>{props.children}</div>;
};

export const Row: ParentComponent = (props) => {
  return <div class="flex">{props.children}</div>;
};

interface DraggableRowProps {
  row: RowType<SessionExerciseRow>;
  exerciseRowIds: Accessor<string[]>;
}

type DraggingState = "idle" | "dragging" | "dragging-over";

export const DraggableRow: Component<DraggableRowProps> = (props) => {
  let ref: HTMLDivElement | undefined = undefined;
  let dragHandleRef: HTMLDivElement | undefined = undefined;
  const [dragging, setDragging] = createSignal<DraggingState>("idle");
  const [closestEdge, setClosestEdge] = createSignal<Edge | null>();

  createEffect(() => {
    const element = ref;
    const dragHandle = dragHandleRef;
    invariant(element);
    invariant(dragHandle);

    draggable({
      element,
      dragHandle,
      onDragStart() {
        setDragging("dragging");
      },
      onDrop() {
        setDragging("idle");
      },
    });

    dropTargetForElements({
      element,
      canDrop({ source }) {
        // not allowing dropping on yourself
        if (source.element === element) {
          return false;
        }
        // only allowing tasks to be dropped on me
        return props.exerciseRowIds().some((r) => r === props.row.original.sessionExercise.id);
      },
      getIsSticky() {
        return true;
      },
      getData({ input }) {
        return attachClosestEdge(
          { [Symbol("exerciseRow")]: true, taskId: props.row.original.groupID },
          {
            element,
            input,
            allowedEdges: ["top", "bottom"],
          }
        );
      },
      onDragEnter({ self }) {
        const _closestEdge = extractClosestEdge(self.data);
        setDragging("dragging-over");
        setClosestEdge(_closestEdge);
      },
      onDrag({ self }) {
        const _closestEdge = extractClosestEdge(self.data);
        // Only need to update state if nothing has changed.
        // Prevents re-rendering.
        if (dragging() !== "dragging-over" || _closestEdge !== closestEdge()) {
          setDragging("dragging-over");
          setClosestEdge(_closestEdge);
        }
      },
      onDragLeave() {
        setDragging("idle");
      },
      onDrop() {
        setDragging("idle");
      },
    });
  });

  return (
    <>
      <Show when={dragging() === "dragging-over" && closestEdge() === "top"}>
        <div class={`h-1 bg-blue-400 rounded-full relative`}></div>
      </Show>
      <div ref={ref} class={`flex border rounded-md ${dragging() === "dragging" ? "opacity-40" : ""}`}>
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
      </div>
      <Show when={dragging() === "dragging-over" && closestEdge() === "bottom"}>
        <div class={`h-1 bg-blue-400 rounded-full relative`}></div>
      </Show>
    </>
  );
};

export const Cell: ParentComponent = (props) => {
  return <div class={`p-1 flex-1`}>{props.children}</div>;
};

export const TableHeaderCell: ParentComponent = (props) => {
  return <div class="text-left p-3 flex-1">{props.children}</div>;
};
