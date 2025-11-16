import { Component, createEffect, createSignal, Show } from "solid-js";
import { createStore, SetStoreFunction } from "solid-js/store";
import Plus from "lucide-solid/icons/plus";
import Copy from "lucide-solid/icons/copy";
import Delete from "lucide-solid/icons/x";
import ArrowUp from "lucide-solid/icons/arrow-up-right";

import { Exercise, ExerciseVariation, Session, SessionExercise } from "../../../Types";
import { Button, Checkbox, Modal, Slider, TagArea, TextArea, useModalLoading } from "../../components";
import { useAuthPB } from "../../config/pocketbase";
import ExerciseSelectModal from "../exercises/ExerciseSelectModal";

interface Props {
  setModalVisible: (visible: boolean) => void;
  initialExercise: SessionExercise;
  sessionID: string;
  setSession: SetStoreFunction<{
    session: Session | null;
  }>;
  deleteRow: () => Promise<void>;
  duplicateRow: () => Promise<void>;
  addDropSet: () => Promise<void>;
}

export const SessionExerciseMoreModal: Component<Props> = (props) => {
  const [exercise, setExercise] = createStore<SessionExercise>(
    JSON.parse(JSON.stringify(props.initialExercise))
  );
  const { pb, getSessionByID } = useAuthPB();

  const save = async () => {
    try {
      await pb.collection("sessionExercises").update(exercise.id, exercise);
      // lazy way to refresh the session for now. could also set the state.
      const updatedSession = await getSessionByID(props.sessionID);
      props.setSession({ session: updatedSession });
    } catch (e) {
      console.error(e);
    }
  };

  createEffect(() => setExercise(JSON.parse(JSON.stringify(props.initialExercise))));

  return (
    <Modal saveFunc={save} setModalVisible={props.setModalVisible}>
      <ModalContent exercise={exercise} setExercise={setExercise} parentProps={props} />
    </Modal>
  );
};

export default SessionExerciseMoreModal;

interface ModalProps {
  exercise: SessionExercise;
  setExercise: SetStoreFunction<SessionExercise>;
  parentProps: Props;
}

const ModalContent: Component<ModalProps> = (props) => {
  const [showExerciseSelectModal, setShowExerciseSelectModal] = createSignal(false);
  const [warning, setWarning] = createSignal("");
  const { setLoading } = useModalLoading();

  const selectNewExercise = async (exercise: Exercise, variation?: ExerciseVariation) => {
    props.setExercise("exercise", exercise.id);
    props.setExercise("variation", variation?.id ?? "");
    props.setExercise("expand", (currentExpand: any) => ({
      ...currentExpand,
      exercise: { ...currentExpand?.exercise, name: exercise.name },
      variation: { ...currentExpand?.variation, name: variation?.name ?? "" },
    }));
    props.setExercise("measurementNumeric", 0);
    props.setExercise("measurement2Numeric", 0);
    props.setExercise("measurement3Numeric", 0);
    props.setExercise("measurementValue", undefined);
    props.setExercise("measurement2Value", undefined);
    props.setExercise("measurement3Value", undefined);

    setWarning("Warning: changing the exercise will reset measurements");
    setShowExerciseSelectModal(false);
  };

  return (
    <div class="overflow-y-auto">
      <Show when={showExerciseSelectModal()}>
        <ExerciseSelectModal
          setModalVisible={setShowExerciseSelectModal}
          selectExercise={selectNewExercise}
        />
      </Show>
      <h2 class="pb-2">Exercise Options</h2>
      <div class="mb-3">
        <Button class="w-full flex items-center" onClick={() => setShowExerciseSelectModal(true)}>
          <p class="flex-1">
            {props.exercise.expand?.variation?.name
              ? `${props.exercise.expand?.exercise?.name} (${props.exercise.expand?.variation?.name})`
              : props.exercise.expand?.exercise?.name}
          </p>
          <ArrowUp size={18} />
        </Button>
        <p class="pt-1 text-red-400 text-xs">{warning()}</p>
      </div>
      <Checkbox
        checked={props.exercise.isWarmup}
        onChange={(v) => props.setExercise("isWarmup", v)}
        label="Mark as warmup"
      />
      <div class="my-4 space-y-4">
        <Slider
          label="Endurance Rating"
          value={props.exercise.enduranceRating ?? 0}
          min={0}
          max={100}
          step={5}
          onValueChange={(v) => props.setExercise("enduranceRating", v)}
        />
        <Slider
          label="Strength Rating"
          value={props.exercise.strengthRating ?? 0}
          min={0}
          max={100}
          step={5}
          onValueChange={(v) => props.setExercise("strengthRating", v)}
        />
      </div>
      <TextArea
        class="my-2"
        label="Notes"
        placeholder="Feeling strong..."
        value={props.exercise.notes}
        onInput={(e) => props.setExercise("notes", e.currentTarget.value)}
      />
      <TagArea
        tags={props.exercise.expand?.tags ?? []}
        setTags={(tags) => {
          props.setExercise("expand", "tags", tags);
          props.setExercise(
            "tags",
            tags.map((t) => t.id)
          );
        }}
        modelName="sessionExercises"
        recordID={props.exercise.id}
      />
      <div class="flex flex-col mt-3">
        <Button
          variant="text"
          class="flex flex-row items-center space-x-1"
          onClick={async () => {
            setLoading(true);
            await props.parentProps.addDropSet();
            props.parentProps.setModalVisible(false);
            setLoading(false);
          }}
        >
          <Plus size={16} />
          <p>Add Drop Set</p>
        </Button>
        <Button
          variant="text"
          class="flex flex-row items-center space-x-1"
          onClick={async () => {
            setLoading(true);
            await props.parentProps.duplicateRow();
            props.parentProps.setModalVisible(false);
            setLoading(false);
          }}
        >
          <Copy size={16} />
          <p>Duplicate</p>
        </Button>
        <Button
          variant="text"
          variantColor="bad"
          class="flex flex-row items-center space-x-1"
          onClick={async () => {
            setLoading(true);
            await props.parentProps.deleteRow();
            props.parentProps.setModalVisible(false);
            setLoading(false);
          }}
        >
          <Delete size={16} />
          <p>Delete</p>
        </Button>
      </div>
      <div class="bg-dark-slate-gray-500 w-full h-[2px] my-2 rounded-full"></div>
    </div>
  );
};
