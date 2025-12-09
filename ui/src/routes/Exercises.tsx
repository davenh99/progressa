import { Component, createEffect, Show } from "solid-js";
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
  exerciseId: string;
};

const Exercises: Component = () => {
  const [searchParams, setSearchParams] = useSearchParams<SearchParams>();
  const [exercise, setExercise] = createStore<{ exercise: ExercisesRecordExpand | null }>({ exercise: null });
  const { getExerciseByID } = useAuthPB();
  const navigate = useNavigate();

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
      <Container class="py-0 overflow-y-auto">
        <Show
          when={exercise.exercise != null && !!searchParams.exerciseId}
          fallback={
            <ExerciseList
              onClick={(exercise) => setSearchParams({ exerciseId: exercise.id })}
              containerClass="pb-25"
            />
          }
        >
          <ExerciseForm exercise={exercise.exercise!} />
        </Show>
      </Container>
    </>
  );
};

export default Exercises;
