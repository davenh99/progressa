import { Accessor, Component, createEffect, createMemo, createSignal, For, Show } from "solid-js";
import { createStore } from "solid-js/store";
import { ColumnDef, createSolidTable, flexRender, getCoreRowModel } from "@tanstack/solid-table";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

import { Meal, Tag, UserSession } from "../../../Types";
import { useAuthPB } from "../../config/pocketbase";
import { Button, DataInput } from "../../components";
import CopyMealModal from "../CopyMealModal";
import { USER_SESSION_MEAL_EXPAND } from "../../config/constants";
import { extractMealData } from "../../methods/userSessionMealMethods";
import { DraggableRow } from "./UserSessionMealDraggableRow";

interface Props {
  meals: Meal[];
  sessionID: string;
  sessionDay: Accessor<string>;
  createSession: (field?: string | undefined, newVal?: any) => Promise<UserSession | undefined>;
}

export interface MealRow {
  meal: Meal;
  expanded: boolean;
}

export const MealList: Component<Props> = (props) => {
  const [mealRows, setMealRows] = createStore<{ rows: MealRow[] }>({
    rows: props.meals.map((meal) => ({ meal, expanded: false })),
  });
  const [showCopyMeal, setShowCopyMeal] = createSignal(false);
  const { pb, user, updateRecord } = useAuthPB();

  const setTagsByID = (recordID: string, tags: Tag[]) => {
    setMealRows(
      "rows",
      mealRows.rows.map((row) =>
        row.meal.id === recordID
          ? {
              ...row,
              meal: {
                ...row.meal,
                expand: {
                  ...row.meal.expand,
                  tags,
                },
              },
            }
          : row
      )
    );
  };

  const setDescriptionByID = (recordID: string, description: string) => {
    setMealRows(
      "rows",
      mealRows.rows.map((row) =>
        row.meal.id === recordID
          ? {
              ...row,
              meal: {
                ...row.meal,
                description,
              },
            }
          : row
      )
    );
  };

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
    if (!props.sessionID) {
      const newSession = await props.createSession();
      if (newSession && createData) {
        createData.userSession = newSession.id;
      }
    }

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
    setMealRows("rows", (rows) =>
      rows.map((row, ind) => (ind === index ? { ...row, expanded: true } : { ...row, expanded: false }))
    );
  };

  const collapse = () => {
    setMealRows("rows", (rows) => rows.map((row) => ({ ...row, expanded: false })));
  };

  const columns = createMemo<ColumnDef<MealRow>[]>(() => [
    { header: "", id: "handle" },
    {
      header: "meal",
      accessorKey: "name",
      cell: (ctx) => (
        <DataInput
          type="text"
          initial={ctx.row.original.meal.name}
          saveFunc={(v) => saveRow(ctx.row.original.meal.id, "name", v)}
        />
      ),
    },
    {
      header: "kj",
      accessorKey: "meal.kj",
      cell: (ctx) => (
        <div class="flex flex-row space-x-1">
          <DataInput
            type="number"
            initial={ctx.getValue() as number}
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
          <DataInput
            type="number"
            initial={ctx.getValue() as number}
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
          <DataInput
            type="number"
            initial={ctx.getValue() as number}
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
          <DataInput
            type="number"
            initial={ctx.getValue() as number}
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
      <div>
        <For each={table.getRowModel().rows}>
          {(row) => (
            <DraggableRow
              row={row}
              saveRow={saveRow}
              expandAtInd={expandAtInd}
              collapse={collapse}
              setTagsByID={setTagsByID}
              setDescriptionByID={setDescriptionByID}
            />
          )}
        </For>
      </div>
      <Button onClick={() => addMeal()}>Add Meal</Button>
      <Button onClick={() => setShowCopyMeal(true)}>Copy Meal</Button>
      <Show when={showCopyMeal()}>
        <CopyMealModal setModalVisible={(v) => setShowCopyMeal(v)} addMeal={addMeal} />
      </Show>
    </div>
  );
};

export default MealList;
