import { Component, createEffect, createMemo, createSignal, Show } from "solid-js";
import { createStore } from "solid-js/store";
import { useNavigate, useSearchParams } from "@solidjs/router";
import { ClientResponseError } from "pocketbase";
import ArrowLeft from "lucide-solid/icons/arrow-left";

import Container from "../views/app/Container";
import Header from "../views/app/Header";
import { ExerciseList } from "../views/exercises/ExerciseList";
import { useAuthPB } from "../config/pocketbase";
import { Button } from "../components";
import ExerciseForm from "../views/exercises/ExerciseForm";

type SearchParams = {
  exerciseId?: string;
  muscleGroup?: string;
  saved?: string;
  equipment?: string;
  editing?: string;
};

const Exercises: Component = () => {
  const [searchParams, setSearchParams] = useSearchParams<SearchParams>();
  const [selectedEquipmentName, setSelectedEquipmentName] = createSignal<string>("");
  const [exercise, setExercise] = createStore<{ exercise: ExercisesRecordExpand | null }>({ exercise: null });
  const { getExerciseByID } = useAuthPB();
  const navigate = useNavigate();

  const selectedMuscleGroup = createMemo(() => searchParams.muscleGroup || "");
  const setSelectedMuscleGroup = (v?: string) =>
    setSearchParams({ ...searchParams, muscleGroup: v ? v : "" });
  const filterSaved = createMemo(() => searchParams.saved === "1" || false);
  const setFilterSaved = (v?: boolean) => setSearchParams({ ...searchParams, saved: v ? "1" : "" });
  const selectedEquipment = createMemo(() => searchParams.equipment || "");
  const setSelectedEquipment = (v?: EquipmentsRecord) => {
    setSelectedEquipmentName(v?.name || "");
    setSearchParams({ ...searchParams, equipment: v ? v.id : "" });
  };

  const _getExerciseByID = async () => {
    let id = searchParams.exerciseId;

    if (!id) {
      setExercise({ exercise: null });
    } else {
      try {
        const record = await getExerciseByID(id);
        setExercise("exercise", record);
      } catch (e) {
        if (e instanceof ClientResponseError && e.isAbort) {
        } else {
          throw new Error("Problem fetching session", { cause: e });
        }
      }
    }
  };

  createEffect(() => {
    _getExerciseByID();
  });

  return (
    <>
      <Header>
        <Show
          when={exercise.exercise != null && !!searchParams.exerciseId}
          fallback={<h1 class="text-xl font-bold">Exercises</h1>}
        >
          <Button
            variant="text"
            class="flex justify-start items-center space-x-1"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft />
            <h1 class="text-xl font-bold">Back to Exercises</h1>
          </Button>
        </Show>
      </Header>
      <Show
        when={exercise.exercise != null && !!searchParams.exerciseId}
        fallback={
          <Container class="py-0 overflow-y-auto">
            <ExerciseList
              selectedMuscleGroup={selectedMuscleGroup}
              setSelectedMuscleGroup={setSelectedMuscleGroup}
              selectedEquipmentName={selectedEquipmentName}
              filterSaved={filterSaved}
              setFilterSaved={setFilterSaved}
              selectedEquipment={selectedEquipment}
              setSelectedEquipment={setSelectedEquipment}
              onClick={(exercise) => setSearchParams({ ...searchParams, exerciseId: exercise.id })}
              containerClass="pb-25"
            />
          </Container>
        }
      >
        <Container class="overflow-y-auto">
          <ExerciseForm
            exercise={exercise.exercise!}
            editing={!!searchParams.editing}
            setEditing={(v: boolean) =>
              setSearchParams({ ...searchParams, editing: v ? "1" : "" }, { replace: true })
            }
          />
        </Container>
      </Show>
    </>
  );
};

export default Exercises;
