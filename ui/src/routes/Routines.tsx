import { Component, createEffect, Show } from "solid-js";
import { createStore } from "solid-js/store";
import ArrowLeft from "lucide-solid/icons/arrow-left";
import { useNavigate, useSearchParams } from "@solidjs/router";
import { ClientResponseError } from "pocketbase";

import Container from "../views/app/Container";
import Header from "../views/app/Header";
import { Button } from "../components";
import RoutineList from "../views/routines/RoutineList";
import { useAuthPB } from "../config/pocketbase";
import { ROUTINE_EXPAND } from "../../constants";
import { RoutineForm } from "../views/routines/RoutineForm";

type SearchParams = {
  routineId: string;
};

const Routines: Component = () => {
  const [searchParams, setSearchParams] = useSearchParams<SearchParams>();
  const [routine, setRoutine] = createStore<{ routine: RoutinesRecordExpand | null }>({ routine: null });
  const { pb, user, getRoutineByID } = useAuthPB();
  const navigate = useNavigate();

  const createRoutine = async () => {
    const createData: RoutinesUpdatePayload = {
      name: "Routine",
      description: "",
      user: user.id,
      exercisesOrder: [],
    };
    try {
      const newRoutine = await pb
        .collection<RoutinesRecordExpand>("routines")
        .create(createData, { expand: ROUTINE_EXPAND });

      setRoutine({ routine: newRoutine });
      setSearchParams({ routineId: newRoutine.id });
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
          <RoutineForm routine={routine.routine!} setRoutine={setRoutine} />
        </Show>
      </Container>
    </>
  );
};

export default Routines;
