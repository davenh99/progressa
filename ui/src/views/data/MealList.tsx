import { Accessor, Component } from "solid-js";
import { Meal } from "../../../Types";

interface Props {
  meals: Meal[];
  sessionID: string;
  sessionDay: Accessor<string>;
  getSession: () => Promise<void>;
}

export const MealList: Component<Props> = (props) => {
  return (
    <div class="mt-3">
      <p>meal list</p>
    </div>
  );
};

export default MealList;
