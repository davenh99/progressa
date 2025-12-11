import { Component, createEffect, createMemo, createSignal, Show } from "solid-js";
import { ColumnDef } from "@tanstack/solid-table";
import ArrowRight from "lucide-solid/icons/arrow-right";
import Filter from "lucide-solid/icons/list-filter-plus";

import { Button, Tag } from "../../components";
import EquipmentSelectModal from "./EquipmentSelectModal";
import MuscleGroupSelectModal from "./MuscleGroupSelectModal";
import List from "../app/List";
import { useStore } from "../../config/store";
import { useAuthPB } from "../../config/pocketbase";

interface Props {
  onClick: (exercise: ExercisesRecordExpand) => void;
  containerClass?: string;
}

export const ExerciseList: Component<Props> = (props) => {
  const { exercises } = useStore();
  // TODO replace signals with query params?
  const [showEquipmentSelect, setShowEquipmentSelect] = createSignal(false);
  const [selectedEquipment, setSelectedEquipment] = createSignal<EquipmentsRecord>();
  const [showMuscleGroupSelect, setShowMuscleGroupSelect] = createSignal(false);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = createSignal<string>("");
  const [filterSaved, setFilterSaved] = createSignal(false);
  const { pb } = useAuthPB();

  const createExercise = async () => {
    try {
      const record = await pb.collection("exercises").create({});
    } catch (e) {
      console.error(e);
    }
  };

  const filteredData = createMemo(() => {
    return exercises.data.filter((item) => {
      let validRow = true;

      if (
        !!selectedEquipment() &&
        !(
          item.equipmentPrimary?.includes(selectedEquipment()!.id) ||
          item.equipmentSecondary?.includes(selectedEquipment()!.id)
        )
      ) {
        validRow = false;
      }

      if (!!selectedMuscleGroup() && !(item.targetMuscleGroup === selectedMuscleGroup())) {
        validRow = false;
      }

      if (filterSaved() && !item.expand?.exercisePreferences_via_exercise?.[0].saved) {
        validRow = false;
      }

      return validRow;
    });
  });

  const columns = createMemo<ColumnDef<ExercisesRecord>[]>(() => [
    {
      accessorKey: "name",
      header: "Exercise",
      cell: (ctx) => (
        <div class="flex justify-between">
          <div class="flex-1 truncate">{ctx.getValue() as Element}</div>
          <ArrowRight class="self-end" />
        </div>
      ),
    },
  ]);

  return (
    <>
      <Show when={showEquipmentSelect()}>
        <EquipmentSelectModal
          setModalVisible={setShowEquipmentSelect}
          selectEquipment={setSelectedEquipment}
        />
      </Show>
      <Show when={showMuscleGroupSelect()}>
        <MuscleGroupSelectModal
          setModalVisible={setShowMuscleGroupSelect}
          selectMuscleGroup={(m) => setSelectedMuscleGroup(m.name)}
        />
      </Show>
      <List<ExercisesRecordExpand>
        headerActions={
          <>
            <div class="flex items-center space-x-2 mt-2 mb-1">
              <Button
                class="flex-1 py-0 flex items-center space-x-1 justify-center"
                onClick={() => setShowEquipmentSelect(true)}
              >
                <Filter size={16} />
                <span>Equipment</span>
              </Button>
              <Button
                class="flex-1 py-0 flex items-center space-x-1 justify-center"
                onClick={() => setShowMuscleGroupSelect(true)}
              >
                <Filter size={16} />
                <span>Muscles</span>
              </Button>
              <Button
                class="flex-1 py-0 flex items-center space-x-1 justify-center"
                onClick={() => setFilterSaved(!filterSaved())}
                variantColor={filterSaved() ? "good" : "neutral"}
              >
                <Filter size={16} />
                <span>Saved</span>
              </Button>
            </div>
            <div class="flex items-center space-x-2 mt-2 mb-1 flex-wrap">
              <Show when={!!selectedEquipment()}>
                <Tag
                  title={`Equipment: ${selectedEquipment()!.name}`}
                  colorHex="#4ADE80"
                  onClick={() => setSelectedEquipment(undefined)}
                  size="s"
                />
              </Show>
              <Show when={!!selectedMuscleGroup()}>
                <Tag
                  title={`Muscles: ${selectedMuscleGroup()}`}
                  colorHex="#4ADE80"
                  onClick={() => setSelectedMuscleGroup("")}
                  size="s"
                />
              </Show>
            </div>
          </>
        }
        data={filteredData}
        columns={columns}
        onRowClick={props.onClick}
        showItemCount
        loading={exercises.loading}
        containerClass={props.containerClass}
        createFunc={createExercise}
      />
    </>
  );
};
