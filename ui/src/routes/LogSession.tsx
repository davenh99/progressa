import { Component, createEffect, createSignal, Show } from "solid-js";
import { Tabs } from "@kobalte/core/tabs";
import { createStore } from "solid-js/store";
import { useSearchParams } from "@solidjs/router";

import { useAuthPB } from "../config/pocketbase";
import { DataInput, Input, DataTextArea, TagArea, DataSleepQualitySelector, Button } from "../components";
import Container from "../views/app/Container";
import type { SleepQuality, Session, SessionCreateData } from "../../Types";
import Loading from "../views/app/Loading";
import LogSessionNav from "../views/session/LogSessionNav";
import { ClientResponseError } from "pocketbase";
import SectionHeader from "../views/app/SectionHeader";
import { DataNumberInput } from "../components/NumberInput";
import Blob from "../views/app/Blob";
import { SESSION_EXPAND } from "../config/constants";
import { SessionExerciseList } from "../views/session/SessionExerciseList";
import { SessionMealList } from "../views/session/SessionMealList";

type SearchParams = {
  date: string;
};

const LogSession: Component = () => {
  const [loading, setLoading] = createSignal(false);
  const [session, setSession] = createStore<{ session: Session | null }>({ session: null });
  const { pb, user, updateRecord, getSessionByDate } = useAuthPB();
  const [searchParams, setSearchParams] = useSearchParams<SearchParams>();

  const createSession = async () => {
    if (!searchParams.date) {
      throw new Error("Tried to create a session without a date");
    }
    const createData: SessionCreateData = {
      name: "Workout",
      notes: "",
      tags: [],
      user: user.id,
      userDay: searchParams.date,
      userHeight: user.height,
      userWeight: user.weight,
      exercisesOrder: [],
      mealsOrder: [],
    };
    try {
      const newSession = await pb
        .collection<Session>("sessions")
        .create(createData, { expand: SESSION_EXPAND });
      setSession({ session: newSession });
    } catch (e) {
      console.log(e);
    }
  };

  const sessionUpdate = async (field: string, newVal: any) => {
    if (session.session?.id) {
      return await updateRecord<Session>("sessions", session.session?.id, field, newVal);
    } else {
      throw new Error("Tried to update a session when missing id");
    }
  };

  const updateWeight = async (v: number) => {
    // also update the profile weight if it's the current day
    if (searchParams.date === new Date().toLocaleDateString("en-CA")) {
      updateRecord("users", user.id, "weight", v);
    }
    return sessionUpdate("userWeight", v);
  };

  const _getSessionByDate = async () => {
    let date = searchParams.date;
    if (!date) {
      date = new Date().toLocaleDateString("en-CA");
      setSearchParams({ date });
    }

    try {
      setLoading(true);
      const s = await getSessionByDate(date);
      setSession("session", s);
    } catch (e) {
      if (e instanceof ClientResponseError && e.isAbort) {
      } else {
        throw new Error("Problem fetching session", { cause: e });
      }
    } finally {
      setLoading(false);
    }
  };

  createEffect(() => {
    _getSessionByDate();
  });

  return (
    <>
      <SectionHeader>
        <div class="flex flex-row justify-between">
          <h1 class="text-xl font-bold">Log Session</h1>
          <Input
            type="date"
            class="rounded-md bg-cambridge-blue-800/20 border-1 px-2 py-1 text-cambridge-blue-800"
            value={searchParams.date}
            onInput={async (e) => setSearchParams({ date: e.currentTarget.value })}
          />
        </div>
      </SectionHeader>

      <Show when={!loading()} fallback={<Loading />}>
        <Show
          when={!!session.session}
          fallback={
            <div class="w-full flex flex-col justify-start items-center">
              <p class="mt-2 text-dark-slate-gray-900">No session yet for this date</p>
              <Button variantColor="good" class="mt-4" onClick={() => createSession()}>
                Create Session
              </Button>
            </div>
          }
        >
          <Tabs class="w-full flex-1 flex flex-col overflow-hidden">
            <LogSessionNav />

            <Tabs.Content value="exercises" class="flex flex-1 overflow-hidden">
              <Container class="pb-30">
                <h2>Exercises</h2>
                <SessionExerciseList
                  sessionExercises={session.session?.expand?.sessionExercises_via_session ?? []}
                  sessionID={session.session!.id}
                  setSession={setSession}
                />
              </Container>
            </Tabs.Content>

            <Tabs.Content value="meals-sleep">
              <Container class="space-y-4 pb-30">
                <Blob>
                  <h2>Meals</h2>
                  <SessionMealList
                    meals={session.session?.expand?.sessionMeals_via_session ?? []}
                    sessionID={session.session!.id}
                    setSession={setSession}
                  />
                </Blob>

                <Blob class="space-y-3">
                  <h2>Sleep Quality</h2>
                  <DataSleepQualitySelector
                    value={session.session?.sleepQuality}
                    onValueChange={(v) => setSession("session", "sleepQuality", v as SleepQuality)}
                    saveFunc={(v: string) => sessionUpdate("sleepQuality", v)}
                  />
                </Blob>
              </Container>
            </Tabs.Content>

            <Tabs.Content value="settings">
              <Container class="space-y-2 pb-30">
                <h2 class="mb-4">Session Settings</h2>

                <div>
                  <h3>Session name</h3>
                  <DataInput
                    variant="bordered"
                    value={session.session?.name ?? "Workout"}
                    onValueChange={(v) => setSession("session", "name", v as string)}
                    type="text"
                    saveFunc={(v) => sessionUpdate("name", v)}
                  />
                </div>

                <div class="flex flex-row items-center">
                  <h3 class="mr-2">Your weight this day</h3>
                  <div class="border-2 border-ash-gray-400 rounded-sm flex flex-row p-1">
                    <DataNumberInput
                      value={session.session?.userWeight ?? user.weight}
                      onValueChange={(v) => setSession("session", "userWeight", Number(v))}
                      saveFunc={(v) => updateWeight(v as number)}
                    />
                    <p class="ml-1">kg</p>
                  </div>
                </div>

                <div>
                  <h3>Notes</h3>
                  <DataTextArea
                    value={session.session?.notes ?? ""}
                    onValueChange={(v) => setSession("session", "notes", v)}
                    saveFunc={(v: string) => sessionUpdate("notes", v)}
                  />
                </div>

                <div>
                  <h3>Tags</h3>
                  <TagArea
                    tags={session.session?.expand?.tags ?? []}
                    setTags={(tags) => setSession("session", "expand", "tags", tags)}
                    modelName="sessions"
                    recordID={session.session!.id}
                  />
                </div>
              </Container>
            </Tabs.Content>
          </Tabs>
        </Show>
      </Show>
    </>
  );
};

export default LogSession;
