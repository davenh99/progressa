import { Component } from "solid-js";
import { Portal } from "solid-js/web";

import { MealList } from "./MealList";
import { Meal } from "../../Types";
import { Button } from "../components";

interface Props {
  setModalVisible: (v: boolean) => void;
  addMeal: (meal: Meal) => Promise<void>;
}

export const CopyMealModal: Component<Props> = (props) => {
  return (
    <Portal>
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/35"
        onClick={() => props.setModalVisible(false)}
      >
        <div
          class="bg-white rounded-xl shadow-lg p-6 w-[35vw] max-h-[60vh]"
          onClick={(e) => e.stopPropagation()}
        >
          <p class="pb-2">Select Exercise</p>
          <MealList onClick={(meal: Meal) => props.addMeal(meal)} />
          <Button onClick={() => props.setModalVisible(false)} class="mt-2">
            Cancel
          </Button>
        </div>
      </div>
    </Portal>
  );
};

export default CopyMealModal;
