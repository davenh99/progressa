import { Component, createEffect, createSignal, Show, untrack } from "solid-js";
import { Tabs } from "@kobalte/core/tabs";
import { createStore } from "solid-js/store";
import { useNavigate, useParams } from "@solidjs/router";

import { useAuthPB } from "../config/pocketbase";
import Header from "../views/Header";
import { DataInput, Input, DataTextArea, TagArea, DataSleepQualitySelector } from "../components";
import Container from "../views/Container";
import type { UserSession, UserSessionCreateData } from "../../Types";
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

  const sessionUpdate = async (recordID: string, field: string, newVal: any) => {
    if (params.id) {
      return await updateRecord<UserSession>("userSessions", recordID, field, newVal);
    } else {
      const createData: UserSessionCreateData = {
        name: "",
        notes: "",
        tags: [],
        user: user.id,
        userDay: date(),
        userHeight: user.height,
        userWeight: user.weight,
        itemsOrder: [],
      };
      (createData as any)[field] = newVal;

      const newSession = await pb.collection<UserSession>("userSessions").create(createData);
      setSession({ session: newSession });
      setLoading(true);

      navigate(`/workouts/log/${newSession.id}`, { replace: true });
    }
  };

  const updateWeight = async (v: number) => {
    // also update the profile weight if it's the current day
    if (date() === new Date().toLocaleDateString("en-CA")) {
      updateRecord("users", user.id, "weight", v);
    }
    return sessionUpdate(params.id, "userWeight", v);
  };

  // id
  createEffect(() => {
    (async () => {
      if (untrack(() => loading())) {
        // if id was set by date...
        setLoading(false);
      } else {
        if (params.id) {
          setLoading(true);
          try {
            const s = await getSessionByID(params.id);
            setSession("session", s);
            if (s) {
              setDate(s.userDay);
            } else {
              navigate(`/workouts/log`, { replace: true });
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
      }
    })();
  });

  // date
  createEffect(() => {
    (async () => {
      if (!params.id && date()) {
        setLoading(true);
        try {
          const s = await getSessionByDate(date());
          setSession("session", s);
          if (s) {
            navigate(`/workouts/log/${s.id}`, { replace: true });
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
    })();
  });

  return (
    <>
      <Header />
      <Container>
        <Input
          label="Date"
          type="date"
          value={date()}
          onInput={(e) => {
            navigate("/workouts/log", { replace: true });
            setDate(e.currentTarget.value);
          }}
        />

        <Show when={!loading()} fallback={<Loading />}>
          <div class="space-y-2">
            <DataInput
              label="Session Name"
              initial={session.session?.name ?? ""}
              type="text"
              saveFunc={(v) => sessionUpdate(params.id, "name", v)}
            />

            <DataInput
              label="your weight this day:"
              type="number"
              initial={session.session?.userWeight ?? user.weight}
              saveFunc={(v) => updateWeight(v as number)}
            />

            <DataTextArea
              label="Notes"
              initial={session.session?.notes ?? ""}
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
                />
              </div>
            </Tabs.Content>
            <Tabs.Content value="meals-sleep">
              <div class="m-10">
                <div>
                  <p>rate your sleep quality: </p>
                  <DataSleepQualitySelector
                    initial={session.session?.sleepQuality}
                    saveFunc={(v: string) => sessionUpdate(params.id, "sleepQuality", v)}
                  />
                </div>
                <MealList
                  meals={session.session?.expand?.meals_via_userSession ?? []}
                  sessionID={params.id}
                  sessionDay={date}
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
