import { Component } from "solid-js";

import { Exercise } from "../../../Types";
import { Modal } from "../../components";
import { ExerciseList } from "./ExerciseList";

interface Props {
  setModalVisible: (v: boolean) => void;
  selectExercise: (exercise: Exercise) => Promise<void>;
}

export const ExerciseSelectModal: Component<Props> = (props) => {
  return (
    <Modal setModalVisible={props.setModalVisible} zIndexClass="z-60">
      <h2 class="pb-2">Select Exercise</h2>
      <ExerciseList onClick={(exercise: Exercise) => props.selectExercise(exercise)} />
    </Modal>
  );
};

export default ExerciseSelectModal;
