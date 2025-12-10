import { Component, createSignal, For, onMount, Show } from "solid-js";
import { createStore } from "solid-js/store";
import { ClientResponseError } from "pocketbase";

import { Button, DataCheckbox, TextArea, TagArea } from "../../components";
import { useAuthPB } from "../../config/pocketbase";
import LoadFullScreen from "../app/LoadFullScreen";
import { debounce } from "../../methods/debounce";

interface Props {
  exercise: ExercisesRecordExpand;
}

const fieldTitles: Record<
  keyof Omit<
    ExercisesRecord,
    | "id"
    | "created"
    | "updated"
    | "allowedMeasurementTypes"
    | "allowedMeasurementTypes3"
    | "allowedMeasurementTypes2"
    | "collectionId"
    | "collectionName"
    | "public"
    | "defaultMeasurementType3"
    | "image"
    | "video"
    | "usersSaved"
    | "name"
    | "system"
    | "description"
    | "instructions"
    | "equipmentPrimary"
    | "equipmentSecondary"
    | "defaultMeasurementType"
    | "defaultMeasurementType2"
  >,
  string
> = {
  armCount: "One or two arms?",
  armPattern: "Continuous or alternating arms",
  bodyRegion: "Body region",
  bodyweight: "Is this exercise bodyweight based?",
  createdBy: "Created by",
  difficulty: "Difficulty",
  endLoadPosition: "Load position at end",
  field: "Exercise classification",
  footElevation: "Foot elevation",
  forceType: "Force type",
  grip: "Grip",
  isCombination: "Combination exercise?",
  isTimeBased: "Time based exercise?",
  laterality: "Laterality",
  legPattern: "Continuous or alternating legs",
  mechanics: "Mechanics",
  motionPlane: "Plane of motion #1",
  motionPlane2: "Plane of motion #2",
  motionPlane3: "Plane of motion #3",
  movementPattern: "Movement pattern #1",
  movementPattern2: "Movement pattern #2",
  movementPattern3: "Movement pattern #3",
  musclePrimary: "Primary muscle",
  muscleSecondary: "Secondary muscle",
  muscleTertiary: "Tertiary muscle",
  posture: "Posture",
  targetMuscleGroup: "Target muscle group",
};

export const ExerciseForm: Component<Props> = (props) => {
  const { pb, user } = useAuthPB();
  const [exercisePreferences, setExercisePreferences] = createStore<ExercisePreferencesExpand>({
    user: user.id,
    exercise: props.exercise.id,
    notes: "",
    tags: [],
    saved: false,
    expand: {
      tags: [],
    },
  });
  const [editing, setEditing] = createSignal(false);
  const [loading, setLoading] = createSignal(false);

  const savePreferences = debounce(async (field: string, val: any) => {
    const newData: any = {};
    newData[field] = val;

    try {
      const curRecord = await getExercisePreferences();

      if (curRecord) {
        await pb.collection<ExercisePreferencesExpand>("exercisePreferences").update(curRecord.id, newData);
      } else {
        await pb
          .collection<ExercisePreferencesExpand>("exercisePreferences")
          .create({ ...exercisePreferences, ...newData });
      }
    } catch (e) {
      console.error(e);
    }
  });

  const saveExercise = async () => {
    // run from button
  };

  const getExercisePreferences = async () => {
    try {
      const record = await pb
        .collection<ExercisePreferencesRecord>("exercisePreferences")
        .getFirstListItem(`user = '${user.id}' && exercise = '${props.exercise.id}'`, { expand: "tags" });

      return record;
    } catch (e) {
      if (e instanceof ClientResponseError && e.status == 404) {
      } else {
        console.error(e);
      }
    }

    return null;
  };

  onMount(async () => {
    const record = await getExercisePreferences();
    if (record) {
      setExercisePreferences(record);
    }
  });

  return (
    <div class="pb-25">
      <div class="flex justify-between items-start">
        <Show when={loading()}>
          <LoadFullScreen />
        </Show>
        <h2>{props.exercise.name}</h2>
        <Show when={props.exercise.createdBy === user.id}>
          <Show
            when={editing()}
            fallback={
              <Button variant="text" variantColor="neutral" onClick={() => setEditing(true)}>
                edit
              </Button>
            }
          >
            <Button
              variant="text"
              variantColor="good"
              onClick={() => {
                setLoading(true);
                saveExercise()
                  .then(() => setEditing(false))
                  .finally(() => setLoading(false));
              }}
            >
              save
            </Button>
          </Show>
        </Show>
      </div>
      <Show when={props.exercise.description}>
        <p class="text-sm">{props.exercise.description}</p>
      </Show>
      <Show when={props.exercise.instructions}>
        <p class="text-sm">{props.exercise.instructions}</p>
      </Show>
      <div class="mt-3 mb-2">
        <DataCheckbox
          label="Save Exercise"
          value={exercisePreferences.saved || false}
          onValueChange={(v) => setExercisePreferences("saved", v)}
          saveFunc={async (v) => savePreferences("saved", v)}
        />
      </div>
      <div class="mb-2">
        <TextArea
          value={exercisePreferences.notes || ""}
          onChange={(v) => setExercisePreferences("notes", v)}
          saveFunc={async (v) => savePreferences("notes", v)}
          label="Your notes"
        />
      </div>
      <TagArea
        modelName=""
        recordID=""
        tags={exercisePreferences.expand?.tags || []}
        setTags={(tags) => setExercisePreferences("expand", "tags", tags)}
        updateRecord={async (_, __, f, val) => savePreferences(f, val)}
      />
      <h3 class="mt-4">Exercise Info</h3>
      <Show when={props.exercise.expand?.defaultMeasurementType}>
        <p class="text-md font-bold mt-1">Measurement type</p>
        <p class="text-sm">{String(props.exercise.expand?.defaultMeasurementType?.name)}</p>
      </Show>
      <Show when={props.exercise.expand?.defaultMeasurementType2}>
        <p class="text-md font-bold mt-1">Second measurement type (optional)</p>
        <p class="text-sm">{String(props.exercise.expand?.defaultMeasurementType2?.name)}</p>
      </Show>
      <For each={Object.entries(fieldTitles) as [keyof typeof fieldTitles, string][]}>
        {([field, title]) => (
          <Show when={props.exercise[field] !== undefined && props.exercise[field] !== ""}>
            <p class="text-md font-bold mt-1">{title}</p>
            <Show
              when={typeof props.exercise[field] === "boolean"}
              fallback={<p class="text-sm">{String(props.exercise[field])}</p>}
            >
              <p class="text-sm">{props.exercise[field] ? "yes" : "no"}</p>
            </Show>
          </Show>
        )}
      </For>
    </div>
  );
};

export default ExerciseForm;
