import { Component, createEffect, createMemo, createSignal, For, Show } from "solid-js";
import { SetStoreFunction } from "solid-js/store";
import { ColumnDef, createSolidTable, getCoreRowModel } from "@tanstack/solid-table";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import Ellipsis from "lucide-solid/icons/ellipsis-vertical";

import { useAuthPB } from "../../config/pocketbase";
import { Routine, Session, SessionExercise, SessionExerciseCreateData } from "../../../Types";
import { Button, DataSelect, IconButton, DataTime, NumberInput, RPESelect } from "../../components";
import { DraggableRow } from "../exercises/SessionOrRoutineExerciseDraggableRow";
import { getDropsetAddData, getGroupInds, getSupersetInds } from "../../methods/sessionExercise";
import ExerciseSelectModal from "../exercises/ExerciseSelectModal";
import { SESSION_EXERCISE_EXPAND } from "../../../constants";
import SessionExerciseMoreModal from "./SessionExerciseMoreModal";
import RoutineSelectModal from "../routines/RoutineSelectModal";

interface Props {
  sessionExercises: SessionExercise[];
  sessionID: string;
  setSession: SetStoreFunction<{
    session: Session | null;
  }>;
}

export const SessionExerciseList: Component<Props> = (props) => {
  const [showCreateSessionExercise, setShowCreateSessionExercise] = createSignal(false);
  const [showAddRoutine, setShowAddRoutine] = createSignal(false);
  const [showMoreExercise, setShowMoreExercise] = createSignal(false);
  const [selectedExerciseInd, setSelectedExerciseInd] = createSignal(-1);
  const { pb, user, updateRecord } = useAuthPB();

  const setNumbers = createMemo(() => {
    const setNumbers = [];
    let curSet = 0;

    for (const se of props.sessionExercises) {
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
      await updateRecord("sessionExercises", recordID, field, newVal);
    } catch (e) {
      console.error(e);
    }
  };

  const deleteRows = async (indices: number[]) => {
    const newRows = props.sessionExercises.filter((_, ind) => !indices.includes(ind));

    try {
      const delPromises = indices.map((index) =>
        pb.collection("sessionExercises").delete(props.sessionExercises[index].id)
      );
      await Promise.all(delPromises);
      await updateRecord(
        "sessions",
        props.sessionID,
        "exercisesOrder",
        newRows.map((r) => r.id)
      );

      props.setSession("session", "expand", "sessionExercises_via_session", newRows);
    } catch (e) {
      console.error(e);
    }
  };

  const reorderRows = (draggedItemsOldInd: number, draggedItemsNewInd: number, count: number) => {
    // shuffle array
    const newRows = [...props.sessionExercises];
    const draggedItems = newRows.splice(draggedItemsOldInd, count);

    const adjustedNewIndex =
      draggedItemsNewInd > draggedItemsOldInd ? draggedItemsNewInd - count : draggedItemsNewInd;
    newRows.splice(adjustedNewIndex, 0, ...draggedItems);

    props.setSession("session", "expand", "sessionExercises_via_session", newRows);

    // send the updated list to 'exercisesOrder'
    updateRecord(
      "sessions",
      props.sessionID,
      "exercisesOrder",
      newRows.map((r) => r.id)
    ).catch(console.error);
  };

  const insertRowsAndSync = async (index: number, records: SessionExercise[]) => {
    const newRows = [...props.sessionExercises];
    newRows.splice(index, 0, ...records);

    props.setSession("session", "expand", "sessionExercises_via_session", newRows);

    await updateRecord(
      "sessions",
      props.sessionID,
      "exercisesOrder",
      newRows.map((r) => r.id)
    );
  };

  const addSessionExercise = async (exerciseID: string, variationID?: string) => {
    const data: SessionExerciseCreateData = {
      user: user.id,
      session: props.sessionID,
      variation: variationID || undefined,
      exercise: exerciseID,
      perceivedEffort: 0,
    };

    const record = await pb.collection<SessionExercise>("sessionExercises").create(data, {
      expand: SESSION_EXERCISE_EXPAND,
    });

    await insertRowsAndSync(props.sessionExercises.length + 1, [record]);
    setShowCreateSessionExercise(false);
  };

  const addDropset = async (index: number) => {
    const data = getDropsetAddData(props.sessionExercises[index]);

    const record = await pb.collection<SessionExercise>("sessionExercises").create(data, {
      expand: SESSION_EXERCISE_EXPAND,
    });

    await insertRowsAndSync(index + 1, [record]);
    setShowCreateSessionExercise(false);
  };

  const duplicateRow = async (index: number) => {
    try {
      const newSession = await pb.send<Session>(`/session/duplicateRow`, {
        method: "POST",
        headers: {
          Accept: "text/plain",
        },
        body: {
          recordId: props.sessionExercises[index].id,
          rowIndex: index,
        },
      });
      props.setSession({ session: newSession });
    } catch (e) {
      console.error(e);
    }
  };

  const importFromRoutine = async (routine: Routine, index: number) => {
    try {
      const newSession = await pb.send<Session>(`/session/importRoutine`, {
        method: "POST",
        headers: {
          Accept: "text/plain",
        },
        body: {
          importRoutineId: routine.id,
          insertRecordId: props.sessionID,
          insertIndex: index,
        },
      });
      props.setSession({ session: newSession });
    } catch (e) {
      console.error(e);
    }
  };

  const columns = createMemo<ColumnDef<SessionExercise>[]>(() => [
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
        return (
          <Show
            when={ctx.row.original.expand?.exercise?.expand?.defaultMeasurementType?.numeric}
            fallback={
              <DataSelect
                values={
                  ctx.row.original.expand?.exercise?.expand?.defaultMeasurementType?.expand
                    ?.measurementValues_via_measurementType ?? []
                }
                // TODO maybe we don't need to switch between null and undefined here?
                value={ctx.row.original.expand?.measurementValue ?? null}
                onValueChange={(v) =>
                  props.setSession(
                    "session",
                    "expand",
                    "sessionExercises_via_session",
                    ctx.row.index,
                    "expand",
                    "measurementValue",
                    v ?? undefined
                  )
                }
                saveFunc={(v: string) => saveRow(ctx.row.original.id, "measurementValue", v)}
              />
            }
          >
            <Show
              when={ctx.row.original.expand?.exercise?.defaultMeasurementType === "8ldlgtjjvy3ircl"}
              fallback={
                <div class="flex flex-row space-x-1">
                  <NumberInput
                    rawValue={ctx.row.original.measurementNumeric || 0}
                    onRawValueChange={(v) =>
                      props.setSession(
                        "session",
                        "expand",
                        "sessionExercises_via_session",
                        ctx.row.index,
                        "measurementNumeric",
                        v as number
                      )
                    }
                    saveFunc={(v) => saveRow(ctx.row.original.id, "measurementNumeric", v)}
                  />
                </div>
              }
            >
              <DataTime
                value={ctx.row.original.measurementNumeric || 0}
                onValueChange={(v) =>
                  props.setSession(
                    "session",
                    "expand",
                    "sessionExercises_via_session",
                    ctx.row.index,
                    "measurementNumeric",
                    v
                  )
                }
                saveFunc={(v) => saveRow(ctx.row.original.id, "measurementNumeric", v)}
              />
            </Show>
          </Show>
        );
      },
    },
    {
      accessorKey: "addedWeight",
      cell: (ctx) => (
        <NumberInput
          rawValue={ctx.getValue() as number}
          onRawValueChange={(v) =>
            props.setSession(
              "session",
              "expand",
              "sessionExercises_via_session",
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
      accessorKey: "perceivedEffort",
      cell: (ctx) => (
        <RPESelect
          value={ctx.row.original.perceivedEffort}
          onChange={(v) => {
            props.setSession(
              "session",
              "expand",
              "sessionExercises_via_session",
              ctx.row.index,
              "perceivedEffort",
              v
            );
            saveRow(ctx.row.original.id, "perceivedEffort", v);
          }}
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
      return props.sessionExercises;
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
          inds = getGroupInds(sourceData.ind as number, props.sessionExercises);
        } else {
          inds = getSupersetInds(sourceData.ind as number, props.sessionExercises);
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
                row.original.exercise !== props.sessionExercises[row.index - 1].exercise ||
                row.original.variation !== props.sessionExercises[row.index - 1].variation
              }
              lastOfGroup={
                row.index === props.sessionExercises.length - 1 ||
                row.original.exercise !== props.sessionExercises[row.index + 1].exercise ||
                row.original.variation !== props.sessionExercises[row.index + 1].variation
              }
              firstOfSuperset={!row.original.supersetParent}
              lastOfSuperset={
                row.index === props.sessionExercises.length - 1 ||
                !props.sessionExercises[row.index + 1].supersetParent
              }
              getGroupInds={() => getGroupInds(row.index, props.sessionExercises)}
              timeInput={
                <DataTime
                  value={row.original.restAfter}
                  onValueChange={(v) =>
                    props.setSession(
                      "session",
                      "expand",
                      "sessionExercises_via_session",
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
      <Button variantColor="good" onClick={() => setShowCreateSessionExercise(true)} class="mt-2">
        Add Set
      </Button>
      <Button variantColor="good" onClick={() => setShowAddRoutine(true)} class="mt-2">
        Add Routine
      </Button>
      <Show when={showCreateSessionExercise()}>
        <ExerciseSelectModal
          setModalVisible={setShowCreateSessionExercise}
          addExercise={addSessionExercise}
        />
      </Show>
      <Show when={showAddRoutine()}>
        <RoutineSelectModal
          setModalVisible={setShowAddRoutine}
          addRoutine={(r) => importFromRoutine(r, props.sessionExercises.length)}
        />
      </Show>
      <Show
        when={
          showMoreExercise() &&
          selectedExerciseInd() >= 0 &&
          selectedExerciseInd() < props.sessionExercises.length
        }
      >
        <SessionExerciseMoreModal
          sessionID={props.sessionID}
          setSession={props.setSession}
          setModalVisible={setShowMoreExercise}
          initialExercise={props.sessionExercises[selectedExerciseInd()]}
          deleteRow={async () =>
            await deleteRows(getSupersetInds(selectedExerciseInd(), props.sessionExercises))
          }
          duplicateRow={async () => await duplicateRow(selectedExerciseInd())}
          addDropSet={async () => await addDropset(selectedExerciseInd())}
        />
      </Show>
    </div>
  );
};
