import { Component, createSignal, For, onMount, Show } from "solid-js";
import { Tabs } from "@kobalte/core/tabs";
import { createStore, reconcile } from "solid-js/store";
import { useNavigate, useParams } from "@solidjs/router";
import { ClientResponseError } from "pocketbase";

import { useAuthPB } from "../config/pocketbase";
import Header from "../components/Header";
import { Tag as TagComponent, DataInput, Input, DataTextArea } from "../components";
import Container from "../components/Container";
import type { Tag, UserSession, UserSessionCreateData, UserSessionExercise } from "../../Types";
import { UserSessionExerciseList } from "../views/data";
import Loading from "../views/Loading";
import { sortUserSessionExercises } from "../methods/sortUserSessionExercises";

const Basesession = {
  name: "",
  notes: "",
  userWeight: undefined as number,
  tags: [] as Tag[],
  sessionExercises: [] as UserSessionExercise[],
};

const LogSession: Component = () => {
  const [loading, setLoading] = createSignal(true);
  const [session, setSession] = createStore(Basesession);
  const [date, setDate] = createSignal<string>(new Date().toLocaleDateString("en-CA"));
  const { pb, user, updateRecord } = useAuthPB();
  const navigate = useNavigate();
  const params = useParams();

  const sessionUpdate = async (recordID: string, column: string, newVal: any) => {
    if (params.id) {
      return await updateRecord<UserSession>("userSessions", recordID, newVal, column);
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
        sleepQuality: undefined,
      };

      // TODO is something like 'tags+' valid when creating??
      createData[column] = newVal;

      const newSession = await pb.collection<UserSession>("userSessions").create(createData);

      navigate(`/workouts/log/${newSession.id}`, { replace: true });
    }
  };

  const handleTagInput = async (
    e: KeyboardEvent & { currentTarget: HTMLInputElement; target: HTMLInputElement }
  ) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      e.preventDefault();
      const newTag = e.target.value.trim();

      if (!session.tags.map((t) => t.name).includes(newTag)) {
        try {
          const foundTag = await pb
            .collection<Tag>("tags")
            .getFirstListItem(`createdBy = '${user.id}' && name = '${newTag}'`);

          await sessionUpdate(params.id, "+tags", foundTag.id);
          setSession("tags", [...session.tags, foundTag]);
        } catch (e) {
          if (e instanceof ClientResponseError && e.status == 404) {
            const createdTag = await pb
              .collection<Tag>("tags")
              .create({ name: newTag, public: false, createdBy: user.id });

            await sessionUpdate(params.id, "+tags", createdTag.id);
            setSession("tags", [...session.tags, createdTag]);
          } else {
            console.log(e);
          }
        } finally {
          e.target.value = "";
        }
      }
    }
  };

  const deleteTag = async (t: Tag) => {
    try {
      await updateRecord("userSessions", params.id, t.id, "tags-");
      setSession(
        "tags",
        session.tags.filter((tag) => tag.id !== t.id)
      );
    } catch (e) {
      console.log(e);
    }
  };

  const getSession = async () => {
    const expandFields =
      "tags, userSessionExercises_via_userSession.exercise.measurementType.measurementValues_via_measurementType, userSessionExercises_via_userSession.measurementValue, userSessionExercises_via_userSession.variation, userSessionExercises_via_userSession.tags";
    if (params.id) {
      // TODO need to come up with better way to avoid the double call to backend
      // atm, if a matching date is found, we nav to it's id then get it again...
      try {
        setLoading(true);
        const s = await pb
          .collection<UserSession>("userSessions")
          .getOne(params.id, { expand: expandFields });

        // TODO should tidy up below to avoid the duplication
        setDate(s.userDay);
        setSession("name", s.name);
        setSession("userWeight", s.userWeight);
        setSession("notes", s.notes);
        setSession("tags", s.expand?.tags ?? []);
        setSession(
          "sessionExercises",
          sortUserSessionExercises(s.expand?.userSessionExercises_via_userSession ?? [], s.itemsOrder ?? [])
        );
      } catch (e) {
        if (e instanceof ClientResponseError && e.status === 404) {
          navigate(`/workouts/log`, { replace: true });
        } else {
          console.log(e);
        }
      }
    } else {
      try {
        const s = await pb.collection<UserSession>("userSessions").getFirstListItem(`userDay = '${date()}'`, {
          expand: expandFields,
        });

        setDate(s.userDay);
        setSession("name", s.name);
        setSession("userWeight", s.userWeight);
        setSession("notes", s.notes);
        setSession("tags", s.expand?.tags ?? []);
        setSession(
          "sessionExercises",
          sortUserSessionExercises(s.expand?.userSessionExercises_via_userSession ?? [], s.itemsOrder ?? [])
        );

        navigate(`/workouts/log/${s.id}`, { replace: true });
      } catch (e) {
        if (e instanceof ClientResponseError && e.status === 404) {
          setSession(reconcile(Basesession));
        } else {
          console.log(e);
        }
      } finally {
      }
    }
    setLoading(false);
  };

  // createEffect(() => {
  //   console.log(session.sessionExercises.length);
  // });

  // createEffect(() => {
  //   console.log(date());
  // });

  const updateWeight = async (v: number) => {
    // also update the profile weight if it's the current day
    if (date() === new Date().toLocaleDateString("en-CA")) {
      updateRecord("users", user.id, v, "weight");
    }
    return sessionUpdate(params.id, "userWeight", v);
  };

  onMount(() => {
    getSession();
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
            setDate(e.target.value);
            navigate("/workouts/log/", { replace: true });
          }}
        />

        <Show when={!loading()} fallback={<Loading />}>
          <div class="space-y-2">
            <DataInput
              label="Session Name"
              initial={session.name}
              type="text"
              saveFunc={(v: string) => sessionUpdate(params.id, "name", v)}
            />

            <DataInput
              label="your weight this day:"
              type="number"
              initial={session.userWeight ?? user.weight}
              saveFunc={updateWeight}
            />

            <DataTextArea
              label="Notes"
              initial={session.notes}
              saveFunc={(v: string) => sessionUpdate(params.id, "notes", v)}
            />

            <Input label="Tags" type="text" onKeyDown={handleTagInput} placeholder="Add tags (press Enter)" />
            <div class="">
              <For each={session.tags}>
                {(t) => <TagComponent name={t.name} onClick={() => deleteTag(t)} />}
              </For>
            </div>
          </div>

          <Tabs>
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
                  sessionExercises={session.sessionExercises}
                  sessionID={params.id}
                  sessionDay={date()}
                  getSession={getSession}
                />
              </div>
            </Tabs.Content>
            <Tabs.Content value="meals-sleep">
              <div class="m-10">
                <p>meal an sleep. coming soon...</p>
              </div>
            </Tabs.Content>
          </Tabs>
        </Show>
      </Container>
    </>
  );
};

export default LogSession;
