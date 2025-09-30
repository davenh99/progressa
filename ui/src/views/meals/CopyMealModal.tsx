import { Component } from "solid-js";

import { MealList } from "../meals/MealList";
import { SessionMeal } from "../../../Types";
import { Modal } from "../../components";

interface Props {
  setModalVisible: (v: boolean) => void;
  addMeal: (meal: SessionMeal) => Promise<void>;
}

export const CopyMealModal: Component<Props> = (props) => {
  return (
    <Modal setModalVisible={props.setModalVisible}>
      <h2 class="pb-2">Select Meal</h2>
      <MealList onClick={(meal: SessionMeal) => props.addMeal(meal)} />
    </Modal>
  );
};

export default CopyMealModal;
