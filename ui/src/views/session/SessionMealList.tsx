import { Component, createEffect, createMemo, createSignal, For, Show } from "solid-js";
import { ColumnDef, createSolidTable, flexRender, getCoreRowModel } from "@tanstack/solid-table";
import { SetStoreFunction } from "solid-js/store";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import Ellipsis from "lucide-solid/icons/ellipsis-vertical";

import { SessionMeal, Session } from "../../../Types";
import { useAuthPB } from "../../config/pocketbase";
import { Button, DataInput, DataNumberInput, IconButton } from "../../components";
import CopyMealModal from "../meals/CopyMealModal";
import { SESSION_MEAL_EXPAND } from "../../config/constants";
import { extractMealData } from "../../methods/sessionMeal";
import { DraggableRow } from "./SessionMealDraggableRow";
import MealMoreModal from "../meals/MealMoreModal";

interface Props {
  meals: SessionMeal[];
  sessionID: string;
  setSession: SetStoreFunction<{
    session: Session | null;
  }>;
}

export const SessionMealList: Component<Props> = (props) => {
  const [showCopyMeal, setShowCopyMeal] = createSignal(false);
  const [showMoreMeal, setShowMoreMeal] = createSignal(false);
  const [selectedMealInd, setSelectedMealInd] = createSignal(-1);
  const { pb, updateRecord } = useAuthPB();

  const saveRow = async (recordID: string, field: string, newVal: any) => {
    try {
      await updateRecord("sessionMeals", recordID, field, newVal);
    } catch (e) {
      console.error(e);
    }
  };

  const deleteRow = async (index: number) => {
    const newMeals = props.meals.filter((_, ind) => ind !== index);

    try {
      props.setSession("session", "expand", "sessionMeals_via_session", newMeals);
      await pb.collection("sessionMeals").delete(props.meals[index].id);

      await updateRecord(
        "sessions",
        props.sessionID,
        "mealsOrder",
        newMeals.map((r) => r.id)
      );
    } catch (e) {
      console.log(e);
    }
  };

  const reorderRows = (draggedItemOldInd: number, draggedItemNewInd: number) => {
    const newMeals = [...props.meals];
    const draggedItem = newMeals.splice(draggedItemOldInd, 1);

    const adjustedNewIndex =
      draggedItemNewInd > draggedItemOldInd ? draggedItemNewInd - 1 : draggedItemNewInd;
    newMeals.splice(adjustedNewIndex, 0, ...draggedItem);

    props.setSession("session", "expand", "sessionMeals_via_session", newMeals);

    updateRecord(
      "sessions",
      props.sessionID,
      "mealsOrder",
      newMeals.map((r) => r.id)
    ).catch(console.error);
  };

  const insertRowAndSync = async (index: number, record: SessionMeal) => {
    const newMeals = [...props.meals];

    newMeals.splice(index, 0, record);
    props.setSession("session", "expand", "sessionMeals_via_session", newMeals);

    await updateRecord(
      "sessions",
      props.sessionID,
      "mealsOrder",
      newMeals.map((r) => r.id)
    );
  };

  const addRowAtIndex = async (index: number, duplicateInd?: number, createData?: { [k: string]: any }) => {
    if (createData) {
      const record = await pb.collection<SessionMeal>("sessionMeals").create(createData, {
        expand: SESSION_MEAL_EXPAND,
      });

      await insertRowAndSync(index + 1, record);
    } else if (duplicateInd !== undefined) {
      const record = await pb
        .collection<SessionMeal>("sessionMeals")
        .create(extractMealData(props.meals[duplicateInd]), { expand: SESSION_MEAL_EXPAND });

      await insertRowAndSync(index + 1, record);
    }
  };

  const addMeal = async (mealToCopy?: SessionMeal) => {
    const data = mealToCopy ? extractMealData(mealToCopy) : { session: props.sessionID, name: "Meal" };

    addRowAtIndex(props.meals.length, undefined, data);
    setShowCopyMeal(false);
  };

  const columns = createMemo<ColumnDef<SessionMeal>[]>(() => [
    {
      header: "name",
      accessorKey: "name",
      cell: (ctx) => (
        <DataInput
          type="text"
          noPadding
          value={ctx.getValue() as string}
          onValueChange={(v) =>
            props.setSession(
              "session",
              "expand",
              "sessionMeals_via_session",
              ctx.row.index,
              "name",
              v as string
            )
          }
          saveFunc={(v) => saveRow(ctx.row.original.id, "name", v)}
        />
      ),
    },
    {
      header: "energy",
      accessorKey: "kj",
      cell: (ctx) => (
        <div class="flex flex-row justify-end space-x-1">
          <DataNumberInput
            value={ctx.getValue() as number}
            onValueChange={(v) =>
              props.setSession(
                "session",
                "expand",
                "sessionMeals_via_session",
                ctx.row.index,
                "kj",
                v as number
              )
            }
            saveFunc={(v) => saveRow(ctx.row.original.id, "kj", v)}
          />
          <p>kj</p>
        </div>
      ),
    },
    {
      header: "protein",
      accessorKey: "gramsProtein",
      cell: (ctx) => (
        <div class="flex flex-row justify-end space-x-1">
          <DataNumberInput
            value={ctx.getValue() as number}
            onValueChange={(v) =>
              props.setSession(
                "session",
                "expand",
                "sessionMeals_via_session",
                ctx.row.index,
                "gramsProtein",
                v as number
              )
            }
            saveFunc={(v) => saveRow(ctx.row.original.id, "gramsProtein", v)}
          />
          <p>g</p>
        </div>
      ),
    },
    {
      header: "",
      id: "more",
      cell: (ctx) => (
        <IconButton
          onClick={() => {
            setSelectedMealInd(ctx.row.index);
            setShowMoreMeal(true);
          }}
        >
          <Ellipsis />
        </IconButton>
      ),
    },
  ]);

  const table = createSolidTable({
    get data() {
      return props.meals;
    },
    columns: columns(),
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id, // required because row indexes will change
  });

  createEffect(() => {
    return monitorForElements({
      canMonitor({ source }) {
        return source.data.isMealRow as boolean;
      },
      onDrop({ location, source }) {
        const target = location.current.dropTargets[0];
        if (!target) {
          return;
        }

        const sourceData = source.data;
        const targetData = target.data;

        if (!sourceData.isMealRow || !targetData.isMealRow) {
          return;
        }

        if ((sourceData.ind as number) < 0 || (targetData.ind as number) < 0) {
          return;
        }

        const closestEdgeOfTarget = extractClosestEdge(targetData);

        const newInd =
          closestEdgeOfTarget === "top" ? (targetData.ind as number) : (targetData.ind as number) + 1;

        reorderRows(sourceData.ind as number, newInd);
      },
    });
  });

  return (
    <div class="mt-1">
      <Show when={table.getRowModel().rows.length}>
        <For each={table.getHeaderGroups()}>
          {(headerGroup) => (
            <div class="flex">
              <For each={headerGroup.headers}>
                {(header) => {
                  let classes = `p-2 font-bold ${
                    header.column.id === "name"
                      ? "flex-6 text-left"
                      : header.column.id === "more"
                      ? "flex-1 text-right"
                      : "flex-2 text-right"
                  }`;

                  return (
                    <div class={classes}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </div>
                  );
                }}
              </For>
            </div>
          )}
        </For>
      </Show>
      <For each={table.getRowModel().rows}>
        {(row) => <DraggableRow row={row} saveRow={saveRow} setSession={props.setSession} />}
      </For>
      <div class="flex flex-row justify-center space-x-3 mt-4">
        <Button variantColor="good" onClick={() => addMeal()}>
          Add Meal
        </Button>
        <Button onClick={() => setShowCopyMeal(true)}>Copy Meal</Button>
      </div>
      <Show when={showCopyMeal()}>
        <CopyMealModal setModalVisible={(v) => setShowCopyMeal(v)} addMeal={addMeal} />
      </Show>
      <Show when={showMoreMeal() && selectedMealInd() >= 0}>
        <MealMoreModal
          sessionID={props.sessionID}
          setSession={props.setSession}
          setModalVisible={setShowMoreMeal}
          initialMeal={props.meals[selectedMealInd()]}
          deleteRow={() => deleteRow(selectedMealInd())}
          duplicateRow={() => addRowAtIndex(selectedMealInd(), selectedMealInd())}
        />
      </Show>
    </div>
  );
};

export default SessionMealList;
