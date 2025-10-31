import { Component, createEffect, createMemo, createSignal, For, Show } from "solid-js";
import { SetStoreFunction } from "solid-js/store";
import { useAuthPB } from "../../config/pocketbase";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import Ellipsis from "lucide-solid/icons/ellipsis-vertical";
import Plus from "lucide-solid/icons/plus";

import { Routine, RoutineExercise, RoutineExerciseCreateData } from "../../../Types";
import RoutineExerciseMoreModal from "./RoutineExerciseMoreModal";
import ExerciseSelectModal from "../exercises/ExerciseSelectModal";
import {
  Button,
  DataSelect,
  DataTime,
  IconButton,
  MeasurementValueSelect,
  NumberInput,
} from "../../components";
import { SESSION_EXERCISE_EXPAND } from "../../../constants";
import { getGroupInds, getSupersetInds } from "../../methods/sessionExercise";
import { ColumnDef, createSolidTable, getCoreRowModel } from "@tanstack/solid-table";
import RoutineSelectModal from "./RoutineSelectModal";
import { getDropsetAddData } from "../../methods/routineExercises";
import { DraggableRow } from "../exercises/SessionOrRoutineExerciseDraggableRow";

interface Props {
  routineExercises: RoutineExercise[];
  routineId: string;
  setRoutine: SetStoreFunction<{
    routine: Routine | null;
  }>;
}

