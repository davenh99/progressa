import { Component, createSignal, For, Show } from "solid-js";
import { createStore } from "solid-js/store";
import { TextField } from "@kobalte/core/text-field";
import { ClientResponseError } from "pocketbase";

import { useAuthPB } from "../config/pocketbase";
import Header from "../components/Header";
import Container from "../components/Container";
import {
  Exercise,
  Tag,
  UserSession,
  UserSessionCreateData,
  UserSessionExercise,
  UserSessionExerciseCreateData,
} from "../../Types";
import { ExerciseList } from "../views/data";
import { useParams } from "@solidjs/router";

const BaseNewSession = {
  name: "",
  userDay: new Date().toLocaleDateString("en-CA"),
  notes: "",
  tags: [] as Tag[],
  sessionExercises: [] as UserSessionExercise[],
};

const BaseNewExercise = {
  exercise: null as Exercise,
  notes: "",
  tags: [] as Tag[],
  addedWeight: 0,
  qty: 0,
  restAfter: 0,
  isWarmup: false,
  measurement: null as string | number,
  supersetParent: null as string,
};

const LogSession: Component = () => {
  const [dateSelected, setDateSelected] = createSignal(false);
  const [newSessionExercise, setNewSessionExercise] = createStore(BaseNewExercise);
  const [showCreateSessionExercise, setShowCreateSessionExercise] = createSignal(false);
  const [showAddExercise, setShowAddExercise] = createSignal(false);
  const [loading, setLoading] = createSignal(true);
  const [newSession, setNewSession] = createStore(BaseNewSession);
  const { pb, user } = useAuthPB();
  const params = useParams();

  const getSession = async () => {
    try {
      const session = await pb
        .collection<UserSession>("userSessions")
        .getFirstListItem(`userDay = '${newSession.userDay}'`, {
          expand: "tags, sessionExercises, sessionExercises.exercise",
        });

      setNewSession("name", session.name);
      setNewSession("notes", session.notes);
      session.expand?.tags && setNewSession("tags", session.expand.tags);
      session.expand?.sessionExercises && setNewSession("sessionExercises", session.expand.sessionExercises);
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

      if (!newSession.tags.map((t) => t.name).includes(newTag)) {
        try {
          const foundTag = await pb
            .collection<Tag>("tags")
            .getFirstListItem(`createdBy = '${user.id}' && name = '${newTag}'`);

          setNewSession("tags", [...newSession.tags, foundTag]);
        } catch (e) {
          if (e instanceof ClientResponseError && e.status == 404) {
            const createdTag = await pb
              .collection<Tag>("tags")
              .create({ name: newTag, public: false, createdBy: user.id });

            setNewSession("tags", [...newSession.tags, createdTag]);
          } else {
            console.log(e);
          }
        } finally {
          e.target.value = "";
        }
      }
    }
  };

  const addSessionExercise = async () => {
    const data: UserSessionExerciseCreateData = {
      user: user.id,
      notes: newSession.notes,
      addedWeight: newSessionExercise.addedWeight,
      exercise: newSessionExercise.exercise.id,
      isWarmup: newSessionExercise.isWarmup,
      qty: newSessionExercise.qty,
      restAfter: newSessionExercise.restAfter,
      tags: [],
    };

    try {
      const sessionExercise = await pb.collection<UserSessionExercise>("userSessionExercises").create(data);
      setNewSession("sessionExercises", [...newSession.sessionExercises, sessionExercise]);
    } catch (e) {
      console.log(e);
    }
  };

  const saveSession = async () => {
    let updateData = {
      userDay: newSession.userDay,
      name: newSession.name,
      notes: newSession.notes,
      sessionExercises: newSession.sessionExercises.map((e) => e.id),
      tags: newSession.tags.map((t) => t.id),
    };
    try {
      if (params.id) {
        const session = await pb.collection<UserSession>("userSessions").update(params.id, updateData);
      } else {
        const createData: UserSessionCreateData = {
          ...updateData,
          user: user.id,
          userHeight: user.height,
          userWeight: user.weight,
        };
        const session = await pb.collection<UserSession>("userSessions").create(createData);
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <>
      <Header />
      <Container>
        <Show
          when={dateSelected()}
          fallback={
            <>
              <p>Select Date</p>
              <label class="label">
                <span class="label-text">Date</span>
              </label>
              <input
                type="date"
                value={newSession.userDay}
                onInput={(e) => {
                  setNewSession("userDay", e.target.value);
                  getSession();
                }}
                class="input input-bordered w-full"
              />
              <Show when={!loading() && newSession.name}>
                <p>Found session: {newSession.name}</p>
              </Show>
              <button onclick={() => setDateSelected(true)}>Continue</button>
            </>
          }
        >
          <p>{newSession.userDay}</p>
          <button
            onclick={() => {
              setDateSelected(false);
              setLoading(true);
              setNewSession(BaseNewSession);
            }}
          >
            <p>back to select date</p>
          </button>
          <TextField>
            <TextField.Label>Session Name</TextField.Label>
            <TextField.Input
              type="text"
              value={newSession.name}
              onInput={(
                e: InputEvent & {
                  target: HTMLInputElement;
                }
              ) => setNewSession("name", e.target.value)}
            />
          </TextField>
          <TextField>
            <TextField.Label>Notes</TextField.Label>
            <TextField.TextArea
              type="text"
              value={newSession.notes}
              onInput={(
                e: InputEvent & {
                  target: HTMLInputElement;
                }
              ) => setNewSession("notes", e.target.value)}
            />
          </TextField>
          <p>Exercises</p>
          <button onclick={() => setShowCreateSessionExercise(true)}>Add Set</button>
          <Show when={showCreateSessionExercise()}>
            <button onclick={() => setShowAddExercise(true)}>Select Exercise</button>
            <Show when={showAddExercise()}>
              <ExerciseList
                onclick={(exercise: Exercise) => {
                  setShowAddExercise(false);
                  setNewSessionExercise("exercise", exercise);
                }}
              />
            </Show>
            <div class="flex flex-row">
              <TextField>
                <TextField.Label>Notes</TextField.Label>
                <TextField.TextArea
                  type="text"
                  value={newSessionExercise.notes}
                  onInput={(
                    e: InputEvent & {
                      target: HTMLInputElement;
                    }
                  ) => setNewSessionExercise("notes", e.target.value)}
                />
              </TextField>
            </div>
            <button
              onclick={() => {
                setShowCreateSessionExercise(false);
                addSessionExercise();
              }}
            >
              Confirm add
            </button>
          </Show>
          <For each={newSession.sessionExercises}>
            {(e) => (
              <div class="flex flex-row">
                <p>Exercise: {e.expand.exercise?.name}</p>
                <p>Warmup?: {e.isWarmup ? "yes" : "no"}</p>
                <p>Added Weight: {e.addedWeight}</p>
                <p>Notes: {e.notes}</p>
              </div>
            )}
          </For>

          <TextField>
            <TextField.Label>Tags</TextField.Label>
            <TextField.Input type="text" onKeyDown={handleTagInput} placeholder="Add tags (press Enter)" />
          </TextField>
          <For each={newSession.tags}>
            {(t) => (
              <span class="badge">
                {t.name}
                <button
                  onClick={() =>
                    setNewSession(
                      "tags",
                      newSession.tags.filter((tag) => tag.name !== t.name)
                    )
                  }
                  class="ml-1"
                >
                  ×
                </button>
              </span>
            )}
          </For>
        </Show>
        <button onclick={() => saveSession()}>Save</button>
      </Container>
    </>
  );
};

export default LogSession;
