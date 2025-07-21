import { Component, createSignal, For, onMount, Show } from "solid-js";
import { useAuthPB } from "../config/pocketbase";
import { Exercise } from "../../Types";
import Loading from "./Loading";

interface Props {
  setSelected: (exercise: Exercise) => void;
}

const ExercisesListView: Component<Props> = (props) => {
  const [exercises, setExercises] = createSignal<Exercise[]>();
  const { pb } = useAuthPB();

  const getData = async () => {
    try {
      const exercises = await pb.collection<Exercise>("exercises").getFullList({ expand: "measurementType" });

      setExercises(exercises);
    } catch (e) {
      console.log("get exercises error: ", e);
    }
  };

  onMount(() => {
    getData();
  });

  return (
    <Show when={!!exercises()} fallback={<Loading />}>
      <For each={exercises()}>
        {(exercise) => (
          <div onclick={() => props.setSelected(exercise)} class="flex flex-row justify-between">
            <p>session</p>
            <p>{exercise.name}</p>
            <p>{exercise.description}</p>
            <p>{exercise.bodyweight}</p>
            <p>{exercise.expand.measurementType.name}</p>
          </div>
        )}
      </For>
    </Show>
  );
};

export default ExercisesListView;
