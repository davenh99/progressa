import { Component, createSignal, Show } from "solid-js";
import ArrowLeft from "lucide-solid/icons/arrow-left";

import { Exercise, ExerciseVariation } from "../../../Types";
import { Button, Modal } from "../../components";
import { ExerciseList } from "./ExerciseList";
import { ExerciseVariationList } from "./ExerciseVariationList";

interface Props {
  setModalVisible: (v: boolean) => void;
  addSessionExercise: (exerciseID: string, variationID?: string) => Promise<void>;
}

export const ExerciseSelectModal: Component<Props> = (props) => {
  const [variations, setVariations] = createSignal<ExerciseVariation[]>([]);
  const [selectedExercise, setSelectedExercise] = createSignal<Exercise | null>(null);

  return (
    <Modal setModalVisible={props.setModalVisible}>
      <h2 class="pb-2">Select Exercise</h2>
      <Show
        when={selectedExercise()}
        fallback={
          <ExerciseList
            onClick={(exercise: Exercise) => {
              if (exercise.expand?.exerciseVariations_via_exercise?.length || 0 > 0) {
                setVariations(exercise.expand?.exerciseVariations_via_exercise ?? []);
                setSelectedExercise(exercise);
              } else {
                props.addSessionExercise(exercise.id);
              }
            }}
          />
        }
      >
        <Button variant="text" onClick={() => setSelectedExercise(null)} class="flex flex-row">
          <ArrowLeft />
          <p>{selectedExercise()?.name || ""}</p>
        </Button>

        <ExerciseVariationList
          variations={variations}
          onClick={(v) => {
            const sel = selectedExercise();
            if (sel) {
              props.addSessionExercise(sel.id, v.id);
            }
          }}
        />
      </Show>
    </Modal>
  );
};

export default ExerciseSelectModal;
