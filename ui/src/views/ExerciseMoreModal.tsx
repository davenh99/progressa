import { Component } from "solid-js";
import { SetStoreFunction } from "solid-js/store";

import { UserSession, UserSessionExercise } from "../../Types";
import { Modal } from "../components";

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
  return (
    <Modal setModalVisible={props.setModalVisible}>
      <h2 class="pb-2">Exercise Options</h2>
    </Modal>
  );
};

export default ExerciseMoreModal;
