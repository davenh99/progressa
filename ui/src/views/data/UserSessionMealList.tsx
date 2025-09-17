import { Component, createEffect, createMemo, createSignal, For, Show } from "solid-js";
import { createStore } from "solid-js/store";
import { ColumnDef, createSolidTable, flexRender, getCoreRowModel } from "@tanstack/solid-table";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

import { Meal } from "../../../Types";
import { useAuthPB } from "../../config/pocketbase";
import { Button, DataInput, DataNumberInput } from "../../components";
import CopyMealModal from "../CopyMealModal";
import { USER_SESSION_MEAL_EXPAND } from "../../config/constants";
import { extractMealData } from "../../methods/userSessionMealMethods";
import { DraggableRow } from "./UserSessionMealDraggableRow";

export interface MealRow {
  meal: Meal;
  expanded: boolean;
}

interface Props {
  meals: Meal[];
  sessionID: string;
}

export const MealList: Component<Props> = (props) => {
  const [mealRows, setMealRows] = createStore<{ rows: MealRow[] }>({
    rows: props.meals.map((meal) => ({ meal, expanded: false })),
  });
  const [showCopyMeal, setShowCopyMeal] = createSignal(false);
  const { pb, updateRecord } = useAuthPB();

  const saveRow = async (recordID: string, field: string, newVal: any) => {
    try {
      await updateRecord("meals", recordID, field, newVal);
    } catch (e) {
      console.error(e);
    }
  };

  const deleteRow = async (index: number) => {
    const newRows = mealRows.rows.filter((_, ind) => ind !== index);

    try {
      setMealRows("rows", newRows);
      await pb.collection("userSessionExercises").delete(mealRows.rows[index].meal.id);

      await updateRecord(
        "userSessions",
        props.sessionID,
        "mealsOrder",
        newRows.map((r) => r.meal.id)
      );
    } catch (e) {
      console.log(e);
    }
  };

  const reorderRows = (draggedItemOldInd: number, draggedItemNewInd: number) => {
    // shuffle array
    const newRows = [...mealRows.rows];
    const draggedItem = newRows.splice(draggedItemOldInd, 1);

    const adjustedNewIndex =
      draggedItemNewInd > draggedItemOldInd ? draggedItemNewInd - 1 : draggedItemNewInd;
    newRows.splice(adjustedNewIndex, 0, ...draggedItem);

    setMealRows("rows", newRows);

    updateRecord(
      "userSessions",
      props.sessionID,
      "mealsOrder",
      newRows.map((r) => r.meal.id)
    ).catch(console.error);
  };

  const insertRowAndSync = async (index: number, record: Meal) => {
    const newRows = [...mealRows.rows];

    newRows.splice(index, 0, { meal: record, expanded: false });
    setMealRows("rows", newRows);

    await updateRecord(
      "userSessions",
      props.sessionID,
      "mealsOrder",
      newRows.map((r) => r.meal.id)
    );
  };

  const addRowAtIndex = async (index: number, duplicateInd?: number, createData?: { [k: string]: any }) => {
    if (createData) {
      const record = await pb.collection<Meal>("meals").create(createData, {
        expand: USER_SESSION_MEAL_EXPAND,
      });

      await insertRowAndSync(index + 1, record);
    } else if (duplicateInd !== undefined) {
      const record = await pb
        .collection<Meal>("meals")
        .create(extractMealData(mealRows.rows[duplicateInd].meal), { expand: USER_SESSION_MEAL_EXPAND });

      await insertRowAndSync(index + 1, record);
    }
  };

  const addMeal = async (mealToCopy?: Meal) => {
    const data = mealToCopy ? extractMealData(mealToCopy) : { userSession: props.sessionID };

    addRowAtIndex(mealRows.rows.length, undefined, data);
    setShowCopyMeal(false);
  };

  const expandAtInd = (index: number) => {
    setMealRows("rows", (_, i) => i === index, "expanded", true);
  };

  const collapse = () => {
    setMealRows("rows", (r) => r.expanded, "expanded", false);
  };

  const columns = createMemo<ColumnDef<MealRow>[]>(() => [
    {
      header: "meal",
      accessorKey: "name",
      cell: (ctx) => (
        <DataInput
          type="text"
          value={ctx.row.original.meal.name}
          onValueChange={(v) => setMealRows("rows", ctx.row.index, "meal", "name", v as string)}
          saveFunc={(v) => saveRow(ctx.row.original.meal.id, "name", v)}
        />
      ),
    },
    {
      header: "kj",
      accessorKey: "meal.kj",
      cell: (ctx) => (
        <div class="flex flex-row space-x-1">
          <DataNumberInput
            value={ctx.getValue() as number}
            onValueChange={(v) => setMealRows("rows", ctx.row.index, "meal", "kj", v as number)}
            saveFunc={(v) => saveRow(ctx.row.original.meal.id, "kj", v)}
          />
          <p>kj</p>
        </div>
      ),
    },
    {
      header: "protein",
      accessorKey: "meal.gramsProtein",
      cell: (ctx) => (
        <div class="flex flex-row space-x-1">
          <DataNumberInput
            value={ctx.getValue() as number}
            onValueChange={(v) => setMealRows("rows", ctx.row.index, "meal", "gramsProtein", v as number)}
            saveFunc={(v) => saveRow(ctx.row.original.meal.id, "gramsProtein", v)}
          />
          <p>g</p>
        </div>
      ),
    },
    {
      header: "carbs",
      accessorKey: "meal.gramsCarbohydrate",
      cell: (ctx) => (
        <div class="flex flex-row space-x-1">
          <DataNumberInput
            value={ctx.getValue() as number}
            onValueChange={(v) =>
              setMealRows("rows", ctx.row.index, "meal", "gramsCarbohydrate", v as number)
            }
            saveFunc={(v) => saveRow(ctx.row.original.meal.id, "gramsCarbohydrate", v)}
          />
          <p>g</p>
        </div>
      ),
    },
    {
      header: "fat",
      accessorKey: "meal.gramsFat",
      cell: (ctx) => (
        <div class="flex flex-row space-x-1">
          <DataNumberInput
            value={ctx.getValue() as number}
            onValueChange={(v) => setMealRows("rows", ctx.row.index, "meal", "gramsFat", v as number)}
            saveFunc={(v) => saveRow(ctx.row.original.meal.id, "gramsFat", v)}
          />
          <p>g</p>
        </div>
      ),
    },
  ]);

  const table = createSolidTable({
    get data() {
      return mealRows.rows;
    },
    columns: columns(),
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.meal.id, // required because row indexes will change
  });

  createEffect(() => {
    return monitorForElements({
      canMonitor({ source }) {
        return source.data.isUserSessionExerciseRow as boolean;
      },
      onDrop({ location, source }) {
        const target = location.current.dropTargets[0];
        if (!target) {
          return;
        }

        const sourceData = source.data;
        const targetData = target.data;

        if (!sourceData.isUserSessionExerciseRow || !targetData.isUserSessionExerciseRow) {
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
    <div class="mt-3">
      <div class="bg-white/25 rounded-lg">
        <div>
          <For each={table.getHeaderGroups()}>
            {(headerGroup) => (
              <div class="flex">
                <For each={headerGroup.headers}>
                  {(header) => (
                    <div class="text-left p-3 flex-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </div>
                  )}
                </For>
              </div>
            )}
          </For>
        </div>
        <div class="">
          <For each={table.getRowModel().rows}>
            {(row) => (
              <DraggableRow
                row={row}
                saveRow={saveRow}
                expandAtInd={expandAtInd}
                collapse={collapse}
                setMealRows={setMealRows}
              />
            )}
          </For>
        </div>
      </div>
      <div class="flex flex-row justify-end space-x-3 mt-4">
        <Button onClick={() => addMeal()}>Add Meal</Button>
        <Button onClick={() => setShowCopyMeal(true)}>Copy Meal</Button>
      </div>
      <Show when={showCopyMeal()}>
        <CopyMealModal setModalVisible={(v) => setShowCopyMeal(v)} addMeal={addMeal} />
      </Show>
    </div>
  );
};

export default MealList;
