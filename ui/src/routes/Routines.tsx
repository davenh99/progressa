import { Component, createEffect, Show } from "solid-js";
import { createStore } from "solid-js/store";
import ArrowLeft from "lucide-solid/icons/arrow-left";
import { useNavigate, useSearchParams } from "@solidjs/router";
import { ClientResponseError } from "pocketbase";
import Delete from "lucide-solid/icons/x";

import Container from "../views/app/Container";
import Header from "../views/app/Header";
import { Button, DataTextArea, Input } from "../components";
import RoutineList from "../views/routines/RoutineList";
import RoutineExerciseList from "../views/routines/RoutineExerciseList";
import { Routine, RoutineCreateData } from "../../Types";
import { useAuthPB } from "../config/pocketbase";
import { ROUTINE_EXPAND } from "../../constants";

type SearchParams = {
  routineId: string;
};

const Routines: Component = () => {
  const [searchParams, setSearchParams] = useSearchParams<SearchParams>();
  const [routine, setRoutine] = createStore<{ routine: Routine | null }>({ routine: null });
  const { pb, user, updateRecord, getRoutineByID } = useAuthPB();
  const navigate = useNavigate();

  const createRoutine = async () => {
    const createData: RoutineCreateData = {
      name: "Routine",
      description: "",
      user: user.id,
      exercisesOrder: [],
    };
    try {
      const newRoutine = await pb
        .collection<Routine>("routines")
        .create(createData, { expand: ROUTINE_EXPAND });

      setRoutine({ routine: newRoutine });
      setSearchParams({ routineId: newRoutine.id });
    } catch (e) {
      console.error(e);
    }
  };

  const routineUpdate = async (field: string, newVal: any) => {
    if (routine.routine?.id) {
      return await updateRecord<Routine>("routines", routine.routine?.id, field, newVal);
    } else {
      throw new Error("Tried to update a routine when missing id");
    }
  };

  const deleteRoutine = async () => {
    if (routine.routine?.id) throw new Error("Tried to delete a routine when missing id");

    try {
      await pb.collection("routines").delete(routine.routine!.id);
    } catch (e) {
      console.error(e);
    }
  };

  const _getRoutineByID = async () => {
    let id = searchParams.routineId;

    if (!id) {
      setRoutine({ routine: null });
    } else {
      try {
        const r = await getRoutineByID(id);
        setRoutine("routine", r);
      } catch (e) {
        if (e instanceof ClientResponseError && e.isAbort) {
        } else {
          throw new Error("Problem fetching session", { cause: e });
        }
      }
    }
  };

  createEffect(() => {
    _getRoutineByID();
  });

  return (
    <>
      <Header>
        <div class="flex justify-start items-center">
          <Show
            when={routine.routine != null && !!searchParams.routineId}
            fallback={<h1 class="text-xl font-bold">Your Routines</h1>}
          >
            <Button variant="text" onClick={() => navigate(-1)}>
              <ArrowLeft />
            </Button>
            <h1 class="text-xl font-bold">{routine.routine?.name}</h1>
          </Show>
        </div>
      </Header>
      <Container class="overflow-y-auto bg-charcoal-500 py-0 pb-25">
        <Show
          when={routine.routine != null && !!searchParams.routineId}
          fallback={
            <RoutineList
              createRoutine={createRoutine}
              onClick={(r) => setSearchParams({ routineId: r.id })}
            />
          }
        >
          <Input
            label="Name"
            class="mb-3"
            labelPosition="above"
            value={routine.routine!.name}
            saveFunc={async (v) => v && (await routineUpdate("name", v))}
            onChange={(v) => setRoutine("routine", "name", v)}
          />
          <DataTextArea
            label="Description"
            value={routine.routine!.description}
            saveFunc={(v) => routineUpdate("description", v)}
            onValueChange={(v) => setRoutine("routine", "description", v)}
          />
          <div class="mb-3">
            <p class="mt-3">Exercises</p>
            <RoutineExerciseList
              routineExercises={routine.routine!.expand?.routineExercises_via_routine ?? []}
              routineId={routine.routine!.id ?? ""}
              setRoutine={setRoutine}
            />
          </div>
          <Button
            class="flex items-center space-x-1 my-2 w-full justify-center"
            variantColor="bad"
            variant="text"
            onClick={deleteRoutine}
          >
            <Delete size={20} />
            <span>Delete Routine</span>
          </Button>
        </Show>
      </Container>
    </>
  );
};

export default Routines;
