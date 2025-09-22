import { Component } from "solid-js";

import { Meal } from "../../Types";
import { Modal } from "../components";

interface Props {
  setModalVisible: (v: boolean) => void;
  addMeal: (meal: Meal) => Promise<void>;
}

export const ExerciseMoreModal: Component<Props> = (props) => {
  return (
    <Modal setModalVisible={props.setModalVisible}>
      <h2 class="pb-2">Exercise Options</h2>
    </Modal>
  );
};

export default ExerciseMoreModal;
