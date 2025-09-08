import { Component, createEffect, createSignal, Show } from "solid-js";
import { Tabs } from "@kobalte/core/tabs";
import { createStore } from "solid-js/store";
import { useSearchParams } from "@solidjs/router";

import { useAuthPB } from "../config/pocketbase";
import { DataInput, Input, DataTextArea, TagArea, DataSleepQualitySelector, Button } from "../components";
import Container from "../views/Container";
import type { SleepQuality, UserSession, UserSessionCreateData } from "../../Types";
import { MealList, UserSessionExerciseList } from "../views/data";
import Loading from "../views/Loading";
import LogSessionNav from "../views/LogSessionNav";
import { ClientResponseError } from "pocketbase";

type SearchParams = {
  date: string;
};

const LogSession: Component = () => {
  const [loading, setLoading] = createSignal(false);
  const [session, setSession] = createStore<{ session: UserSession | null }>({ session: null });
  const { pb, user, updateRecord, getSessionByDate } = useAuthPB();
  const [searchParams, setSearchParams] = useSearchParams<SearchParams>();

  const createSession = async () => {
    if (!searchParams.date) {
      throw new Error("Tried to create a session without a date");
    }
    const createData: UserSessionCreateData = {
      name: "Workout",
      notes: "",
      tags: [],
      user: user.id,
      userDay: searchParams.date,
      userHeight: user.height,
      userWeight: user.weight,
      itemsOrder: [],
      mealsOrder: [],
    };
    try {
      const newSession = await pb.collection<UserSession>("userSessions").create(createData);
      setSession({ session: newSession });
    } catch (e) {
      console.log(e);
    }
  };

  const sessionUpdate = async (field: string, newVal: any) => {
    if (session.session?.id) {
      return await updateRecord<UserSession>("userSessions", session.session?.id, field, newVal);
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
      <Container>
        <header class="p-4 border-b bg-white flex flex-row justify-between">
          <h1 class="text-xl font-bold">Log Session</h1>
          <Input
            type="date"
            value={searchParams.date}
            onInput={async (e) => setSearchParams({ date: e.currentTarget.value })}
          />
        </header>

        <Show when={!loading()} fallback={<Loading />}>
          <Show
            when={!!session.session}
            fallback={
              <>
                <p>No session yet for this date</p>
                <Button onClick={() => createSession()}>Create Session</Button>
              </>
            }
          >
            <Tabs aria-label="Log session navigation" class="w-full">
              <LogSessionNav />

              <Tabs.Content value="exercises">
                <div class="m-10">
                  <UserSessionExerciseList
                    sessionExercises={session.session?.expand?.userSessionExercises_via_userSession ?? []}
                    sessionID={session.session!.id}
                  />
                </div>
              </Tabs.Content>

              <Tabs.Content value="meals-sleep">
                <div class="m-10">
                  <div>
                    <p>rate your sleep quality: </p>
                    <DataSleepQualitySelector
                      value={session.session?.sleepQuality ?? ""}
                      onValueChange={(v) => setSession("session", "sleepQuality", v as SleepQuality)}
                      saveFunc={(v: string) => sessionUpdate("sleepQuality", v)}
                    />
                  </div>
                  <MealList
                    meals={session.session?.expand?.meals_via_userSession ?? []}
                    sessionID={session.session!.id}
                  />
                </div>
              </Tabs.Content>

              <Tabs.Content value="settings">
                <div class="m-10 space-y-2">
                  <DataInput
                    label="Session Name"
                    // TODO below doesn't save to db, bad design
                    value={session.session?.name ?? "Workout"}
                    onValueChange={(v) => setSession("session", "name", v as string)}
                    type="text"
                    saveFunc={(v) => sessionUpdate("name", v)}
                  />

                  <DataInput
                    label="your weight this day:"
                    type="number"
                    value={session.session?.userWeight ?? user.weight}
                    onValueChange={(v) => setSession("session", "userWeight", Number(v))}
                    saveFunc={(v) => updateWeight(v as number)}
                  />

                  <DataTextArea
                    label="Notes"
                    value={session.session?.notes ?? ""}
                    onValueChange={(v) => setSession("session", "notes", v)}
                    saveFunc={(v: string) => sessionUpdate("notes", v)}
                  />

                  <TagArea
                    tags={session.session?.expand?.tags ?? []}
                    setTags={(tags) => setSession("session", "expand", "tags", tags)}
                    modelName="userSessions"
                    recordID={session.session!.id}
                  />
                </div>
              </Tabs.Content>
            </Tabs>
          </Show>
        </Show>
      </Container>
    </>
  );
};

export default LogSession;
