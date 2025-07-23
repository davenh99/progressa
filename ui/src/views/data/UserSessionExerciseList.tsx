import { Component, createSignal, For, onMount, Show } from "solid-js";
import { createStore } from "solid-js/store";

import { useAuthPB } from "../../config/pocketbase";
import { Exercise, UserSessionExercise } from "../../../Types";
import Loading from "../Loading";
import { ExerciseList } from ".";

interface Props {
  sessionID: string;
}

const BaseUserSessionExercise = {
  exercise: "",
  exerciseName: "",
  notes: "",
  qty: 0,
  restAfter: 0,
  addedWeight: 0,
};

export const UserSessionExerciseList: Component<Props> = (props) => {
  const [sessionExercises, setSessionExercises] = createSignal<UserSessionExercise[]>(null);
  const [isLoading, setIsLoading] = createSignal(false);
  const [showExercises, setShowExercises] = createSignal(false);
  const [newExercise, setNewExercise] = createStore(BaseUserSessionExercise);
  const [creatingExercise, setCreatingExercise] = createSignal<boolean>(false);
  const { pb, user, getUserSessionExercises } = useAuthPB();

  const getSessionExercises = async () => {
    const exercises = await getUserSessionExercises(props.sessionID);
    setSessionExercises(exercises);
  };

  const createSessionExercise = async () => {
    setIsLoading(true);

    try {
      const data = {
        ...newExercise,
        user: user.id,
        userSession: props.sessionID,
      };

      delete data["exerciseName"];

      await pb.collection("userSessionExercises").create(data);
      const s = await getUserSessionExercises(props.sessionID);

      setSessionExercises(s);
      setCreatingExercise(false);
      setNewExercise(BaseUserSessionExercise);
    } catch (err) {
      console.error("Failed to create session:", err);
      alert(err);
    } finally {
      setIsLoading(false);
    }
  };

  onMount(() => {
    getSessionExercises();
  });

  return (
    <Show when={!!sessionExercises()} fallback={<Loading />}>
      <div onClick={() => setCreatingExercise(true)}>
        <p>add exercise</p>
      </div>
      <Show when={creatingExercise()}>
        <div>
          <div onclick={() => setShowExercises(true)} class="div">
            <span class="label-text">Select Exercise</span>
          </div>
          <Show when={showExercises()}>
            <ExerciseList
              setSelected={(exercise: Exercise) => {
                setNewExercise("exercise", exercise.id);
                setNewExercise("exerciseName", exercise.name);
              }}
            />
          </Show>
          <p>selected exercise: {newExercise.exerciseName}</p>
        </div>

        <div>
          <label class="label">
            <span class="label-text">Notes</span>
          </label>
          <textarea
            value={newExercise.notes}
            onInput={(e) => setNewExercise("notes", e.target.value)}
            class="input input-bordered w-full"
            rows={3}
          />
        </div>

        <div>
          <label class="label">
            <span class="label-text">Amount (reps or minutes or whatever)</span>
          </label>
          <input
            type="number"
            value={newExercise.qty}
            onInput={(e) => setNewExercise("qty", Number(e.target.value))}
            class="textarea textarea-bordered w-full"
          />
        </div>

        <div class="flex justify-end gap-2 pt-4">
          <button onClick={() => setCreatingExercise(false)} class="btn" disabled={isLoading()}>
            Cancel
          </button>
          <button
            onClick={createSessionExercise}
            class="btn btn-primary"
            disabled={isLoading() || !newExercise.exercise.trim()}
          >
            {isLoading() ? "Creating..." : "Create Session"}
          </button>
        </div>
      </Show>
      <For each={sessionExercises()}>
        {(exercise) => (
          <div>
            <p>exercise</p>
            <p>{exercise.notes}</p>
          </div>
        )}
      </For>
    </Show>
  );
};
