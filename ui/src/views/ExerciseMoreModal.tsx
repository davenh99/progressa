import { Component, createEffect } from "solid-js";
import { createStore, SetStoreFunction } from "solid-js/store";
import Plus from "lucide-solid/icons/plus";
import Copy from "lucide-solid/icons/copy";
import Delete from "lucide-solid/icons/x";

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
        label="Mark as warmup"
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
      <div class="flex flex-col">
        <Button
          variant="text"
          class="flex flex-row items-center space-x-1"
          onClick={() => props.addDropSet().then(() => props.setModalVisible(false))}
        >
          <Plus size={16} />
          <p>Add Drop Set</p>
        </Button>
        <Button
          variant="text"
          class="flex flex-row items-center space-x-1"
          onClick={() => props.duplicateRow().then(() => props.setModalVisible(false))}
        >
          <Copy size={16} />
          <p>Duplicate</p>
        </Button>
        <Button
          variant="text"
          variantColor="bad"
          class="flex flex-row items-center space-x-1"
          onClick={() => props.deleteRow().then(() => props.setModalVisible(false))}
        >
          <Delete size={16} />
          <p>Delete</p>
        </Button>
      </div>
      <div class="bg-charcoal-800 w-full h-[2px] my-2 rounded-full"></div>
    </Modal>
  );
};

export default ExerciseMoreModal;
