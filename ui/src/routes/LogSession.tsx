import { Component, createEffect, createSignal, For, onMount, Show } from "solid-js";
import { createStore } from "solid-js/store";
import { useNavigate, useParams } from "@solidjs/router";
import { ClientResponseError } from "pocketbase";

import { useAuthPB } from "../config/pocketbase";
import Header from "../components/Header";
import { Button, Tag as TagComponent, Input, TextArea } from "../components";
import Container from "../components/Container";
import type { Tag, UserSession, UserSessionCreateData, UserSessionExercise } from "../../Types";
import { UserSessionExerciseList } from "../views/data";

interface SaveSessionProps {
  nextTagID?: string;
}

const Basesession = {
  name: "",
  userDay: new Date().toLocaleDateString("en-CA"),
  notes: "",
  tags: [] as Tag[],
  sessionExercises: [] as UserSessionExercise[],
};

const LogSession: Component = () => {
  const [dateSelected, setDateSelected] = createSignal(false);
  const [loading, setLoading] = createSignal(true);
  const [session, setSession] = createStore(Basesession);
  const { pb, user } = useAuthPB();
  const navigate = useNavigate();
  const params = useParams();

  const getSession = async () => {
    try {
      let session: UserSession;

      if (params.id) {
        session = await pb.collection<UserSession>("userSessions").getOne(params.id, {
          expand:
            "tags, userSessionExercises_via_userSession.exercise, userSessionExercises_via_userSession.variation",
        });
      } else {
        session = await pb
          .collection<UserSession>("userSessions")
          .getFirstListItem(`userDay = '${session.userDay}'`, {
            expand:
              "tags, userSessionExercises_via_userSession.exercise, userSessionExercises_via_userSession.variation",
          });
      }

      setSession("name", session.name);
      setSession("userDay", session.userDay);
      setSession("notes", session.notes);
      setSession("tags", session.expand?.tags ?? []);
      setSession("sessionExercises", session.expand?.userSessionExercises_via_userSession ?? []);
    } catch (e) {
      if (e instanceof ClientResponseError && e.status == 404) {
      } else {
        console.log(e);
      }
    } finally {
      setLoading(false);
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

          await saveSession({ nextTagID: foundTag.id });

          setSession("tags", [...session.tags, foundTag]);
        } catch (e) {
          if (e instanceof ClientResponseError && e.status == 404) {
            const createdTag = await pb
              .collection<Tag>("tags")
              .create({ name: newTag, public: false, createdBy: user.id });

            await saveSession({ nextTagID: createdTag.id });

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
      await pb.collection<UserSession>("userSessions").update(params.id, { "tags-": [t.id] });
      setSession(
        "tags",
        session.tags.filter((tag) => tag.name !== t.name)
      );
    } catch (e) {
      console.log(e);
    }
  };

  // TODO we could make this only send the relevant data
  const saveSession = async ({ nextTagID }: SaveSessionProps) => {
    let updateData = {
      name: session.name,
      notes: session.notes,
      tags: session.tags.map((t) => t.id),
    };

    if (nextTagID) {
      updateData.tags = [...updateData.tags, nextTagID];
    }

    try {
      if (params.id) {
        await pb.collection<UserSession>("userSessions").update(params.id, updateData);
      } else {
        const createData: UserSessionCreateData = {
          ...updateData,
          user: user.id,
          userDay: session.userDay,
          userHeight: user.height,
          userWeight: user.weight,
          sleepQuality: "fair",
        };

        const newSession = await pb.collection<UserSession>("userSessions").create(createData);
        navigate(`/workouts/log/${newSession.id}`, { replace: true });
      }
    } catch (e) {
      console.log(e);
    }
  };

  onMount(() => {
    getSession();

    if (params.id) {
      setDateSelected(true);
    }
  });

  return (
    <>
      <Header />
      <Container>
        <Show
          when={dateSelected()}
          fallback={
            <>
              <p>Select Date</p>
              <Input
                label="Date"
                type="date"
                value={session.userDay}
                onInput={(e) => {
                  setSession("userDay", e.target.value);
                  getSession();
                }}
              />
              <Show when={!loading() && session.name}>
                <p>Found session: {session.name}</p>
              </Show>
              <Button onClick={() => setDateSelected(true)}>Continue</Button>
            </>
          }
        >
          <p>{session.userDay}</p>
          <Button
            onClick={() => {
              setDateSelected(false);
              setLoading(true);
              setSession(Basesession);
              navigate("/workouts/log");
            }}
          >
            back to select date
          </Button>

          <Input
            label="Session Name"
            type="text"
            value={session.name}
            onInput={(e) => setSession("name", e.target.value)}
          />

          <TextArea
            label="Notes"
            value={session.notes}
            onInput={(e) => setSession("notes", e.target.value)}
          />

          <p>Exercises</p>
          <UserSessionExerciseList sessionExercises={session.sessionExercises} sessionID={params.id} />

          <Input label="Tags" type="text" onKeyDown={handleTagInput} placeholder="Add tags (press Enter)" />

          <For each={session.tags}>{(t) => <TagComponent name={t.name} onClick={() => deleteTag(t)} />}</For>
          <Button onClick={() => saveSession({})}>Save</Button>
        </Show>
      </Container>
    </>
  );
};

export default LogSession;
