import { Component } from "solid-js";

import { Modal } from "../../components";
import { ExerciseList } from "./ExerciseList";

interface Props {
  setModalVisible: (v: boolean) => void;
  selectExercise: (exercise: ExercisesRecord) => Promise<void>;
}

export const ExerciseSelectModal: Component<Props> = (props) => {
  return (
    <Modal setModalVisible={props.setModalVisible} zIndexClass="z-60" title="Select Exercise">
      <ExerciseList onClick={(exercise: ExercisesRecord) => props.selectExercise(exercise)} />
    </Modal>
  );
};

export default ExerciseSelectModal;
