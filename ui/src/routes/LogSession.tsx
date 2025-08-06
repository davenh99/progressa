import { Component, createEffect, createSignal, For, onMount, Show } from "solid-js";
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

const Basesession = {
  name: "",
  userDay: new Date().toLocaleDateString("en-CA"),
  notes: "",
  tags: [] as Tag[],
  sessionExercises: [] as UserSessionExercise[],
};

const LogSession: Component = () => {
  const [loading, setLoading] = createSignal(true);
  const [session, setSession] = createStore(Basesession);
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
        userDay: session.userDay,
        userHeight: user.height,
        userWeight: user.weight,
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
        session.tags.filter((tag) => tag.name !== t.name)
      );
    } catch (e) {
      console.log(e);
    }
  };

  const getSession = async () => {
    const expandFields =
      "tags, userSessionExercises_via_userSession.exercise.measurementType.measurementValues_via_measurementType, userSessionExercises_via_userSession.measurementValue";
    try {
      if (params.id) {
        // TODO need to come up with better way to avoid the double call to backend
        // atm, if a matching date is found, we nav to it's id then get it again...
        setLoading(true);
        const s = await pb
          .collection<UserSession>("userSessions")
          .getOne(params.id, { expand: expandFields });

        // TODO should tidy up below to avoid the duplication
        setSession("name", s.name);
        setSession("userDay", s.userDay);
        setSession("notes", s.notes);
        setSession("tags", s.expand?.tags ?? []);
        setSession("sessionExercises", s.expand?.userSessionExercises_via_userSession ?? []);
      } else {
        const s = await pb
          .collection<UserSession>("userSessions")
          .getFirstListItem(`userDay = '${session.userDay}'`, {
            expand: expandFields,
          });

        setSession("name", s.name);
        setSession("userDay", s.userDay);
        setSession("notes", s.notes);
        setSession("tags", s.expand?.tags ?? []);
        setSession("sessionExercises", s.expand?.userSessionExercises_via_userSession ?? []);

        navigate(`/workouts/log/${s.id}`, { replace: true });
      }
    } catch (e) {
      if (e instanceof ClientResponseError && e.status === 404) {
        setSession(reconcile(Basesession));
      } else {
        console.log(e);
      }
    } finally {
      setLoading(false);
    }
  };

  createEffect(() => {
    getSession();
  });

  return (
    <>
      <Header />
      <Container>
        <Input
          label="Date"
          type="date"
          value={session.userDay}
          onInput={(e) => {
            navigate("/workouts/log/", { replace: true });
            setSession("userDay", e.target.value);
          }}
        />

        <Show when={!loading()} fallback={<Loading />}>
          <DataInput
            label="Session Name"
            initial={session.name}
            type="text"
            saveFunc={(v: string) => sessionUpdate(params.id, "name", v)}
          />

          <DataTextArea
            label="Notes"
            initial={session.notes}
            saveFunc={(v: string) => sessionUpdate(params.id, "notes", v)}
          />

          <p>Exercises</p>
          <UserSessionExerciseList
            sessionExercises={session.sessionExercises}
            sessionID={params.id}
            sessionDay={session.userDay}
            getSession={getSession}
          />

          <Input label="Tags" type="text" onKeyDown={handleTagInput} placeholder="Add tags (press Enter)" />

          <For each={session.tags}>{(t) => <TagComponent name={t.name} onClick={() => deleteTag(t)} />}</For>
        </Show>
      </Container>
    </>
  );
};

export default LogSession;
