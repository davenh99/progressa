import { Accessor, Component, createEffect, createMemo, createSignal, For, Show } from "solid-js";
import { createStore } from "solid-js/store";
import Copy from "lucide-solid/icons/copy";
import Trash from "lucide-solid/icons/trash-2";
import { ColumnDef, createSolidTable, flexRender, getCoreRowModel } from "@tanstack/solid-table";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

import { useAuthPB } from "../../config/pocketbase";
import { Tag, UserSessionExercise, UserSessionExerciseCreateData } from "../../../Types";
import {
  Button,
  DataCheckbox,
  DataInput,
  DataSlider,
  DataSelect,
  IconButton,
  DataTime,
} from "../../components";
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
import { USER_SESSION_EXERCISE_EXPAND } from "../../config/constants";

interface Props {
  sessionExercises: UserSessionExercise[];
  sessionID: string;
  sessionDay: Accessor<string>;
}

export interface SessionExerciseRow {
  sessionExercise: UserSessionExercise;
  expanded: boolean;
}

export const UserSessionExerciseList: Component<Props> = (props) => {
  const [exerciseRows, setExerciseRows] = createStore<{ rows: SessionExerciseRow[] }>({
    rows: props.sessionExercises.map((sessionExercise) => ({ sessionExercise, expanded: false })),
  });
  const [showCreateSessionExercise, setShowCreateSessionExercise] = createSignal(false);
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

  const getSupersetParent = (index: number, data: SessionExerciseRow[]): UserSessionExercise => {
    if (!data[index].sessionExercise.supersetParent) {
      return data[index].sessionExercise;
    } else {
      for (const row of data.slice(0, index + 1).reverse()) {
        if (row.sessionExercise.id === data[index].sessionExercise.supersetParent) {
          return row.sessionExercise;
        }
      }
    }
    // we'll return this is we can't find a parent, although this would mean there's a big problem...
    return data[index].sessionExercise;
  };

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

  const buildCreateData = (row: SessionExerciseRow, supersetParent?: string) => ({
    user: user.id,
    exercise: row.sessionExercise.exercise,
    userSession: row.sessionExercise.userSession,
    variation: row.sessionExercise.variation,
    perceivedEffort: row.sessionExercise.perceivedEffort,
    addedWeight: row.sessionExercise.addedWeight,
    restAfter: row.sessionExercise.restAfter,
    isWarmup: row.sessionExercise.isWarmup,
    measurementNumeric: row.sessionExercise.measurementNumeric,
    measurementValue: row.sessionExercise.measurementValue,
    ...(supersetParent ? { supersetParent } : {}),
  });

  const insertRowsAndSync = async (index: number, records: UserSessionExercise[]) => {
    const newRows = [...exerciseRows.rows];
    const newRowsToInsert = records.map((record) => ({ sessionExercise: record, expanded: false }));

    newRows.splice(index, 0, ...newRowsToInsert);
    setExerciseRows("rows", newRows);

    await updateRecord(
      "userSessions",
      props.sessionID,
      "itemsOrder",
      newRows.map((r) => r.sessionExercise.id)
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
        .create(buildCreateData(exerciseRows.rows[duplicateInds[0]]), {
          expand: USER_SESSION_EXERCISE_EXPAND,
        });

      const childPromises = duplicateInds.slice(1).map((ind) =>
        pb
          .collection<UserSessionExercise>("userSessionExercises")
          .create(buildCreateData(exerciseRows.rows[ind], parentRecord.id), {
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
      perceivedEffort: 70,
    };

    addRowsAtIndex(exerciseRows.rows.length, undefined, data);
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
            <Show
              when={
                ctx.row.original.sessionExercise.expand?.exercise?.defaultMeasurementType ===
                "8ldlgtjjvy3ircl"
              }
              fallback={
                <div class="flex flex-row space-x-1">
                  <DataInput
                    type="number"
                    initial={ctx.row.original.sessionExercise.measurementNumeric || 0}
                    saveFunc={(v) => saveRow(ctx.row.original.sessionExercise.id, "measurementNumeric", v)}
                  />
                  <p>
                    {ctx.row.original.sessionExercise.expand?.exercise?.expand?.defaultMeasurementType
                      ?.displayName ?? ""}
                  </p>
                </div>
              }
            >
              <DataTime
                initial={ctx.row.original.sessionExercise.measurementNumeric || 0}
                saveFunc={(v) => saveRow(ctx.row.original.sessionExercise.id, "measurementNumeric", v)}
              />
            </Show>
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
            saveFunc={(v) => saveRow(ctx.row.original.sessionExercise.id, "addedWeight", v)}
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
          <Button
            onClick={() =>
              addRowsAtIndex(ctx.row.index, undefined, getDropsetAddData(ctx.row.original.sessionExercise))
            }
          >
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
  // TODO investigate if this is necessary
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
                getSupersetParent={(i: number) => getSupersetParent(i, exerciseRows.rows)}
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
