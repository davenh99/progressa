import { Component, createMemo, createSignal, For, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { createStore } from "solid-js/store";

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
import { Button, DataCheckbox, DataInput, DataSlider, DataSelect } from "../../components";
import { ColumnDef, createSolidTable, flexRender, getCoreRowModel } from "@tanstack/solid-table";
import Ellipsis from "lucide-solid/icons/ellipsis";
import { ExerciseVariationList } from "./ExerciseVariationList";

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

export const UserSessionExerciseList: Component<Props> = (props) => {
  const [newExercise, setNewExercise] = createStore(BaseNewExercise);
  const [showCreateSessionExercise, setShowCreateSessionExercise] = createSignal(false);
  const [showAddExerciseVariation, setShowAddExerciseVariation] = createSignal(false);
  const [variations, setVariations] = createSignal<ExerciseVariation[]>([]);
  const navigate = useNavigate();
  const { pb, user, updateRecord } = useAuthPB();

  const columns = createMemo<ColumnDef<UserSessionExercise>[]>(() => [
    {
      accessorFn: (row) => `${row.expand?.exercise?.name} (${row.expand?.variation?.name})`,
      header: "Exercise",
    },
    {
      accessorKey: "isWarmup",
      header: "Warmup?",
      cell: (ctx) => (
        <DataCheckbox
          initial={ctx.getValue() as boolean}
          saveFunc={(v: boolean) => saveRow(ctx.row.original.id, v, "isWarmup")}
        />
      ),
    },
    {
      accessorFn: (row) =>
        row.expand?.exercise?.expand?.measurementType?.numeric ? "measurementNumeric" : "measurementValue",
      header: "Measurement",
      cell: (ctx) => {
        return (
          <Show
            when={ctx.row.original.expand?.exercise?.expand?.measurementType?.numeric}
            fallback={
              <DataSelect
                values={
                  ctx.row.original.expand?.exercise?.expand?.measurementType?.expand
                    ?.measurementValues_via_measurementType ?? []
                }
                saveFunc={(v: string) => saveRow(ctx.row.original.id, v, "measurementValue")}
              />
            }
          >
            <DataInput
              type="number"
              initial={ctx.getValue() as number}
              saveFunc={(v: number) => saveRow(ctx.row.original.id, v, "measurementNumeric")}
            />
          </Show>
        );
      },
    },
    {
      accessorKey: "addedWeight",
      header: "Weight Added (kg)",
      cell: (ctx) => (
        <DataInput
          type="number"
          initial={ctx.getValue() as number}
          saveFunc={(v: number) => saveRow(ctx.row.original.id, v, "addedWeight")}
        />
      ),
    },
    {
      accessorKey: "perceivedEffort",
      header: "Perceived Effort",
      cell: (ctx) => (
        <DataSlider
          initial={50}
          saveFunc={(v: number) => saveRow(ctx.row.original.id, v, "perceivedEffort")}
        />
      ),
    },
    {
      accessorKey: "restAfter",
      header: "Rest After (s)",
      cell: (ctx) => (
        <DataInput
          type="number"
          initial={ctx.getValue() as number}
          saveFunc={(v: number) => saveRow(ctx.row.original.id, v, "restAfter")}
        />
      ),
    },
    {
      header: "",
      id: "more-info",
      cell: () => <Ellipsis />,
    },
  ]);

  const saveRow = async (recordID: string, newVal: any, column: any) => {
    try {
      await updateRecord("userSessionExercises", recordID, newVal, column);
    } catch (e) {
      console.log(e);
    }
  };

  const addSessionExercise = async () => {
    const data: UserSessionExerciseCreateData = {
      user: user.id,
      userSession: props.sessionID,
      variation: newExercise.variation?.id || undefined,
      exercise: newExercise.exercise.id,
      perceivedEffort: 50,
      sequence: Math.max(...props.sessionExercises.map((e) => e.sequence)) + 1,
    };

    if (variations.length > 0 && !newExercise.variation) {
      alert("must select a variation for this exercise");
    } else {
      try {
        if (!props.sessionID) {
          // TODO can probs remove the double up here and in log session
          const createData: UserSessionCreateData = {
            name: "",
            notes: "",
            tags: [],
            user: user.id,
            userDay: props.sessionDay,
            userHeight: user.height,
            userWeight: user.weight,
            sleepQuality: "fair",
          };

          const newSession = await pb.collection<UserSession>("userSessions").create(createData);
          data.userSession = newSession.id;
        }
        // TODO below in inefficient, can probably just grab the new record from the return value and add it?
        await pb
          .collection<UserSessionExercise>("userSessionExercises")
          .create(data, { expand: "exercise.measurementType.measurementValues_via_measurementType" });

        if (!props.sessionID) {
          navigate(`/workouts/log/${data.userSession}`, { replace: true });
        }

        await props.getSession();
      } catch (e) {
        console.log(e);
      } finally {
        setShowCreateSessionExercise(false);
      }
    }
  };

  const table = createSolidTable({
    get data() {
      return props.sessionExercises;
    },
    columns: columns(),
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <table class="table w-full">
        <thead>
          <For each={table.getHeaderGroups()}>
            {(headerGroup) => (
              <tr>
                <For each={headerGroup.headers}>
                  {(header) => <th>{flexRender(header.column.columnDef.header, header.getContext())}</th>}
                </For>
              </tr>
            )}
          </For>
        </thead>
        <tbody>
          <For each={table.getRowModel().rows}>
            {(row) => (
              <tr class="hover">
                <For each={row.getVisibleCells()}>
                  {(cell) => <td>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>}
                </For>
              </tr>
            )}
          </For>
        </tbody>
      </table>
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
