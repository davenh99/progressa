import { Component, createEffect, createMemo, createSignal, For, Show } from "solid-js";
import { SetStoreFunction } from "solid-js/store";
import { ColumnDef, createSolidTable, getCoreRowModel } from "@tanstack/solid-table";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import Ellipsis from "lucide-solid/icons/ellipsis-vertical";

import { useAuthPB } from "../../config/pocketbase";
import { UserSession, UserSessionExercise, UserSessionExerciseCreateData } from "../../../Types";
import { Button, DataSelect, IconButton, DataTime, DataNumberInput, RPESelect } from "../../components";
import { DraggableRow } from "./UserSessionExerciseDraggableRow";
import { getDropsetAddData, getGroupInds, getSupersetInds } from "../../methods/userSessionExerciseMethods";
import ExerciseSelectModal from "../ExerciseSelectModal";
import { USER_SESSION_EXERCISE_EXPAND } from "../../config/constants";
import ExerciseMoreModal from "../ExerciseMoreModal";

interface Props {
  sessionExercises: UserSessionExercise[];
  sessionID: string;
  setSession: SetStoreFunction<{
    session: UserSession | null;
  }>;
}

export const UserSessionExerciseList: Component<Props> = (props) => {
  const [showCreateSessionExercise, setShowCreateSessionExercise] = createSignal(false);
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

  const getSupersetParent = (index: number, data: UserSessionExercise[]): UserSessionExercise => {
    if (!data[index].supersetParent) {
      return data[index];
    } else {
      for (const row of data.slice(0, index + 1).reverse()) {
        if (row.id === data[index].supersetParent) {
          return row;
        }
      }
    }
    // we'll return this is we can't find a parent, although this would mean there's a big problem...
    return data[index];
  };

  const saveRow = async (recordID: string, field: string, newVal: any) => {
    try {
      await updateRecord("userSessionExercises", recordID, field, newVal);
    } catch (e) {
      console.error(e);
    }
  };

  const deleteRows = async (indices: number[]) => {
    const newRows = props.sessionExercises.filter((_, ind) => !indices.includes(ind));

    try {
      const delPromises = indices.map((index) =>
        pb.collection("userSessionExercises").delete(props.sessionExercises[index].id)
      );
      props.setSession("session", "expand", "userSessionExercises_via_userSession", newRows);
      await Promise.all(delPromises);
      await updateRecord(
        "userSessions",
        props.sessionID,
        "itemsOrder",
        newRows.map((r) => r.id)
      );
    } catch (e) {
      console.log(e);
    }
  };

  const reorderRows = (draggedItemsOldInd: number, draggedItemsNewInd: number, count: number) => {
    // shuffle array
    const newRows = [...props.sessionExercises];
    const draggedItems = newRows.splice(draggedItemsOldInd, count);

    const adjustedNewIndex =
      draggedItemsNewInd > draggedItemsOldInd ? draggedItemsNewInd - count : draggedItemsNewInd;
    newRows.splice(adjustedNewIndex, 0, ...draggedItems);

    props.setSession("session", "expand", "userSessionExercises_via_userSession", newRows);

    // send the updated list to 'itemsOrder'
    updateRecord(
      "userSessions",
      props.sessionID,
      "itemsOrder",
      newRows.map((r) => r.id)
    ).catch(console.error);
  };

  const buildCreateData = (row: UserSessionExercise, supersetParent?: string) => ({
    user: user.id,
    exercise: row.exercise,
    userSession: row.userSession,
    variation: row.variation,
    perceivedEffort: row.perceivedEffort,
    addedWeight: row.addedWeight,
    restAfter: row.restAfter,
    isWarmup: row.isWarmup,
    measurementNumeric: row.measurementNumeric,
    measurementValue: row.measurementValue,
    ...(supersetParent ? { supersetParent } : {}),
  });

  const insertRowsAndSync = async (index: number, records: UserSessionExercise[]) => {
    const newRows = [...props.sessionExercises];
    newRows.splice(index, 0, ...records);

    props.setSession("session", "expand", "userSessionExercises_via_userSession", newRows);

    await updateRecord(
      "userSessions",
      props.sessionID,
      "itemsOrder",
      newRows.map((r) => r.id)
    );
  };

  const addRowsAtIndex = async (
    index: number,
    duplicateInds?: number[],
    createData?: UserSessionExerciseCreateData
  ) => {
    if (createData) {
      const record = await pb.collection<UserSessionExercise>("userSessionExercises").create(createData, {
        expand: USER_SESSION_EXERCISE_EXPAND,
      });

      await insertRowsAndSync(index + 1, [record]);
    } else if (duplicateInds?.length) {
      pb.autoCancellation(false);

      const parentRecord = await pb
        .collection<UserSessionExercise>("userSessionExercises")
        .create(buildCreateData(props.sessionExercises[duplicateInds[0]]), {
          expand: USER_SESSION_EXERCISE_EXPAND,
        });

      const childPromises = duplicateInds.slice(1).map((ind) =>
        pb
          .collection<UserSessionExercise>("userSessionExercises")
          .create(buildCreateData(props.sessionExercises[ind], parentRecord.id), {
            expand: USER_SESSION_EXERCISE_EXPAND,
          })
      );

      const allRecords = [parentRecord, ...(await Promise.all(childPromises))];
      pb.autoCancellation(true);

      await insertRowsAndSync(index + duplicateInds.length, allRecords);
    }
  };

  const addSessionExercise = async (exerciseID: string, variationID?: string) => {
    const data: UserSessionExerciseCreateData = {
      user: user.id,
      userSession: props.sessionID,
      variation: variationID || undefined,
      exercise: exerciseID,
      perceivedEffort: 0,
    };

    addRowsAtIndex(props.sessionExercises.length, undefined, data);
    setShowCreateSessionExercise(false);
  };

  const columns = createMemo<ColumnDef<UserSessionExercise>[]>(() => [
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
                    "userSessionExercises_via_userSession",
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
                  <DataNumberInput
                    value={ctx.row.original.measurementNumeric || 0}
                    onValueChange={(v) =>
                      props.setSession(
                        "session",
                        "expand",
                        "userSessionExercises_via_userSession",
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
                    "userSessionExercises_via_userSession",
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
        <DataNumberInput
          value={ctx.getValue() as number}
          onValueChange={(v) =>
            props.setSession(
              "session",
              "expand",
              "userSessionExercises_via_userSession",
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
              "userSessionExercises_via_userSession",
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
              setSession={props.setSession}
              getSupersetParent={(i: number) => getSupersetParent(i, props.sessionExercises)}
            />
          )}
        </For>
      </div>
      <Button variantColor="good" onClick={() => setShowCreateSessionExercise(true)} class="mt-2">
        Add Set
      </Button>
      <Show when={showCreateSessionExercise()}>
        <ExerciseSelectModal
          setModalVisible={setShowCreateSessionExercise}
          addSessionExercise={addSessionExercise}
        />
      </Show>
      <Show when={showMoreExercise() && selectedExerciseInd() >= 0}>
        <ExerciseMoreModal
          sessionID={props.sessionID}
          setSession={props.setSession}
          setModalVisible={setShowMoreExercise}
          initialExercise={props.sessionExercises[selectedExerciseInd()]}
          deleteRow={() => deleteRows(getSupersetInds(selectedExerciseInd(), props.sessionExercises))}
          duplicateRow={() =>
            addRowsAtIndex(
              selectedExerciseInd(),
              getSupersetInds(selectedExerciseInd(), props.sessionExercises)
            )
          }
          addDropSet={() =>
            addRowsAtIndex(
              selectedExerciseInd(),
              undefined,
              getDropsetAddData(props.sessionExercises[selectedExerciseInd()])
            )
          }
        />
      </Show>
    </div>
  );
};
