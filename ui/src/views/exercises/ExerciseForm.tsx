import { Component, createEffect, createSignal, Show } from "solid-js";
import Container from "../app/Container";
import { Button, Checkbox } from "../../components";
import { useAuthPB } from "../../config/pocketbase";
import { createStore } from "solid-js/store";
import LoadFullScreen from "../app/LoadFullScreen";

interface Props {
  exercise: ExercisesRecordExpand;
}

export const ExerciseForm: Component<Props> = (props) => {
  const { user } = useAuthPB();
  const [exercisePreferences, setExercisePreferences] = createStore<ExercisePreferences>({
    user: user.id,
    exercise: props.exercise.id,
    notes: "",
    tags: [],
    saved: false,
  });
  const [editing, setEditing] = createSignal(false);
  const [loading, setLoading] = createSignal(false);

  const savePreferences = async () => {
    // create if doesn't exist
    // maybe search by user and exercise or get from exercise expand.
  };

  const saveExercise = async () => {
    // run from button
  };

  return (
    <Container>
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
      <Show when={props.exercise.description} fallback={<p class="italic text-sm">No description</p>}>
        <p class="text-sm">{props.exercise.description}</p>
      </Show>
      <div class="mt-3">
        <Checkbox
          label="Save Exercise"
          checked={exercisePreferences.saved || false}
          onChange={(v) => setExercisePreferences("saved", v)}
        />
      </div>
      <h3 class="mt-2">Exercise Info</h3>
    </Container>
  );
};

export default ExerciseForm;
