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
import { flexRender, type Row } from "@tanstack/solid-table";
import Down from "lucide-solid/icons/chevron-down";
import Up from "lucide-solid/icons/chevron-up";

import { DataTextArea, IconButton, TagArea } from "../../components";
import { DraggingState, Meal, UserSession } from "../../../Types";
import { useAuthPB } from "../../config/pocketbase";
import { SetStoreFunction } from "solid-js/store";

interface DraggableRowProps {
  row: Row<Meal>;
  saveRow: (recordID: string, field: string, newVal: any) => Promise<void>;
  setSession: SetStoreFunction<{
    session: UserSession | null;
  }>;
}

export const DraggableRow: Component<DraggableRowProps> = (props) => {
  let ref: HTMLDivElement | undefined = undefined;
  const [dragging, setDragging] = createSignal<DraggingState>("idle");
  const [closestEdge, setClosestEdge] = createSignal<Edge | null>();
  const { updateRecord } = useAuthPB();

  createEffect(() => {
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
        // only allowing meals to be dropped on me
        return source.data.isMealRow as boolean;
      },
      getIsSticky() {
        return true;
      },
      getData({ input }) {
        return attachClosestEdge(
          { id: props.row.original.id, ind: props.row.index, isMealRow: true },
          { element, input, allowedEdges: ["top", "bottom"] }
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
    const element = ref;
    invariant(element);

    draggable({
      element,
      getInitialData() {
        return {
          id: props.row.original.id,
          ind: props.row.index,
          isMealRow: true,
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
            preview.textContent = props.row.original.name;
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
      <Show when={dragging() === "dragging-over" && closestEdge() === "top"}>
        <div class={`h-1 bg-blue-400 rounded-full relative`}></div>
      </Show>
      <div
        ref={ref}
        class={`flex flex-col p-1 cursor-grab active:cursor-grabbing ${
          dragging() === "dragging" ? "opacity-40" : ""
        } rounded-md`}
      >
        <div class="flex w-full">
          <For each={props.row.getVisibleCells()}>
            {(cell) => {
              let classes = `px-2 ${
                cell.column.id === "name" ? "flex-6" : cell.column.id === "more" ? "flex-1" : "flex-2"
              }`;

              return <div class={classes}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</div>;
            }}
          </For>
        </div>
        {/* <Show when={props.row.original.expanded}>
          <DataTextArea
            label="Description"
            value={props.row.original.meal.description}
            saveFunc={(v: string) => updateRecord("meals", props.row.original.meal.id, "description", v)}
            onValueChange={(v) => props.setMealRows("rows", props.row.index, "meal", "description", v)}
          />

          <TagArea
            tags={props.row.original.meal.expand?.tags ?? []}
            setTags={(tags) => props.setMealRows("rows", props.row.index, "meal", "expand", "tags", tags)}
            modelName="meals"
            recordID={props.row.original.meal.id}
          />
        </Show> */}
      </div>
      <Show when={dragging() === "dragging-over" && closestEdge() === "bottom"}>
        <div class={`h-1 bg-blue-400 rounded-full relative`}></div>
      </Show>
    </>
  );
};
