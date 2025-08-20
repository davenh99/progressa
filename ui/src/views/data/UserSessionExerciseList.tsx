import { Component, createMemo, createSignal, For, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { createStore } from "solid-js/store";
import Copy from "lucide-solid/icons/copy";
import Down from "lucide-solid/icons/chevron-down";
import Up from "lucide-solid/icons/chevron-up";
import Trash from "lucide-solid/icons/trash-2";

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
import { ColumnDef, createSolidTable, flexRender, getCoreRowModel } from "@tanstack/solid-table";
import { ExerciseVariationList } from "./ExerciseVariationList";
import { DraggableRow, Row, Table, TableBody, TableHeader, TableHeaderCell } from "./Table";

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
  groupID: string;
}

export const UserSessionExerciseList: Component<Props> = (props) => {
  const [exerciseRows, setExerciseRows] = createStore<{ rows: SessionExerciseRow[] }>({
    rows: props.sessionExercises.map((sessionExercise) => ({
      sessionExercise,
      expanded: false,
      groupID: sessionExercise.supersetParent ?? sessionExercise.id,
      dragState: "idle",
    })),
  });
  const exerciseRowIds = createMemo<string[]>(() =>
    exerciseRows.rows.map(({ sessionExercise }) => sessionExercise.id)
  );
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
      // cell: () => (
      //   // <IconButton onClick={() => {}}>
      //   <Grip />
      //   //{/* </IconButton> */}
      // ),
    },
    {
      accessorFn: (row) =>
        row.sessionExercise.expand?.variation?.name
          ? `${row.sessionExercise.expand?.exercise?.name} (${row.sessionExercise.expand?.variation?.name})`
          : row.sessionExercise.expand?.exercise?.name,
      header: "Exercise",
    },
    {
      accessorKey: "sessionExercise.isWarmup",
      header: "Warmup?",
      cell: (ctx) => (
        <DataCheckbox
          initial={ctx.getValue() as boolean}
          saveFunc={(v: boolean) => saveRow(ctx.row.original.sessionExercise.id, v, "isWarmup")}
        />
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
              initial={ctx.getValue() as number}
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
        <DataInput
          type="number"
          initial={ctx.getValue() as number}
          saveFunc={(v: number) => saveRow(ctx.row.original.sessionExercise.id, v, "restAfter")}
        />
      ),
    },
    {
      header: "",
      id: "add-dropset",
      cell: () => <Button onClick={() => {}}>+ dropset</Button>,
    },
    {
      header: "",
      id: "duplicate",
      cell: () => (
        <IconButton onClick={() => {}}>
          <Copy />
        </IconButton>
      ),
    },
    {
      header: "",
      id: "delete",
      cell: () => (
        <IconButton onClick={() => {}}>
          <Trash />
        </IconButton>
      ),
    },
    {
      header: "",
      id: "expand",
      cell: (ctx) => (
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
      ),
    },
  ]);

  const saveRow = async (recordID: string, newVal: any, column: any) => {
    try {
      await updateRecord("userSessionExercises", recordID, newVal, column);
    } catch (e) {
      console.log(e);
    }
  };

  const deleteRow = async (index: number) => {
    const newRows = exerciseRows.rows.filter((_, ind) => ind !== index);
    setExerciseRows("rows", newRows);

    try {
      await pb.collection("userSessionExercises").delete(exerciseRows.rows[index].sessionExercise.id);
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

  const reorderRows = async (draggedItemsOldInd: number, draggedItemsNewInd: number, count: number) => {
    // shuffle array
    const newRows = [...exerciseRows.rows];
    const draggedItems = newRows.splice(draggedItemsOldInd, count);

    const adjustedNewIndex =
      draggedItemsNewInd > draggedItemsOldInd ? draggedItemsNewInd - count : draggedItemsNewInd;
    newRows.splice(adjustedNewIndex, 0, ...draggedItems);

    setExerciseRows("rows", newRows);

    // send the updated list to 'itemsOrder'
    await updateRecord(
      "userSessions",
      props.sessionID,
      newRows.map((r) => r.sessionExercise.id),
      "itemsOrder"
    );
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
      newRows.splice(index, 0, {
        sessionExercise: record,
        expanded: false,
        groupID: record.supersetParent ?? record.id,
      });
      setExerciseRows("rows", newRows);

      // send the updated list to 'itemsOrder'
      await updateRecord(
        "userSessions",
        props.sessionID,
        newRows.map((r) => r.sessionExercise.id),
        "itemsOrder"
      );
    } else if (duplicateInds) {
      // add to array (sorting just in case)
      const createPromises = duplicateInds
        .sort((a, b) => a - b)
        .map((ind) => {
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
          };

          return pb.collection<UserSessionExercise>("userSessionExercises").create(createData, {
            expand:
              "exercise.measurementType.measurementValues_via_measurementType, measurementValue, variation",
          });
        });
      const newRecords = await Promise.all(createPromises);

      const newRows = [...exerciseRows.rows];
      const newRowsToInsert = newRecords.map((record) => ({
        sessionExercise: record,
        expanded: false,
        groupID: record.supersetParent ?? record.id,
      }));
      newRows.splice(index, 0, ...newRowsToInsert);
      setExerciseRows("rows", newRows);

      // send the updated list to 'itemsOrder'
      await updateRecord(
        "userSessions",
        props.sessionID,
        newRows.map((r) => r.sessionExercise.id),
        "itemsOrder"
      );
    }
  };

  const addSessionExercise = async () => {
    const data: UserSessionExerciseCreateData = {
      user: user.id,
      userSession: props.sessionID,
      variation: newExercise.variation?.id || undefined,
      exercise: newExercise.exercise.id,
      perceivedEffort: 50,
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
            {(row) => <DraggableRow row={row} exerciseRowIds={exerciseRowIds} />}
          </For>
        </TableBody>
      </Table>
      <Button onClick={() => setShowCreateSessionExercise(true)}>Add Set</Button>
      <Show when={showCreateSessionExercise()}>
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
      </Show>
    </>
  );
};
