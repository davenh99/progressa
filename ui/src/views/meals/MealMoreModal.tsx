import { Component, createEffect } from "solid-js";
import { createStore, SetStoreFunction } from "solid-js/store";
import Copy from "lucide-solid/icons/copy";
import Delete from "lucide-solid/icons/x";

import { SessionMeal, Session } from "../../../Types";
import { Button, Input, NumberInput, Modal, TagArea, TextArea } from "../../components";
import { useAuthPB } from "../../config/pocketbase";

interface Props {
  setModalVisible: (visible: boolean) => void;
  initialMeal: SessionMeal;
  sessionID: string;
  setSession: SetStoreFunction<{
    session: Session | null;
  }>;
  deleteRow: () => Promise<void>;
  duplicateRow: () => Promise<void>;
}

export const MealMoreModal: Component<Props> = (props) => {
  const [meal, setMeal] = createStore(JSON.parse(JSON.stringify(props.initialMeal)));
  const { pb, getSessionByID } = useAuthPB();

  const save = async () => {
    try {
      await pb.collection("sessionMeals").update(meal.id, meal);
      // lazy way to refresh the session for now. could also set the state.
      const updatedSession = await getSessionByID(props.sessionID);
      props.setSession({ session: updatedSession });
    } catch (e) {
      console.log(e);
    }
  };

  createEffect(() => setMeal(JSON.parse(JSON.stringify(props.initialMeal))));

  return (
    <Modal saveFunc={save} setModalVisible={() => props.setModalVisible(false)}>
      <div class="overflow-y-auto space-y-1">
        <h2 class="pb-2">Meal Options</h2>
        <Input label="Name" value={meal.name} onChange={(v) => setMeal("name", v)} />
        <TextArea
          label="Description"
          placeholder="My go-to lunch..."
          value={meal.description}
          onInput={(e) => setMeal("description", e.currentTarget.value)}
        />
        <div class="flex space-x-1">
          <NumberInput
            label="Energy"
            rawValue={meal.kj}
            class="flex-1 justify-between"
            width="3.5rem"
            onRawValueChange={(v) => setMeal("kj", v)}
            inputProps={{
              class: "rounded-sm bg-charcoal-600 pr-0.5",
            }}
          />
          <p class="w-4">kj</p>
        </div>
        <div class="flex space-x-1">
          <NumberInput
            label="Protein"
            class="flex-1 justify-between"
            width="3.5rem"
            rawValue={meal.gramsProtein}
            onRawValueChange={(v) => setMeal("gramsProtein", v)}
            inputProps={{
              class: "rounded-sm bg-charcoal-600 pr-0.5",
            }}
          />
          <p class="w-4">g</p>
        </div>
        <div class="flex space-x-1">
          <NumberInput
            label="Carbohydrates"
            class="flex-1 justify-between"
            width="3.5rem"
            rawValue={meal.gramsCarbohydrate}
            onRawValueChange={(v) => setMeal("gramsCarbohydrate", v)}
            inputProps={{
              class: "rounded-sm bg-charcoal-600 pr-0.5",
            }}
          />
          <p class="w-4">g</p>
        </div>
        <div class="flex space-x-1 mb-1.5">
          <NumberInput
            label="Fats"
            class="flex-1 justify-between"
            width="3.5rem"
            rawValue={meal.gramsFat}
            onRawValueChange={(v) => setMeal("gramsFat", v)}
            inputProps={{
              class: "rounded-sm bg-charcoal-600 pr-0.5",
            }}
          />
          <p class="w-4">g</p>
        </div>
        <TagArea
          tags={meal.expand.tags ?? []}
          setTags={(tags) => {
            setMeal("expand", "tags", tags);
            setMeal(
              "tags",
              tags.map((t) => t.id)
            );
          }}
          modelName="sessionMeals"
          recordID={meal.id}
        />
        <div class="flex flex-col mt-3">
          <Button
            variant="text"
            class="flex flex-row items-center space-x-1"
            onClick={() => props.duplicateRow().then(() => props.setModalVisible(false))}
          >
            <Copy size={16} />
            <p>Duplicate</p>
          </Button>
          <Button
            variant="text"
            variantColor="bad"
            class="flex flex-row items-center space-x-1"
            onClick={() => props.deleteRow().then(() => props.setModalVisible(false))}
          >
            <Delete size={16} />
            <p>Delete</p>
          </Button>
        </div>
        <div class="bg-dark-slate-gray-500 w-full h-[2px] my-2 rounded-full"></div>
      </div>
    </Modal>
  );
};

export default MealMoreModal;
