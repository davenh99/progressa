import { Accessor, Component, createEffect, createMemo, createSignal, For, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { createStore } from "solid-js/store";
import Copy from "lucide-solid/icons/copy";
import Trash from "lucide-solid/icons/trash-2";
import { ColumnDef, createSolidTable, flexRender, getCoreRowModel } from "@tanstack/solid-table";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

import { useAuthPB } from "../../config/pocketbase";
import {
  Tag,
  UserSession,
  UserSessionCreateData,
  UserSessionExercise,
  UserSessionExerciseCreateData,
} from "../../../Types";
import { Button, DataCheckbox, DataInput, DataSlider, DataSelect, IconButton } from "../../components";
import {
  DraggableRow,
  Row,
  Table,
  TableBody,
  TableHeader,
  TableHeaderCell,
} from "./UserSessionExerciseTable";
import { getDropsetAddData, getGroupInds, getSupersetInds } from "../../methods/userSessionExerciseMethods";
import ExerciseSelectModal from "../ExerciseSelectModal";

interface Props {
  sessionExercises: UserSessionExercise[];
  sessionID: string;
  sessionDay: Accessor<string>;
  getSession: () => Promise<void>;
}

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
  const [showCreateSessionExercise, setShowCreateSessionExercise] = createSignal(false);
  const navigate = useNavigate();
  const { pb, user, updateRecord } = useAuthPB();

  const setTagsByID = (recordID: string, tags: Tag[]) => {
    setExerciseRows(
      "rows",
      exerciseRows.rows.map((row) =>
        row.sessionExercise.id === recordID
          ? {
              ...row,
              sessionExercise: {
                ...row.sessionExercise,
                expand: {
                  ...row.sessionExercise.expand,
                  tags,
                },
              },
            }
          : row
      )
    );
  };

  const setNotesByID = (recordID: string, notes: string) => {
    setExerciseRows(
      "rows",
      exerciseRows.rows.map((row) =>
        row.sessionExercise.id === recordID
          ? {
              ...row,
              sessionExercise: {
                ...row.sessionExercise,
                notes,
              },
            }
          : row
      )
    );
  };

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
            saveFunc={(v: boolean) => saveRow(ctx.row.original.sessionExercise.id, "isWarmup", v)}
          />
        </Show>
      ),
    },
    {
      accessorFn: (row) =>
        row.sessionExercise.expand?.exercise?.expand?.defaultMeasurementType?.numeric
          ? "sessionExercise.measurementNumeric"
          : "sessionExercise.measurementValue",
      header: "",
      id: "measurement",
      cell: (ctx) => {
        return (
          <Show
            when={ctx.row.original.sessionExercise.expand?.exercise?.expand?.defaultMeasurementType?.numeric}
            fallback={
              <DataSelect
                values={
                  ctx.row.original.sessionExercise.expand?.exercise?.expand?.defaultMeasurementType?.expand
                    ?.measurementValues_via_measurementType ?? []
                }
                initial={ctx.row.original.sessionExercise.expand?.measurementValue}
                saveFunc={(v: string) => saveRow(ctx.row.original.sessionExercise.id, "measurementValue", v)}
              />
            }
          >
            <div class="flex flex-row space-x-1">
              <DataInput
                type="number"
                initial={ctx.row.original.sessionExercise.measurementNumeric}
                saveFunc={(v: number) =>
                  saveRow(ctx.row.original.sessionExercise.id, "measurementNumeric", v)
                }
              />
              <p>
                {ctx.row.original.sessionExercise.expand.exercise.expand.defaultMeasurementType.displayName ??
                  ""}
              </p>
            </div>
          </Show>
        );
      },
    },
    {
      accessorKey: "sessionExercise.addedWeight",
      header: "",
      cell: (ctx) => (
        <div class="flex flex-row space-x-1">
          <DataInput
            type="number"
            initial={ctx.getValue() as number}
            saveFunc={(v: number) => saveRow(ctx.row.original.sessionExercise.id, "addedWeight", v)}
          />
          <p>kg</p>
        </div>
      ),
    },
    {
      accessorKey: "sessionExercise.perceivedEffort",
      header: "Perceived Effort",
      cell: (ctx) => (
        <DataSlider
          initial={ctx.getValue() as number}
          saveFunc={(v: number) => saveRow(ctx.row.original.sessionExercise.id, "perceivedEffort", v)}
        />
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
  ]);

  const saveRow = async (recordID: string, field: string, newVal: any) => {
    try {
      await updateRecord("userSessionExercises", recordID, field, newVal);
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
        "itemsOrder",
        newRows.map((r) => r.sessionExercise.id)
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
      "itemsOrder",
      newRows.map((r) => r.sessionExercise.id)
    ).catch(console.error);
  };

  const addRowsAtIndex = async (
    index: number,
    duplicateInds?: number[],
    createData?: UserSessionExerciseCreateData
  ) => {
    // create session if doesn't exist
    // TODO this is a double up! can dry out...
    if (!props.sessionID) {
      const createSessionData: UserSessionCreateData = {
        name: "",
        notes: "",
        tags: [],
        user: user.id,
        userDay: props.sessionDay(),
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
        expand:
          "exercise.defaultMeasurementType.measurementValues_via_measurementType, measurementValue, variation, tags",
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
        "itemsOrder",
        newRows.map((r) => r.sessionExercise.id)
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
            "exercise.defaultMeasurementType.measurementValues_via_measurementType, measurementValue, variation, tags",
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
            "exercise.defaultMeasurementType.measurementValues_via_measurementType, measurementValue, variation, tags",
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
        "itemsOrder",
        newRows.map((r) => r.sessionExercise.id)
      ).catch(console.error);
    }
  };

  const addSessionExercise = async (exerciseID: string, variationID?: string) => {
    const data: UserSessionExerciseCreateData = {
      user: user.id,
      userSession: props.sessionID,
      variation: variationID || undefined,
      exercise: exerciseID,
      perceivedEffort: 70,
    };

    addRowsAtIndex(exerciseRows.rows.length, null, data);
    setShowCreateSessionExercise(false);
  };

  const expandAtInd = (index: number) => {
    setExerciseRows("rows", (rows) =>
      rows.map((row, ind) => (ind === index ? { ...row, expanded: true } : { ...row, expanded: false }))
    );
  };

  const collapse = () => {
    setExerciseRows("rows", (rows) => rows.map((row) => ({ ...row, expanded: false })));
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

        let inds = [];
        if (sourceData.isGroup as boolean) {
          inds = getGroupInds(sourceData.ind as number, exerciseRows.rows);
        } else {
          inds = getSupersetInds(sourceData.ind as number, exerciseRows.rows);
        }

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
                saveRow={saveRow}
                isDropSet={!!row.original.sessionExercise.supersetParent}
                firstOfGroup={
                  row.index === 0 ||
                  row.original.sessionExercise.exercise !==
                    exerciseRows.rows[row.index - 1].sessionExercise.exercise ||
                  row.original.sessionExercise.variation !==
                    exerciseRows.rows[row.index - 1].sessionExercise.variation
                }
                lastOfGroup={
                  row.index === exerciseRows.rows.length - 1 ||
                  row.original.sessionExercise.exercise !==
                    exerciseRows.rows[row.index + 1].sessionExercise.exercise ||
                  row.original.sessionExercise.variation !==
                    exerciseRows.rows[row.index + 1].sessionExercise.variation
                }
                firstOfSuperset={!row.original.sessionExercise.supersetParent}
                lastOfSuperset={
                  row.index === exerciseRows.rows.length - 1 ||
                  !exerciseRows.rows[row.index + 1].sessionExercise.supersetParent
                }
                getGroupInds={() => getGroupInds(row.index, exerciseRows.rows)}
                expandAtInd={expandAtInd}
                collapse={collapse}
                setTagsByID={setTagsByID}
                setNotesByID={setNotesByID}
              />
            )}
          </For>
        </TableBody>
      </Table>
      <Button onClick={() => setShowCreateSessionExercise(true)} class="mt-2">
        Add Set
      </Button>
      <Show when={showCreateSessionExercise()}>
        <ExerciseSelectModal
          setModalVisible={setShowCreateSessionExercise}
          addSessionExercise={addSessionExercise}
        />
      </Show>
    </>
  );
};