export const RoutineExerciseList: Component<Props> = (props) => {
  const [showCreateRoutineExercise, setShowCreateRoutineExercise] = createSignal(false);
  const [showAddRoutine, setShowAddRoutine] = createSignal(false);
  const [showMoreExercise, setShowMoreExercise] = createSignal(false);
  const [selectedExerciseInd, setSelectedExerciseInd] = createSignal(-1);
  const { pb, updateRecord, routineToSortedExercises } = useAuthPB();

  const setNumbers = createMemo(() => {
    const setNumbers = [];
    let curSet = 0;

    for (const se of props.routineExercises) {
      if (se.isWarmup) {
        setNumbers.push("W");
      } else if (se.supersetParent) {
        setNumbers.push("D");
      } else {
        setNumbers.push(++curSet);
      }
    }
    return setNumbers;
  });

  const saveRow = async (recordID: string, field: string, newVal: any) => {
    try {
      await updateRecord("routineExercises", recordID, field, newVal);
    } catch (e) {
      console.error(e);
    }
  };

  const deleteRows = async (indices: number[]) => {
    const newRows = props.routineExercises.filter((_, ind) => !indices.includes(ind));

    try {
      const delPromises = indices.map((index) =>
        pb.collection("routineExercises").delete(props.routineExercises[index].id)
      );
      await Promise.all(delPromises);
      await updateRecord(
        "routines",
        props.routineId,
        "exercisesOrder",
        newRows.map((r) => r.id)
      );

      props.setRoutine("routine", "expand", "routineExercises_via_routine", newRows);
    } catch (e) {
      console.error(e);
    }
  };

  const reorderRows = (draggedItemsOldInd: number, draggedItemsNewInd: number, count: number) => {
    // shuffle array
    const newRows = [...props.routineExercises];
    const draggedItems = newRows.splice(draggedItemsOldInd, count);

    const adjustedNewIndex =
      draggedItemsNewInd > draggedItemsOldInd ? draggedItemsNewInd - count : draggedItemsNewInd;
    newRows.splice(adjustedNewIndex, 0, ...draggedItems);

    props.setRoutine("routine", "expand", "routineExercises_via_routine", newRows);

    // send the updated list to 'exercisesOrder'
    updateRecord(
      "routines",
      props.routineId,
      "exercisesOrder",
      newRows.map((r) => r.id)
    ).catch(console.error);
  };

  const insertRowsAndSync = async (index: number, records: RoutineExercise[]) => {
    const newRows = [...props.routineExercises];
    newRows.splice(index, 0, ...records);

    props.setRoutine("routine", "expand", "routineExercises_via_routine", newRows);

    await updateRecord(
      "routines",
      props.routineId,
      "exercisesOrder",
      newRows.map((r) => r.id)
    );
  };

  const addRoutineExercise = async (exerciseID: string, variationID?: string) => {
    const data: RoutineExerciseCreateData = {
      routine: props.routineId,
      variation: variationID || undefined,
      exercise: exerciseID,
    };
    const record = await pb.collection<RoutineExercise>("routineExercises").create(data, {
      expand: SESSION_EXERCISE_EXPAND,
    });

    await insertRowsAndSync(props.routineExercises.length + 1, [record]);
    setShowCreateRoutineExercise(false);
  };

  const addDropset = async (index: number) => {
    const data = getDropsetAddData(props.routineExercises[index]);

    const record = await pb.collection<RoutineExercise>("routineExercises").create(data, {
      expand: SESSION_EXERCISE_EXPAND,
    });

    await insertRowsAndSync(index + 1, [record]);
    setShowCreateRoutineExercise(false);
  };

  const duplicateRow = async (index: number) => {
    try {
      const newRoutine = await pb.send<Routine>(`/routine/duplicateRow`, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: {
          exerciseRowId: props.routineExercises[index].id,
          rowIndex: index,
        },
      });
      props.setRoutine({ routine: routineToSortedExercises(newRoutine) });
    } catch (e) {
      console.error(e);
    }

    setShowMoreExercise(false);
  };

  const importFromRoutine = async (routine: Routine, index: number) => {
    try {
      const newRoutine = await pb.send<Routine>(`/routine/importRoutine`, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: {
          importRoutineId: routine.id,
          sessionOrRoutineId: props.routineId,
          insertIndex: index,
        },
      });
      props.setRoutine({ routine: routineToSortedExercises(newRoutine) });
    } catch (e) {
      console.error(e);
    }

    setShowAddRoutine(false);
  };

  const columns = createMemo<ColumnDef<RoutineExercise>[]>(() => [
    {
      header: "Set Type",
      cell: (ctx) => <p>{setNumbers()[ctx.row.index]}</p>,
    },
    {
      accessorFn: (row) =>
        row.expand?.exercise?.expand?.defaultMeasurementType?.numeric
          ? "measurementNumeric"
          : "measurementValue",
      id: "measurement",
      cell: (ctx) => {
        const mType = ctx.row.original.expand?.exercise?.expand?.defaultMeasurementType;
        const key = mType?.numeric ? "measurementNumeric" : "measurementValue";

        return mType ? (
          <MeasurementValueSelect
            value={ctx.row.original.expand?.measurementValue ?? null}
            valueNumeric={ctx.row.original.measurementNumeric || 0}
            key={key}
            numeric={mType.numeric ?? false}
            measurementType={mType.id}
            onValueChange={(v) =>
              props.setRoutine(
                "routine",
                "expand",
                "routineExercises_via_routine",
                ctx.row.index,
                "expand",
                key as any,
                v ?? undefined
              )
            }
            saveFunc={(v) => saveRow(ctx.row.original.id, key, v)}
          />
        ) : (
          <></>
        );
      },
    },
    {
      accessorFn: (row) =>
        row.expand?.exercise?.expand?.defaultMeasurementType2?.numeric
          ? "measurement2Numeric"
          : "measurement2Value",
      id: "measurement2",
      cell: (ctx) => {
        const mType = ctx.row.original.expand?.exercise?.expand?.defaultMeasurementType2;
        const key = mType?.numeric ? "measurement2Numeric" : "measurement2Value";

        return mType ? (
          <MeasurementValueSelect
            value={ctx.row.original.expand?.measurement2Value ?? null}
            valueNumeric={ctx.row.original.measurement2Numeric || 0}
            key={key}
            numeric={mType.numeric ?? false}
            measurementType={mType.id}
            onValueChange={(v) =>
              props.setRoutine(
                "routine",
                "expand",
                "routineExercises_via_routine",
                ctx.row.index,
                "expand",
                key as any,
                v ?? undefined
              )
            }
            saveFunc={(v) => {
              console.log(`saving ${key} as ${v} for ${ctx.row.original.id}`);
              return saveRow(ctx.row.original.id, key, v);
            }}
          />
        ) : (
          <></>
        );
      },
    },
    {
      accessorKey: "addedWeight",
      cell: (ctx) => (
        <NumberInput
          rawValue={ctx.getValue() as number}
          onRawValueChange={(v) =>
            props.setRoutine(
              "routine",
              "expand",
              "routineExercises_via_routine",
              ctx.row.index,
              "addedWeight",
              v as number
            )
          }
          saveFunc={(v) => saveRow(ctx.row.original.id, "addedWeight", v)}
        />
      ),
    },
    {
      id: "more",
      cell: (ctx) => (
        <IconButton
          onClick={() => {
            setShowMoreExercise(true);
            setSelectedExerciseInd(ctx.row.index);
          }}
        >
          <Ellipsis />
        </IconButton>
      ),
    },
  ]);

  const table = createSolidTable({
    get data() {
      return props.routineExercises;
    },
    columns: columns(),
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id, // required because row indexes will change
  });

  createEffect(() => {
    return monitorForElements({
      canMonitor({ source }) {
        return source.data.isExerciseRow as boolean;
      },
      onDrop({ location, source }) {
        const target = location.current.dropTargets[0];
        if (!target) {
          return;
        }

        const sourceData = source.data;
        const targetData = target.data;

        if (!sourceData.isExerciseRow || !targetData.isExerciseRow) {
          return;
        }

        if ((sourceData.ind as number) < 0 || (targetData.ind as number) < 0) {
          return;
        }

        const closestEdgeOfTarget = extractClosestEdge(targetData);

        const newInd =
          closestEdgeOfTarget === "top" ? (targetData.ind as number) : (targetData.ind as number) + 1;

        let inds = [];
        if (sourceData.isGroup as boolean) {
          inds = getGroupInds(sourceData.ind as number, props.routineExercises);
        } else {
          inds = getSupersetInds(sourceData.ind as number, props.routineExercises);
        }

        reorderRows(sourceData.ind as number, newInd, inds.length);
      },
    });
  });

  return (
    <div class="flex flex-col items-center">
      <div class="w-full">
        <For each={table.getRowModel().rows}>
          {(row) => (
            <DraggableRow
              row={row}
              saveRow={saveRow}
              firstOfGroup={
                row.index === 0 ||
                row.original.exercise !== props.routineExercises[row.index - 1].exercise ||
                row.original.variation !== props.routineExercises[row.index - 1].variation
              }
              lastOfGroup={
                row.index === props.routineExercises.length - 1 ||
                row.original.exercise !== props.routineExercises[row.index + 1].exercise ||
                row.original.variation !== props.routineExercises[row.index + 1].variation
              }
              firstOfSuperset={!row.original.supersetParent}
              lastOfSuperset={
                row.index === props.routineExercises.length - 1 ||
                !props.routineExercises[row.index + 1].supersetParent
              }
              getGroupInds={() => getGroupInds(row.index, props.routineExercises)}
              timeInput={
                <DataTime
                  value={row.original.restAfter}
                  onValueChange={(v) =>
                    props.setRoutine(
                      "routine",
                      "expand",
                      "routineExercises_via_routine",
                      row.index,
                      "restAfter",
                      v
                    )
                  }
                  saveFunc={(v: number) => saveRow(row.original.id, "restAfter", v)}
                />
              }
            />
          )}
        </For>
      </div>
      <Button
        variantColor="good"
        onClick={() => setShowCreateRoutineExercise(true)}
        class="mt-2 flex items-center pl-1 pr-2"
      >
        <Plus size={20} /> Set
      </Button>
      <Button
        variantColor="good"
        onClick={() => setShowAddRoutine(true)}
        class="mt-2 flex items-center pl-1 pr-2"
      >
        <Plus size={20} /> Routine
      </Button>
      <Show when={showCreateRoutineExercise()}>
        <ExerciseSelectModal
          setModalVisible={setShowCreateRoutineExercise}
          addExercise={addRoutineExercise}
        />
      </Show>
      <Show when={showAddRoutine()}>
        <RoutineSelectModal
          setModalVisible={setShowAddRoutine}
          addRoutine={(r) => importFromRoutine(r, props.routineExercises.length)}
        />
      </Show>
      <Show
        when={
          showMoreExercise() &&
          selectedExerciseInd() >= 0 &&
          selectedExerciseInd() < props.routineExercises.length
        }
      >
        <RoutineExerciseMoreModal
          routineId={props.routineId}
          setRoutine={props.setRoutine}
          setModalVisible={setShowMoreExercise}
          initialExercise={props.routineExercises[selectedExerciseInd()]}
          deleteRow={async () =>
            await deleteRows(getSupersetInds(selectedExerciseInd(), props.routineExercises))
          }
          duplicateRow={async () => await duplicateRow(selectedExerciseInd())}
          addDropSet={async () => await addDropset(selectedExerciseInd())}
        />
      </Show>
    </div>
  );
};

export default RoutineExerciseList;
