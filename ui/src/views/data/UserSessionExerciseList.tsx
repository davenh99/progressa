import { Component, createEffect, createMemo, createSignal, For, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { createStore, produce } from "solid-js/store";
import Copy from "lucide-solid/icons/copy";
import Down from "lucide-solid/icons/chevron-down";
import Up from "lucide-solid/icons/chevron-up";
import Trash from "lucide-solid/icons/trash-2";
import { ColumnDef, createSolidTable, flexRender, getCoreRowModel } from "@tanstack/solid-table";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

import { useAuthPB } from "../../config/pocketbase";
import {
  Exercise,
  ExerciseVariation,
  UserSession,
  UserSessionCreateData,
  UserSessionExercise,
  UserSessionExerciseCreateData,
} from "../../../Types";
import { ExerciseList } from ".";
import { Button, DataCheckbox, DataInput, DataSlider, DataSelect, IconButton } from "../../components";
import { ExerciseVariationList } from "./ExerciseVariationList";
import {
  DraggableRow,
  Row,
  Table,
  TableBody,
  TableHeader,
  TableHeaderCell,
} from "./UserSessionExerciseTable";
import { getDropsetAddData, getSupersetInds } from "../../methods/userSessionExerciseMethods";
import { Portal } from "solid-js/web";

interface Props {
  sessionExercises: UserSessionExercise[];
  sessionID: string;
  sessionDay: string;
  getSession: () => Promise<void>;
}

const BaseNewExercise = {
  exercise: null as Exercise,
  variation: null as ExerciseVariation,
};

export interface SessionExerciseRow {
  sessionExercise: UserSessionExercise;
  expanded: boolean;
}

export const UserSessionExerciseList: Component<Props> = (props) => {
  const [exerciseRows, setExerciseRows] = createStore<{ rows: SessionExerciseRow[] }>({
    rows: props.sessionExercises.map((sessionExercise) => ({
      sessionExercise,
      expanded: false,
    })),
  });
  const [newExercise, setNewExercise] = createStore(BaseNewExercise);
  const [showCreateSessionExercise, setShowCreateSessionExercise] = createSignal(false);
  const [showAddExerciseVariation, setShowAddExerciseVariation] = createSignal(false);
  const [variations, setVariations] = createSignal<ExerciseVariation[]>([]);
  const navigate = useNavigate();
  const { pb, user, updateRecord } = useAuthPB();

  const columns = createMemo<ColumnDef<SessionExerciseRow>[]>(() => [
    {
      header: "",
      id: "handle",
    },
    {
      accessorKey: "sessionExercise.isWarmup",
      header: "Warmup?",
      cell: (ctx) => (
        <Show
          when={!ctx.row.original.sessionExercise.supersetParent}
          fallback={<p class="italic">dropset</p>}
        >
          <DataCheckbox
            initial={ctx.getValue() as boolean}
            saveFunc={(v: boolean) => saveRow(ctx.row.original.sessionExercise.id, v, "isWarmup")}
          />
        </Show>
      ),
    },
    {
      accessorFn: (row) =>
        row.sessionExercise.expand?.exercise?.expand?.measurementType?.numeric
          ? "sessionExercise.measurementNumeric"
          : "sessionExercise.measurementValue",
      header: "Measurement",
      cell: (ctx) => {
        return (
          <Show
            when={ctx.row.original.sessionExercise.expand?.exercise?.expand?.measurementType?.numeric}
            fallback={
              <DataSelect
                values={
                  ctx.row.original.sessionExercise.expand?.exercise?.expand?.measurementType?.expand
                    ?.measurementValues_via_measurementType ?? []
                }
                initial={ctx.row.original.sessionExercise.expand?.measurementValue}
                saveFunc={(v: string) => saveRow(ctx.row.original.sessionExercise.id, v, "measurementValue")}
              />
            }
          >
            <DataInput
              type="number"
              initial={ctx.row.original.sessionExercise.measurementNumeric}
              saveFunc={(v: number) => saveRow(ctx.row.original.sessionExercise.id, v, "measurementNumeric")}
            />
          </Show>
        );
      },
    },
    {
      accessorKey: "sessionExercise.addedWeight",
      header: "Weight Added (kg)",
      cell: (ctx) => (
        <DataInput
          type="number"
          initial={ctx.getValue() as number}
          saveFunc={(v: number) => saveRow(ctx.row.original.sessionExercise.id, v, "addedWeight")}
        />
      ),
    },
    {
      accessorKey: "sessionExercise.perceivedEffort",
      header: "Perceived Effort",
      cell: (ctx) => (
        <DataSlider
          initial={ctx.getValue() as number}
          saveFunc={(v: number) => saveRow(ctx.row.original.sessionExercise.id, v, "perceivedEffort")}
        />
      ),
    },
    {
      accessorKey: "sessionExercise.restAfter",
      header: "Rest After (s)",
      cell: (ctx) => (
        <Show when={!ctx.row.original.sessionExercise.supersetParent}>
          <DataInput
            type="number"
            initial={ctx.getValue() as number}
            saveFunc={(v: number) => saveRow(ctx.row.original.sessionExercise.id, v, "restAfter")}
          />
        </Show>
      ),
    },
    {
      header: "",
      id: "add-dropset",
      cell: (ctx) => (
        <Show when={!ctx.row.original.sessionExercise.supersetParent}>
          <Button onClick={() => addRowsAtIndex(ctx.row.index, null, getDropsetAddData(ctx.row.original))}>
            + dropset
          </Button>
        </Show>
      ),
    },
    {
      header: "",
      id: "duplicate",
      cell: (ctx) => (
        <IconButton
          onClick={() => addRowsAtIndex(ctx.row.index, getSupersetInds(ctx.row.index, exerciseRows.rows))}
        >
          <Copy />
        </IconButton>
      ),
    },
    {
      header: "",
      id: "delete",
      cell: (ctx) => (
        <IconButton onClick={() => deleteRows(getSupersetInds(ctx.row.index, exerciseRows.rows))}>
          <Trash />
        </IconButton>
      ),
    },
    {
      header: "",
      id: "expand",
      cell: (ctx) => (
        <Show when={!ctx.row.original.sessionExercise.supersetParent}>
          <Show
            when={ctx.row.original.expanded}
            fallback={
              <IconButton
                onClick={() =>
                  setExerciseRows("rows", (rows) =>
                    rows.map((row, ind) =>
                      ind === ctx.row.index ? { ...row, expanded: true } : { ...row, expanded: false }
                    )
                  )
                }
              >
                <Down />
              </IconButton>
            }
          >
            <IconButton
              onClick={() =>
                setExerciseRows("rows", (rows) => rows.map((row) => ({ ...row, expanded: false })))
              }
            >
              <Up />
            </IconButton>
          </Show>
        </Show>
      ),
    },
  ]);

  const saveRow = async (recordID: string, newVal: any, column: any) => {
    try {
      await updateRecord("userSessionExercises", recordID, newVal, column);
    } catch (e) {
      console.error(e);
    }
  };

  const deleteRows = async (indices: number[]) => {
    const newRows = exerciseRows.rows.filter((_, ind) => !indices.includes(ind));

    try {
      const delPromises = indices.map((index) =>
        pb.collection("userSessionExercises").delete(exerciseRows.rows[index].sessionExercise.id)
      );
      setExerciseRows("rows", newRows);
      await Promise.all(delPromises);
      await updateRecord(
        "userSessions",
        props.sessionID,
        newRows.map((r) => r.sessionExercise.id),
        "itemsOrder"
      );
    } catch (e) {
      console.log(e);
    }
  };

  const reorderRows = (draggedItemsOldInd: number, draggedItemsNewInd: number, count: number) => {
    // shuffle array
    const newRows = [...exerciseRows.rows];
    const draggedItems = newRows.splice(draggedItemsOldInd, count);

    const adjustedNewIndex =
      draggedItemsNewInd > draggedItemsOldInd ? draggedItemsNewInd - count : draggedItemsNewInd;
    newRows.splice(adjustedNewIndex, 0, ...draggedItems);

    setExerciseRows("rows", newRows);

    // send the updated list to 'itemsOrder'
    updateRecord(
      "userSessions",
      props.sessionID,
      newRows.map((r) => r.sessionExercise.id),
      "itemsOrder"
    ).catch(console.error);
  };

  const addRowsAtIndex = async (
    index: number,
    duplicateInds?: number[],
    createData?: UserSessionExerciseCreateData
  ) => {
    // create session if doesn't exist
    if (!props.sessionID) {
      const createSessionData: UserSessionCreateData = {
        name: "",
        notes: "",
        tags: [],
        user: user.id,
        userDay: props.sessionDay,
        userHeight: user.height,
        userWeight: user.weight,
        itemsOrder: [],
        sleepQuality: "fair",
      };

      const newSession = await pb.collection<UserSession>("userSessions").create(createSessionData);
      if (createData) {
        createData.userSession = newSession.id;
      }

      // maybe move below to end if problematic
      navigate(`/workouts/log/${newSession.id}`, { replace: true });
    }

    // create item/s
    if (createData) {
      // add to array
      const record = await pb.collection<UserSessionExercise>("userSessionExercises").create(createData, {
        expand: "exercise.measurementType.measurementValues_via_measurementType, measurementValue, variation",
      });

      const newRows = [...exerciseRows.rows];
      newRows.splice(index + 1, 0, {
        sessionExercise: record,
        expanded: false,
      });
      setExerciseRows("rows", newRows);

      // send the updated list to 'itemsOrder'
      updateRecord(
        "userSessions",
        props.sessionID,
        newRows.map((r) => r.sessionExercise.id),
        "itemsOrder"
      ).catch(console.error);
    } else if (duplicateInds) {
      pb.autoCancellation(false);

      const createData = {
        user: user.id,
        exercise: exerciseRows.rows[duplicateInds[0]].sessionExercise.exercise,
        perceivedEffort: exerciseRows.rows[duplicateInds[0]].sessionExercise.perceivedEffort,
        userSession: exerciseRows.rows[duplicateInds[0]].sessionExercise.userSession,
        variation: exerciseRows.rows[duplicateInds[0]].sessionExercise.variation,
        addedWeight: exerciseRows.rows[duplicateInds[0]].sessionExercise.addedWeight,
        restAfter: exerciseRows.rows[duplicateInds[0]].sessionExercise.restAfter,
        isWarmup: exerciseRows.rows[duplicateInds[0]].sessionExercise.isWarmup,
        measurementNumeric: exerciseRows.rows[duplicateInds[0]].sessionExercise.measurementNumeric,
        measurementValue: exerciseRows.rows[duplicateInds[0]].sessionExercise.measurementValue,
      };
      const parentRecord = await pb
        .collection<UserSessionExercise>("userSessionExercises")
        .create(createData, {
          expand:
            "exercise.measurementType.measurementValues_via_measurementType, measurementValue, variation",
        });
      const newRecords = [parentRecord];

      // add to array
      const createPromises = duplicateInds.slice(1).map((ind) => {
        const createData = {
          user: user.id,
          exercise: exerciseRows.rows[ind].sessionExercise.exercise,
          perceivedEffort: exerciseRows.rows[ind].sessionExercise.perceivedEffort,
          userSession: exerciseRows.rows[ind].sessionExercise.userSession,
          variation: exerciseRows.rows[ind].sessionExercise.variation,
          addedWeight: exerciseRows.rows[ind].sessionExercise.addedWeight,
          restAfter: exerciseRows.rows[ind].sessionExercise.restAfter,
          isWarmup: exerciseRows.rows[ind].sessionExercise.isWarmup,
          measurementNumeric: exerciseRows.rows[ind].sessionExercise.measurementNumeric,
          measurementValue: exerciseRows.rows[ind].sessionExercise.measurementValue,
          supersetParent: parentRecord.id,
        };

        return pb.collection<UserSessionExercise>("userSessionExercises").create(createData, {
          expand:
            "exercise.measurementType.measurementValues_via_measurementType, measurementValue, variation",
        });
      });
      newRecords.push(...(await Promise.all(createPromises)));
      pb.autoCancellation(true);

      const newRows = [...exerciseRows.rows];
      const newRowsToInsert = newRecords.map((record) => ({ sessionExercise: record, expanded: false }));

      newRows.splice(index + duplicateInds.length, 0, ...newRowsToInsert);
      setExerciseRows("rows", newRows);

      // send the updated list to 'itemsOrder'
      updateRecord(
        "userSessions",
        props.sessionID,
        newRows.map((r) => r.sessionExercise.id),
        "itemsOrder"
      ).catch(console.error);
    }
  };

  const addSessionExercise = async () => {
    const data: UserSessionExerciseCreateData = {
      user: user.id,
      userSession: props.sessionID,
      variation: newExercise.variation?.id || undefined,
      exercise: newExercise.exercise.id,
      perceivedEffort: 70,
    };

    if (variations.length > 0 && !newExercise.variation) {
      alert("must select a variation for this exercise");
    } else {
      addRowsAtIndex(exerciseRows.rows.length, null, data);
      setShowCreateSessionExercise(false);
    }
  };

  const table = createSolidTable({
    get data() {
      return exerciseRows.rows;
    },
    columns: columns(),
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.sessionExercise.id, // required because row indexes will change
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

        const inds = getSupersetInds(sourceData.ind as number, exerciseRows.rows);

        reorderRows(sourceData.ind as number, newInd, inds.length);
      },
    });
  });

  // in case the base data changes, refresh
  createEffect(() => {
    setExerciseRows({
      rows: props.sessionExercises.map((sessionExercise) => ({
        sessionExercise,
        expanded: false,
      })),
    });
  });

  return (
    <>
      <Table>
        <TableHeader>
          <For each={table.getHeaderGroups()}>
            {(headerGroup) => (
              <Row>
                <For each={headerGroup.headers}>
                  {(header) => (
                    <TableHeaderCell>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHeaderCell>
                  )}
                </For>
              </Row>
            )}
          </For>
        </TableHeader>
        <TableBody>
          <For each={table.getRowModel().rows}>
            {(row) => (
              <DraggableRow
                row={row}
                isDropSet={!!row.original.sessionExercise.supersetParent}
                firstOfGroup={
                  row.index === 0 ||
                  row.original.sessionExercise.exercise !==
                    exerciseRows.rows[row.index - 1].sessionExercise.exercise
                }
                lastOfGroup={
                  row.index === exerciseRows.rows.length - 1 ||
                  row.original.sessionExercise.exercise !==
                    exerciseRows.rows[row.index + 1].sessionExercise.exercise
                }
                firstOfSuperset={!row.original.sessionExercise.supersetParent}
                lastOfSuperset={
                  row.index === exerciseRows.rows.length - 1 ||
                  !exerciseRows.rows[row.index + 1].sessionExercise.supersetParent
                }
              />
            )}
          </For>
        </TableBody>
      </Table>
      <Button onClick={() => setShowCreateSessionExercise(true)}>Add Set</Button>
      <Show when={showCreateSessionExercise()}>
        <Portal>
          <div
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/35"
            onClick={() => setShowCreateSessionExercise(false)}
          >
            <div class="bg-white rounded-xl shadow-lg p-6 w-[400px]" onClick={(e) => e.stopPropagation()}>
              <p>Select Exercise</p>
              <ExerciseList
                onClick={(exercise: Exercise) => {
                  if (exercise.expand?.exerciseVariations_via_exercise?.length > 0) {
                    setShowAddExerciseVariation(true);
                    setVariations(exercise.expand.exerciseVariations_via_exercise);
                  }
                  setNewExercise("exercise", exercise);
                }}
              />
              <Show when={showAddExerciseVariation()}>
                <ExerciseVariationList
                  variations={variations}
                  onClick={(v) => {
                    setShowAddExerciseVariation(false);
                    setNewExercise("variation", v);
                  }}
                />
              </Show>
              <p>
                Selected: {newExercise.exercise?.name ?? "None"}{" "}
                {newExercise.variation?.name ? `(${newExercise.variation?.name})` : ""}
              </p>
              <Button onClick={addSessionExercise}>Add</Button>
            </div>
          </div>
        </Portal>
      </Show>
    </>
  );
};
