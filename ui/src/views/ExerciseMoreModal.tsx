import { Component, createEffect } from "solid-js";
import { createStore, SetStoreFunction } from "solid-js/store";

import { UserSession, UserSessionExercise } from "../../Types";
import { Button, Checkbox, Modal, TagArea, TextArea } from "../components";
import { useAuthPB } from "../config/pocketbase";

interface Props {
  setModalVisible: (visible: boolean) => void;
  initialExercise: UserSessionExercise;
  sessionID: string;
  setSession: SetStoreFunction<{
    session: UserSession | null;
  }>;
  deleteRow: () => Promise<void>;
  duplicateRow: () => Promise<void>;
  addDropSet: () => Promise<void>;
}

export const ExerciseMoreModal: Component<Props> = (props) => {
  const [exercise, setExercise] = createStore(JSON.parse(JSON.stringify(props.initialExercise)));
  const { pb, getSessionByID } = useAuthPB();

  const save = async () => {
    try {
      await pb.collection("userSessionExercises").update(exercise.id, exercise);
      // lazy way to refresh the session for now. could also set the state.
      const updatedSession = await getSessionByID(props.sessionID);
      props.setSession({ session: updatedSession });
    } catch (e) {
      console.log(e);
    }
  };

  createEffect(() => setExercise(JSON.parse(JSON.stringify(props.initialExercise))));

  return (
    <Modal saveFunc={save} setModalVisible={props.setModalVisible}>
      <h2 class="pb-2">Exercise Options</h2>
      <Checkbox
        checked={exercise.isWarmup}
        onChange={(v) => setExercise("isWarmup", v)}
        label="mark as warmup"
      />
      <TextArea
        class="mt-2"
        label="Notes"
        value={exercise.notes}
        onInput={(e) => setExercise("notes", e.currentTarget.value)}
      />
      <TagArea
        tags={exercise.expand?.tags ?? []}
        setTags={(tags) => {
          setExercise("expand", "tags", tags);
          setExercise(
            "tags",
            tags.map((t) => t.id)
          );
        }}
        modelName="userSessionExercises"
        recordID={exercise.id}
      />
      <div class="bg-charcoal-800 w-full h-[2px] my-2 rounded-full"></div>
      <h3>Actions</h3>
      <div class="space-x-2 space-y-2">
        <Button onClick={() => props.addDropSet().then(() => props.setModalVisible(false))}>
          Add Drop Set
        </Button>
        <Button onClick={() => props.duplicateRow().then(() => props.setModalVisible(false))}>
          Duplicate
        </Button>
        <Button onClick={() => props.deleteRow().then(() => props.setModalVisible(false))}>Delete</Button>
      </div>
      <div class="bg-charcoal-800 w-full h-[2px] my-2 rounded-full"></div>
    </Modal>
  );
};

export default ExerciseMoreModal;
