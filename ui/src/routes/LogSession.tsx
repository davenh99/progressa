import { Component, createEffect, createSignal, onMount, Show, untrack } from "solid-js";
import { Tabs } from "@kobalte/core/tabs";
import { createStore } from "solid-js/store";
import { useNavigate, useParams } from "@solidjs/router";

import { useAuthPB } from "../config/pocketbase";
import { DataInput, Input, DataTextArea, TagArea, DataSleepQualitySelector } from "../components";
import Container from "../views/Container";
import type { SleepQuality, UserSession, UserSessionCreateData } from "../../Types";
import { MealList, UserSessionExerciseList } from "../views/data";
import Loading from "../views/Loading";
import { ClientResponseError } from "pocketbase";

const LogSession: Component = () => {
  const [loading, setLoading] = createSignal(false);
  const [session, setSession] = createStore<{ session: UserSession | null }>({ session: null });
  const [date, setDate] = createSignal<string>(new Date().toLocaleDateString("en-CA"));
  const { pb, user, updateRecord, getSessionByDate, getSessionByID } = useAuthPB();
  const navigate = useNavigate();
  const params = useParams();
  let setSessionFromDate = false;

  const createSession = async (field?: string, newVal?: any) => {
    const createData: UserSessionCreateData = {
      name: "",
      notes: "",
      tags: [],
      user: user.id,
      userDay: date(),
      userHeight: user.height,
      userWeight: user.weight,
      itemsOrder: [],
      mealsOrder: [],
    };
    if (field !== undefined) {
      (createData as any)[field] = newVal;
    }
    try {
      const newSession = await pb.collection<UserSession>("userSessions").create(createData);
      setSession({ session: newSession });

      navigate(`/log/${newSession.id}`, { replace: true });
      return newSession;
    } catch (e) {
      console.log(e);
    }
    return null;
  };

  const sessionUpdate = async (recordID: string, field: string, newVal: any) => {
    if (params.id) {
      return await updateRecord<UserSession>("userSessions", recordID, field, newVal);
    } else {
      return await createSession(field, newVal);
    }
  };

  const updateWeight = async (v: number) => {
    // also update the profile weight if it's the current day
    if (date() === new Date().toLocaleDateString("en-CA")) {
      updateRecord("users", user.id, "weight", v);
    }
    return sessionUpdate(params.id, "userWeight", v);
  };

  const _getSessionByDate = async (date: string) => {
    // console.log(`getting session by date: ${date}`);
    setLoading(true);

    try {
      const s = await getSessionByDate(date);
      if (s) {
        setSessionFromDate = true;
        setSession("session", s);
        navigate(`/log/${s.id}`, { replace: true });
      } else {
        setSession("session", null);
        navigate(`/log`, { replace: true });
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const _getSessionByID = async () => {
    // console.log(`getting session by id: ${params.id}, fromdate?: ${setSessionFromDate}`);
    if (setSessionFromDate) {
      setSessionFromDate = false;
      return; // skip refetch
    }
    if (params.id) {
      setLoading(true);
      try {
        const s = await getSessionByID(params.id);
        setSession("session", s);
        if (s) {
          setDate(s.userDay);
        } else {
          navigate(`/log`, { replace: true });
        }
      } catch (e) {
        if (e instanceof ClientResponseError && e.status === 0) {
          // ignore auto cancels
        } else {
          console.log(e);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  createEffect(() => {
    _getSessionByID();
  });

  onMount(() => {
    // console.log("on mount called");
    if (!params.id) {
      _getSessionByDate(date());
    }
  });

  return (
    <>
      <Container>
        <Input
          label="Date"
          type="date"
          value={date()}
          onInput={async (e) => {
            const newDate = e.currentTarget.value;
            setDate(newDate);
            _getSessionByDate(newDate);
          }}
        />

        <Show when={!loading()} fallback={<Loading />}>
          <div class="space-y-2">
            <DataInput
              label="Session Name"
              value={session.session?.name ?? `Workout on ${date()}`}
              onValueChange={(v) => setSession("session", "name", v as string)}
              type="text"
              saveFunc={(v) => sessionUpdate(params.id, "name", v)}
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
              saveFunc={(v: string) => sessionUpdate(params.id, "notes", v)}
            />

            <TagArea
              tags={session.session?.expand?.tags ?? []}
              setTags={(tags) => setSession("session", "expand", "tags", tags)}
              modelName="userSessions"
              recordID={params.id}
              updateRecord={(_, recordID, column, newVal) => sessionUpdate(recordID, column, newVal)}
            />
          </div>

          <Tabs class="mt-5">
            <Tabs.List class="border-b-1">
              <Tabs.Trigger value="exercises" class="p-2 hover:bg-ash-gray-600">
                Exercises
              </Tabs.Trigger>
              <Tabs.Trigger value="meals-sleep" class="p-2 hover:bg-ash-gray-600">
                Meals + Sleep
              </Tabs.Trigger>
              <Tabs.Indicator />
            </Tabs.List>
            <Tabs.Content value="exercises">
              <div class="m-10">
                <UserSessionExerciseList
                  sessionExercises={session.session?.expand?.userSessionExercises_via_userSession ?? []}
                  sessionID={params.id}
                  sessionDay={date}
                  createSession={createSession}
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
                    saveFunc={(v: string) => sessionUpdate(params.id, "sleepQuality", v)}
                  />
                </div>
                <MealList
                  meals={session.session?.expand?.meals_via_userSession ?? []}
                  sessionID={params.id}
                  sessionDay={date}
                  createSession={createSession}
                />
              </div>
            </Tabs.Content>
          </Tabs>
        </Show>
      </Container>
    </>
  );
};

export default LogSession;
