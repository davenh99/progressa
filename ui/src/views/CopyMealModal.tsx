import { Component } from "solid-js";

import { MealList } from "./MealList";
import { Meal } from "../../Types";
import { Modal } from "../components";

interface Props {
  setModalVisible: (v: boolean) => void;
  addMeal: (meal: Meal) => Promise<void>;
}

export const CopyMealModal: Component<Props> = (props) => {
  return (
    <Modal setModalVisible={props.setModalVisible}>
      <h2 class="pb-2">Select Meal</h2>
      <MealList onClick={(meal: Meal) => props.addMeal(meal)} />
    </Modal>
  );
};

export default CopyMealModal;
