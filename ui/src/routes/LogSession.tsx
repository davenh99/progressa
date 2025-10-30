import { Component, createEffect, createSignal, Show } from "solid-js";
import { Tabs } from "@kobalte/core/tabs";
import { createStore } from "solid-js/store";
import { useSearchParams } from "@solidjs/router";

import { useAuthPB } from "../config/pocketbase";
import { Input, DataTextArea, TagArea, DataSleepQualitySelector, Button, DateInput } from "../components";
import Container from "../views/app/Container";
import type { SleepQuality, Session, SessionCreateData } from "../../Types";
import Loading from "../views/app/Loading";
import LogSessionNav from "../views/session/LogSessionNav";
import { ClientResponseError } from "pocketbase";
import Header from "../views/app/Header";
import { NumberInput } from "../components/NumberInput";
import Card from "../views/app/Card";
import { SESSION_EXPAND } from "../../constants";
import { SessionExerciseList } from "../views/session/SessionExerciseList";
import { SessionMealList } from "../views/session/SessionMealList";

export type LogSessionTab = "exercises" | "meals" | "settings";

export type LogSessionSearchParams = {
  date?: string;
  tab?: LogSessionTab;
};

const LogSession: Component = () => {
  const [loading, setLoading] = createSignal(false);
  const [session, setSession] = createStore<{ session: Session | null }>({ session: null });
  const { pb, user, updateRecord, getSessionByDate } = useAuthPB();
  const [searchParams, setSearchParams] = useSearchParams<LogSessionSearchParams>();

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
      console.error(e);
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
      <Header>
        <div class="flex flex-row justify-between">
          <h1 class="text-xl font-bold">Log Session</h1>
          <DateInput
            inputProps={{
              value: searchParams.date,
              onInput: async (e) => setSearchParams({ date: e.currentTarget.value }),
            }}
          />
        </div>
      </Header>

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
          <Tabs
            class="w-full flex-1 flex flex-col overflow-hidden"
            value={searchParams.tab ?? "exercises"}
            onChange={(v) => setSearchParams({ tab: v })}
          >
            <LogSessionNav />

            <Tabs.Content value="exercises" class="flex flex-1 overflow-hidden">
              <Container class="pb-30 overflow-y-auto">
                <h2>Exercises</h2>
                <SessionExerciseList
                  sessionExercises={session.session?.expand?.sessionExercises_via_session ?? []}
                  sessionID={session.session!.id}
                  setSession={setSession}
                />
              </Container>
            </Tabs.Content>

            <Tabs.Content value="meals">
              <Container class="space-y-4 pb-30 overflow-y-auto">
                <Card>
                  <h2>Meals</h2>
                  <SessionMealList
                    meals={session.session?.expand?.sessionMeals_via_session ?? []}
                    sessionID={session.session!.id}
                    setSession={setSession}
                  />
                </Card>

                <Card class="space-y-3">
                  <h2>Sleep Quality</h2>
                  <DataSleepQualitySelector
                    value={session.session?.sleepQuality}
                    onValueChange={(v) => setSession("session", "sleepQuality", v as SleepQuality)}
                    saveFunc={(v: string) => sessionUpdate("sleepQuality", v)}
                  />
                </Card>
              </Container>
            </Tabs.Content>

            <Tabs.Content value="settings">
              <Container class="space-y-2 pb-30 overflow-y-auto">
                <h2 class="mb-4">Session Settings</h2>

                <div>
                  <h3>Session name</h3>
                  <Input
                    value={session.session?.name ?? "Workout"}
                    onChange={(v) => setSession("session", "name", v)}
                    saveFunc={(v) => sessionUpdate("name", v)}
                  />
                </div>

                <div class="flex flex-row items-center">
                  <h3 class="mr-2">Your weight this day</h3>
                  <div class="bg-charcoal-600 rounded-sm flex flex-row p-1">
                    <NumberInput
                      rawValue={session.session?.userWeight ?? user.weight}
                      onRawValueChange={(v) => setSession("session", "userWeight", Number(v))}
                      saveFunc={(v) => updateWeight(v as number)}
                    />
                    <p class="ml-1">kg</p>
                  </div>
                </div>

                <div>
                  <h3>Notes</h3>
                  <DataTextArea
                    placeholder="Feeling rested today..."
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
