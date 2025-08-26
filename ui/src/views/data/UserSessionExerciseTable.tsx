import { Component, For, ParentComponent, Show, createEffect, createSignal } from "solid-js";
import {
  attachClosestEdge,
  extractClosestEdge,
  type Edge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import invariant from "tiny-invariant";
import { flexRender, type Row as RowType } from "@tanstack/solid-table";
import Grip from "lucide-solid/icons/grip-vertical";

import { SessionExerciseRow } from ".";

export const Table: ParentComponent = (props) => {
  return <div class="w-full">{props.children}</div>;
};

export const TableBody: ParentComponent = (props) => {
  return <div>{props.children}</div>;
};

export const TableHeader: ParentComponent = (props) => {
  return <div>{props.children}</div>;
};

export const Row: ParentComponent = (props) => {
  return <div class="flex">{props.children}</div>;
};

interface DraggableRowProps {
  row: RowType<SessionExerciseRow>;
  isDropSet: boolean;
  firstOfGroup: boolean;
  lastOfGroup: boolean;
  firstOfSuperset: boolean;
  lastOfSuperset: boolean;
}

type DraggingState = "idle" | "dragging" | "dragging-over";

export const DraggableRow: Component<DraggableRowProps> = (props) => {
  let ref: HTMLDivElement | undefined = undefined;
  let dragHandleRef: HTMLDivElement | undefined = undefined;
  const [dragging, setDragging] = createSignal<DraggingState>("idle");
  const [closestEdge, setClosestEdge] = createSignal<Edge | null>();

  createEffect(() => {
    if (!props.firstOfSuperset && !props.lastOfSuperset) return;

    const element = ref;
    invariant(element);

    dropTargetForElements({
      element,
      canDrop({ source }) {
        // not allowing dropping on yourself
        if (source.element === element) {
          return false;
        }
        // only allowing tasks to be dropped on me
        return source.data.isUserSessionExerciseRow as boolean;
      },
      getIsSticky() {
        return true;
      },
      getData({ input }) {
        const allowedEdges = [];
        if (props.firstOfSuperset) allowedEdges.push("top");
        if (props.lastOfSuperset) allowedEdges.push("bottom");

        return attachClosestEdge(
          { id: props.row.original.sessionExercise.id, ind: props.row.index, isUserSessionExerciseRow: true },
          { element, input, allowedEdges }
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

  createEffect(() => {
    if (!props.firstOfSuperset) return;

    const element = ref;
    const dragHandle = dragHandleRef;
    invariant(element);
    invariant(dragHandle);

    draggable({
      element,
      dragHandle,
      getInitialData() {
        return {
          id: props.row.original.sessionExercise.id,
          ind: props.row.index,
          isUserSessionExerciseRow: true,
        };
      },
      onDragStart() {
        setDragging("dragging");
      },
      onDrop() {
        setDragging("idle");
      },
    });
  });

  return (
    <>
      <div
        class={`${props.firstOfGroup ? "mt-2 rounded-tl-lg rounded-tr-lg" : ""} ${
          props.lastOfGroup ? "pb-2 rounded-bl-lg rounded-br-lg" : ""
        } bg-charcoal-900 px-2 ${props.isDropSet ? "" : "pt-1"}`}
      >
        <Show when={props.firstOfGroup}>
          <p>
            {props.row.original.sessionExercise.expand?.variation?.name
              ? `${props.row.original.sessionExercise.expand?.exercise?.name} (${props.row.original.sessionExercise.expand?.variation?.name})`
              : props.row.original.sessionExercise.expand?.exercise?.name}
          </p>
        </Show>
        <Show when={dragging() === "dragging-over" && closestEdge() === "top" && props.firstOfSuperset}>
          <div class={`h-1 bg-blue-400 rounded-full relative`}></div>
        </Show>
        <div
          ref={ref}
          class={`flex ${dragging() === "dragging" ? "opacity-40" : ""} bg-ash-gray-800 ${
            props.firstOfSuperset ? "rounded-t-md" : ""
          } ${props.lastOfSuperset ? "rounded-b-md" : ""}`}
        >
          <For each={props.row.getVisibleCells()}>
            {(cell) => (
              <Cell>
                {cell.column.id === "handle" && props.firstOfSuperset ? (
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
        <Show when={dragging() === "dragging-over" && closestEdge() === "bottom" && props.lastOfSuperset}>
          <div class={`h-1 bg-blue-400 rounded-full relative`}></div>
        </Show>
      </div>
    </>
  );
};

export const Cell: ParentComponent = (props) => {
  return <div class={`p-1 flex-1`}>{props.children}</div>;
};

export const TableHeaderCell: ParentComponent = (props) => {
  return <div class="text-left p-3 flex-1">{props.children}</div>;
};
