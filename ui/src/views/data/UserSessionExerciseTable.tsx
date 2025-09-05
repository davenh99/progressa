import { Component, For, ParentComponent, Show, createEffect, createSignal } from "solid-js";
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
import Down from "lucide-solid/icons/chevron-down";
import Up from "lucide-solid/icons/chevron-up";

import { SessionExerciseRow } from ".";
import { DataTime, DataTextArea, IconButton, TagArea } from "../../components";
import { DraggingState, UserSessionExercise } from "../../../Types";
import { useAuthPB } from "../../config/pocketbase";
import { SetStoreFunction } from "solid-js/store";

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
  firstOfGroup: boolean;
  lastOfGroup: boolean;
  firstOfSuperset: boolean;
  lastOfSuperset: boolean;
  getGroupInds: () => number[];
  saveRow: (recordID: string, field: string, newVal: any) => Promise<void>;
  expandAtInd: (index: number) => void;
  collapse: () => void;
  setExerciseRows: SetStoreFunction<{ rows: SessionExerciseRow[] }>;
  getSupersetParent: (index: number) => UserSessionExercise;
}

export const DraggableRow: Component<DraggableRowProps> = (props) => {
  let ref: HTMLDivElement | undefined = undefined;
  let groupRef: HTMLDivElement | undefined = undefined;
  let dragHandleRef: HTMLDivElement | undefined = undefined;
  let dragHandleMasterRef: HTMLDivElement | undefined = undefined;
  const [dragging, setDragging] = createSignal<DraggingState>("idle");
  const [closestEdge, setClosestEdge] = createSignal<Edge | null>();
  const { updateRecord } = useAuthPB();

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
        return source.data.isUserSessionExerciseRow as boolean;
      },
      getIsSticky() {
        return true;
      },
      getData({ input }) {
        const allowedEdges: Edge[] = [];
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
      onGenerateDragPreview({ nativeSetDragImage }) {
        setCustomNativeDragPreview({
          getOffset: pointerOutsideOfPreview({
            x: "16px",
            y: "8px",
          }),
          render({ container }) {
            const preview = document.createElement("div");
            preview.textContent = `${props.row.original.sessionExercise.expand?.exercise?.name} (${
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
    const dragHandle = dragHandleMasterRef;
    invariant(element);
    invariant(dragHandle);

    const groupInds = props.getGroupInds();

    draggable({
      element,
      dragHandle,
      getInitialData() {
        return {
          id: props.row.original.sessionExercise.id,
          ind: props.row.index,
          isUserSessionExerciseRow: true,
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
            preview.textContent = `${props.row.original.sessionExercise.expand?.exercise?.name} (${groupInds.length}x sets)`;
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
        } bg-charcoal-900 px-2 ${props.row.original.sessionExercise.supersetParent ? "" : "pt-1"}`}
      >
        <Show when={props.firstOfGroup}>
          <div ref={dragHandleMasterRef} class="cursor-grab active:cursor-grabbing">
            <Grip />
          </div>
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
          class={`flex flex-col p-1 ${dragging() === "dragging" ? "opacity-40" : ""} bg-ash-gray-800 ${
            props.firstOfSuperset ? "rounded-t-md" : ""
          } ${props.lastOfSuperset ? "rounded-b-md" : ""}`}
        >
          <div class="flex w-full">
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
          <Show when={props.lastOfSuperset}>
            <div class="flex flex-row justify-between">
              <div class="rounded-lg bg-dark-slate-gray-800 p-1 ml-15 grow-0 flex flex-row">
                <DataTime
                  label="Rest: "
                  value={props.row.original.sessionExercise.restAfter}
                  onValueChange={(v) =>
                    props.setExerciseRows("rows", props.row.index, "sessionExercise", "restAfter", v)
                  }
                  saveFunc={(v: number) =>
                    props.saveRow(props.row.original.sessionExercise.id, "restAfter", v)
                  }
                />
              </div>
              <div>
                <Show when={props.lastOfSuperset}>
                  <Show
                    when={props.row.original.expanded}
                    fallback={
                      <IconButton onClick={() => props.expandAtInd(props.row.index)}>
                        <Down />
                      </IconButton>
                    }
                  >
                    <IconButton onClick={props.collapse}>
                      <Up />
                    </IconButton>
                  </Show>
                </Show>
              </div>
            </div>
            <Show when={props.row.original.expanded}>
              <DataTextArea
                label="Notes"
                value={props.getSupersetParent(props.row.index).notes}
                onValueChange={(notes) => {
                  const recordID =
                    props.row.original.sessionExercise.supersetParent ||
                    props.row.original.sessionExercise.id;

                  props.setExerciseRows(
                    "rows",
                    (r) => r.sessionExercise.id === recordID,
                    "sessionExercise",
                    "notes",
                    notes
                  );
                }}
                saveFunc={(v: string) =>
                  updateRecord(
                    "userSessionExercises",
                    props.row.original.sessionExercise.supersetParent ||
                      props.row.original.sessionExercise.id,
                    "notes",
                    v
                  )
                }
              />

              <TagArea
                tags={props.getSupersetParent(props.row.index).expand?.tags ?? []}
                setTags={(tags) => {
                  const recordID =
                    props.row.original.sessionExercise.supersetParent ||
                    props.row.original.sessionExercise.id;

                  props.setExerciseRows(
                    "rows",
                    (r) => r.sessionExercise.id === recordID,
                    "sessionExercise",
                    "expand",
                    "tags",
                    tags
                  );
                }}
                modelName="userSessionExercises"
                recordID={
                  props.row.original.sessionExercise.supersetParent || props.row.original.sessionExercise.id
                }
              />
            </Show>
          </Show>
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
