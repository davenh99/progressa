import { Component, createMemo, createSignal, For, Show } from "solid-js";
import { createStore } from "solid-js/store";

import { useAuthPB } from "../../config/pocketbase";
import {
  Exercise,
  ExerciseVariation,
  Tag,
  UserSessionExercise,
  UserSessionExerciseCreateData,
} from "../../../Types";
import { ExerciseList } from ".";
import { Button, Checkbox, Input, Slider, TextArea } from "../../components";
import { ColumnDef, createSolidTable, flexRender, getCoreRowModel } from "@tanstack/solid-table";
import Ellipsis from "lucide-solid/icons/ellipsis";
import { ExerciseVariationList } from "./ExerciseVariationList";

interface Props {
  sessionExercises: UserSessionExercise[];
  sessionID: string;
}

const BaseNewExercise = {
  exercise: null as Exercise,
  notes: "",
  tags: [] as Tag[],
  addedWeight: 0,
  restAfter: 0,
  isWarmup: false,
  perceivedEffort: 50,
  variation: "",
  measurement: null as string | number,
  supersetParent: null as string,
};

export const UserSessionExerciseList: Component<Props> = (props) => {
  const [newExercise, setNewExercise] = createStore(BaseNewExercise);
  const [showCreateSessionExercise, setShowCreateSessionExercise] = createSignal(false);
  const [showAddExercise, setShowAddExercise] = createSignal(false);
  const [showAddExerciseVariation, setShowAddExerciseVariation] = createSignal(false);
  const [variations, setVariations] = createSignal<ExerciseVariation[]>([]);
  const { pb, user } = useAuthPB();

  const columns = createMemo<ColumnDef<UserSessionExercise>[]>(() => [
    {
      accessorKey: "notes",
      header: "Notes",
    },
    {
      accessorFn: (row) => `${row.expand?.exercise?.name} (${row.expand?.variation?.name})`,
      header: "Exercise",
    },
    {
      accessorKey: "tags",
      header: "Tags",
    },
    {
      accessorKey: "addedWeight",
      header: "Weight Added (kg)",
    },
    {
      accessorKey: "restAfter",
      header: "Rest After (s)",
    },
    {
      accessorKey: "isWarmup",
      header: "Warmup?",
    },
    {
      header: "",
      id: "more-info",
      cell: () => <Ellipsis />,
    },
  ]);

  const addSessionExercise = async () => {
    const data: UserSessionExerciseCreateData = {
      user: user.id,
      userSession: props.sessionID,
      variation: newExercise.variation,
      notes: newExercise.notes,
      addedWeight: newExercise.addedWeight,
      exercise: newExercise.exercise.id,
      isWarmup: newExercise.isWarmup,
      perceivedEffort: newExercise.perceivedEffort,
      restAfter: newExercise.restAfter,
      tags: [],
      sequence: Math.max(...props.sessionExercises.map((e) => e.sequence)) + 1,
    };

    try {
      // TODO validate data and display error before getting here?
      await pb.collection<UserSessionExercise>("userSessionExercises").create(data, { expand: "exercise" });
    } catch (e) {
      console.log(e);
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
      <Button onClick={() => setShowCreateSessionExercise(true)}>Add Set</Button>
      <Show when={showCreateSessionExercise()}>
        <Button onClick={() => setShowAddExercise(true)}>Select Exercise</Button>
        <Show when={showAddExercise()}>
          <ExerciseList
            onClick={(exercise: Exercise) => {
              if (exercise.expand?.exerciseVariations_via_exercise?.length > 0) {
                setShowAddExerciseVariation(true);
                setVariations(exercise.expand.exerciseVariations_via_exercise);
              } else {
                setShowAddExercise(false);
              }
              setNewExercise("exercise", exercise);
            }}
          />
          <Show when={showAddExerciseVariation()}>
            <ExerciseVariationList
              variations={variations}
              onClick={(v) => {
                setShowAddExercise(false);
                setShowAddExerciseVariation(false);
                setNewExercise("variation", v.id);
              }}
            />
          </Show>
        </Show>
        <div class="flex flex-row">
          <p>Selected exercise: {newExercise.exercise?.name ?? "None"}</p>

          <TextArea
            label="Notes"
            value={newExercise.notes}
            onInput={(e) => setNewExercise("notes", e.target.value)}
          />

          <Input
            label="Added weight"
            type="number"
            value={newExercise.addedWeight}
            onInput={(e) => setNewExercise("addedWeight", Number(e.target.value))}
          />

          <Checkbox checked={newExercise.isWarmup} onChange={(v: boolean) => setNewExercise("isWarmup", v)} />

          <Input
            label="Rest afterwards"
            type="number"
            value={newExercise.restAfter}
            onInput={(e) => setNewExercise("restAfter", Number(e.target.value))}
          />

          <Slider
            label="Perceived Effort"
            onChange={(v) => setNewExercise("perceivedEffort", v)}
            value={newExercise.perceivedEffort}
          />

          <Show when={newExercise.exercise && newExercise.exercise.expand?.measurementType?.numeric}>
            <Input
              label="Amount (reps, mins, whatever)"
              type="number"
              value={newExercise.measurement}
              onInput={(e) => setNewExercise("measurement", Number(e.target.value))}
            />
          </Show>
        </div>
        <Button
          onClick={() => {
            setShowCreateSessionExercise(false);
            addSessionExercise();
          }}
        >
          Confirm add
        </Button>
      </Show>

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
    </>
  );
};
