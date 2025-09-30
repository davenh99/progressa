import { Component, For, Show, createEffect, createSignal } from "solid-js";
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

import { DataTime } from "../../components";
import { DraggingState, Session, SessionExercise } from "../../../Types";
import { SetStoreFunction } from "solid-js/store";
import { DROP_ABOVE_CLASS, DROP_BELOW_CLASS } from "../../config/constants";

interface DraggableRowProps {
  row: RowType<SessionExercise>;
  firstOfGroup: boolean;
  lastOfGroup: boolean;
  firstOfSuperset: boolean;
  lastOfSuperset: boolean;
  getGroupInds: () => number[];
  saveRow: (recordID: string, field: string, newVal: any) => Promise<void>;
  getSupersetParent: (index: number) => SessionExercise;
  setSession: SetStoreFunction<{
    session: Session | null;
  }>;
}

export const DraggableRow: Component<DraggableRowProps> = (props) => {
  let ref: HTMLDivElement | undefined = undefined;
  let groupRef: HTMLDivElement | undefined = undefined;
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
        // don't allow dropping group on it's own rows
        if (source.data.isGroup && (source.data.groupInds as number[]).includes(props.row.index)) {
          return false;
        }
        // only allowing sessionExercises to be dropped on me
        return source.data.isSessionExerciseRow as boolean;
      },
      getIsSticky() {
        return true;
      },
      getData({ input }) {
        const allowedEdges: Edge[] = [];
        if (props.firstOfSuperset) allowedEdges.push("top");
        if (props.lastOfSuperset) allowedEdges.push("bottom");

        return attachClosestEdge(
          { id: props.row.original.id, ind: props.row.index, isSessionExerciseRow: true },
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
    invariant(element);

    draggable({
      element,
      getInitialData() {
        return {
          id: props.row.original.id,
          ind: props.row.index,
          isSessionExerciseRow: true,
        };
      },
      onGenerateDragPreview({ nativeSetDragImage }) {
        setCustomNativeDragPreview({
          getOffset: pointerOutsideOfPreview({
            x: "16px",
            y: "8px",
          }),
          render({ container }) {
            const preview = document.createElement("div");
            preview.textContent = `${props.row.original.expand?.exercise?.name} (${
              props.firstOfSuperset && !props.lastOfSuperset ? "superset" : "1x set"
            })`;
            preview.className = "px-2.5 py-1.5 rounded-sm bg-charcoal-800";
            container.appendChild(preview);
          },
          nativeSetDragImage,
        });
      },
      onDragStart() {
        setDragging("dragging");
      },
      onDrop() {
        setDragging("idle");
      },
    });
  });

  createEffect(() => {
    if (!props.firstOfGroup) return;

    const element = groupRef;
    invariant(element);

    const groupInds = props.getGroupInds();

    draggable({
      element,
      getInitialData() {
        return {
          id: props.row.original.id,
          ind: props.row.index,
          isSessionExerciseRow: true,
          isGroup: true,
          groupInds,
        };
      },
      onGenerateDragPreview({ nativeSetDragImage }) {
        setCustomNativeDragPreview({
          getOffset: pointerOutsideOfPreview({
            x: "16px",
            y: "8px",
          }),
          render({ container }) {
            const preview = document.createElement("div");
            preview.textContent = `${props.row.original.expand?.exercise?.name} (${groupInds.length}x sets)`;
            preview.className = "px-2.5 py-1.5 rounded-sm bg-charcoal-800";
            container.appendChild(preview);
          },
          nativeSetDragImage,
        });
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
        ref={groupRef}
        class={`${props.firstOfGroup ? "mt-2 rounded-tl-lg rounded-tr-lg" : ""} ${
          props.lastOfGroup ? "pb-2 rounded-bl-lg rounded-br-lg" : ""
        } bg-charcoal-900/15 px-2 ${props.row.original.supersetParent ? "" : "pt-1"}
      ${
        dragging() === "dragging-over" && closestEdge() === "top" && props.firstOfGroup
          ? DROP_ABOVE_CLASS
          : ""
      }`}
      >
        <Show when={props.firstOfGroup}>
          {/* exercise name */}
          <p class="font-bold">
            {props.row.original.expand?.variation?.name
              ? `${props.row.original.expand?.exercise?.name} (${props.row.original.expand?.variation?.name})`
              : props.row.original.expand?.exercise?.name}
          </p>

          {/* column headers */}
          <div class="w-full flex flex-row justify-between mt-1 text-center">
            <p class="flex-2">set</p>
            <p class="flex-2">
              {props.row.original.expand?.exercise?.expand?.defaultMeasurementType?.displayName ?? "?"}
            </p>
            <p class="flex-2">+kg</p>
            <p class="flex-2">rpe</p>
            <p class="flex-1"> </p>
          </div>
        </Show>
        <div
          ref={ref}
          class={`flex flex-col ${dragging() === "dragging" ? "opacity-40" : ""}
        ${
          dragging() === "dragging-over" &&
          closestEdge() === "top" &&
          props.firstOfSuperset &&
          !props.firstOfGroup
            ? DROP_ABOVE_CLASS
            : ""
        }
        ${
          dragging() === "dragging-over" && closestEdge() === "bottom" && props.lastOfSuperset
            ? DROP_BELOW_CLASS
            : ""
        }
        `}
        >
          <div class="flex w-full text-center">
            <For each={props.row.getVisibleCells()}>
              {(cell) => {
                const classes = `py-1 ${cell.column.id === "more" ? "flex-1" : "flex-2"}`;

                return <div class={classes}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</div>;
              }}
            </For>
          </div>
          <Show when={props.lastOfSuperset}>
            <div class="flex flex-row justify-around">
              <div class="rounded-sm bg-dark-slate-gray-800/50">
                <DataTime
                  value={props.row.original.restAfter}
                  onValueChange={(v) =>
                    props.setSession(
                      "session",
                      "expand",
                      "sessionExercises_via_session",
                      props.row.index,
                      "restAfter",
                      v
                    )
                  }
                  saveFunc={(v: number) => props.saveRow(props.row.original.id, "restAfter", v)}
                />
              </div>
            </div>
          </Show>
        </div>
      </div>
    </>
  );
};
