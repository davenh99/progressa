import { Component, createEffect } from "solid-js";
import { createStore, SetStoreFunction } from "solid-js/store";
import Plus from "lucide-solid/icons/plus";
import Copy from "lucide-solid/icons/copy";
import Delete from "lucide-solid/icons/x";

import { Session, SessionExercise } from "../../../Types";
import { Button, Checkbox, Modal, TagArea, TextArea, useModalLoading } from "../../components";
import { useAuthPB } from "../../config/pocketbase";

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
  const [exercise, setExercise] = createStore(JSON.parse(JSON.stringify(props.initialExercise)));
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
  exercise: any;
  setExercise: SetStoreFunction<any>;
  parentProps: Props;
}

const ModalContent: Component<ModalProps> = (props) => {
  const { setLoading } = useModalLoading();

  return (
    <>
      <h2 class="pb-2">Exercise Options</h2>
      <Checkbox
        checked={props.exercise.isWarmup}
        onChange={(v) => props.setExercise("isWarmup", v)}
        label="Mark as warmup"
      />
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
    </>
  );
};
