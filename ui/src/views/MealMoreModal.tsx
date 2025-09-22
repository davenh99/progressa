import { Component } from "solid-js";
import { SetStoreFunction } from "solid-js/store";

import { Meal } from "../../Types";
import { DataInput, Modal } from "../components";
import { useAuthPB } from "../config/pocketbase";

interface Props {
  setModalVisible: (visible: boolean) => void;
  setSelectedMeal: SetStoreFunction<{
    meal: Meal;
  }>;
  meal: Meal;
}

export const MealMoreModal: Component<Props> = (props) => {
  const { updateRecord } = useAuthPB();

  return (
    <Modal setModalVisible={() => props.setModalVisible(false)}>
      <h2 class="pb-2">Meal Options</h2>
      <DataInput
        value={props.meal.name}
        onValueChange={(v) => props.setSelectedMeal("meal", "name", v as string)}
        saveFunc={(v) => updateRecord("meals", props.meal.id, "name", v)}
      />
    </Modal>
  );
};

export default MealMoreModal;
