import { Component, createSignal, Show } from "solid-js";
import { Portal } from "solid-js/web";
import ArrowLeft from "lucide-solid/icons/arrow-left";

import { ExerciseList, ExerciseVariationList } from "./data";
import { Exercise, ExerciseVariation } from "../../Types";
import { Button } from "../components";

interface Props {
  setModalVisible: (v: boolean) => void;
  addSessionExercise: (exerciseID: string, variationID?: string) => Promise<void>;
}

export const ExerciseSelectModal: Component<Props> = (props) => {
  const [variations, setVariations] = createSignal<ExerciseVariation[]>([]);
  const [selectedExercise, setSelectedExercise] = createSignal<Exercise | null>(null);

  return (
    <Portal>
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/35"
        onClick={() => props.setModalVisible(false)}
      >
        <div
          class="bg-white rounded-xl shadow-lg p-6 w-[35vw] max-h-[60vh]"
          onClick={(e) => e.stopPropagation()}
        >
          <p class="pb-2">Select Exercise</p>
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
            <Button onClick={() => setSelectedExercise(null)} class="flex flex-row">
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

          <Button onClick={() => props.setModalVisible(false)} class="mt-2">
            Cancel
          </Button>
        </div>
      </div>
    </Portal>
  );
};

export default ExerciseSelectModal;
