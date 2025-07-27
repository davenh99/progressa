import { Component, createSignal, For, onMount, Show } from "solid-js";
import { createStore } from "solid-js/store";
import { useNavigate, useParams } from "@solidjs/router";
import { TextField } from "@kobalte/core/text-field";
import { ClientResponseError } from "pocketbase";
import Check from "lucide-solid/icons/check";

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
import { Checkbox } from "@kobalte/core/checkbox";

interface SaveSessionProps {
  nextSessionExerciseID?: string;
  nextTagID?: string;
}

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
  restAfter: 0,
  isWarmup: false,
  perceivedEffort: 50,
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
  const navigate = useNavigate();
  const params = useParams();

  const getSession = async () => {
    try {
      let session: UserSession;

      if (params.id) {
        session = await pb.collection<UserSession>("userSessions").getOne(params.id, {
          expand: "tags, sessionExercises, sessionExercises.exercise",
        });
      } else {
        session = await pb
          .collection<UserSession>("userSessions")
          .getFirstListItem(`userDay = '${newSession.userDay}'`, {
            expand: "tags, sessionExercises, sessionExercises.exercise",
          });
      }

      setNewSession("name", session.name);
      setNewSession("userDay", session.userDay);
      setNewSession("notes", session.notes);
      setNewSession("tags", session.expand?.tags ?? []);
      setNewSession("sessionExercises", session.expand?.sessionExercises ?? []);
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

          await saveSession({ nextTagID: foundTag.id });

          setNewSession("tags", [...newSession.tags, foundTag]);
        } catch (e) {
          if (e instanceof ClientResponseError && e.status == 404) {
            const createdTag = await pb
              .collection<Tag>("tags")
              .create({ name: newTag, public: false, createdBy: user.id });

            await saveSession({ nextTagID: createdTag.id });

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

  // TODO we could make this only send the relevant data
  const saveSession = async ({ nextSessionExerciseID, nextTagID }: SaveSessionProps) => {
    let updateData = {
      name: newSession.name,
      notes: newSession.notes,
      sessionExercises: newSession.sessionExercises.map((e) => e.id),
      tags: newSession.tags.map((t) => t.id),
    };

    if (nextSessionExerciseID) {
      updateData.sessionExercises = [...updateData.sessionExercises, nextSessionExerciseID];
    }

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
          userDay: newSession.userDay,
          userHeight: user.height,
          userWeight: user.weight,
          meals: [],
          sleepQuality: "fair",
        };

        const session = await pb.collection<UserSession>("userSessions").create(createData);
        navigate(`/workouts/log/${session.id}`, { replace: true });
      }
    } catch (e) {
      console.log(e);
    }
  };

  const addSessionExercise = async () => {
    const data: UserSessionExerciseCreateData = {
      user: user.id,
      notes: newSessionExercise.notes,
      addedWeight: newSessionExercise.addedWeight,
      exercise: newSessionExercise.exercise.id,
      isWarmup: newSessionExercise.isWarmup,
      perceivedEffort: newSessionExercise.perceivedEffort,
      restAfter: newSessionExercise.restAfter,
      tags: [],
      sequence: Math.max(...newSession.sessionExercises.map((e) => e.sequence)) + 1,
    };

    try {
      // TODO validate data and display error before getting here
      const sessionExercise = await pb
        .collection<UserSessionExercise>("userSessionExercises")
        .create(data, { expand: "exercise" });

      if (sessionExercise) {
        await saveSession({ nextSessionExerciseID: sessionExercise.id });

        setNewSession("sessionExercises", [...newSession.sessionExercises, sessionExercise]);
      } else {
        alert("error savign data, perhaps incomplete :)");
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
              navigate("/workouts/log");
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
              <p>Selected exercise: {newSessionExercise.exercise?.name ?? "None"}</p>

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

              <TextField>
                <TextField.Label>Added weight</TextField.Label>
                <TextField.Input
                  type="number"
                  value={newSessionExercise.addedWeight}
                  onInput={(
                    e: InputEvent & {
                      target: HTMLInputElement;
                    }
                  ) => setNewSessionExercise("addedWeight", Number(e.target.value))}
                />
              </TextField>

              <Checkbox
                checked={newSessionExercise.isWarmup}
                onChange={(v: boolean) => setNewSessionExercise("isWarmup", v)}
              >
                <Checkbox.Input />
                <Checkbox.Control class="h-5 w-5 bg-ash-gray-500 rounded-sm">
                  <Checkbox.Indicator>
                    <Check />
                  </Checkbox.Indicator>
                </Checkbox.Control>
                <Checkbox.Label>Is it a warmup?</Checkbox.Label>
              </Checkbox>

              <TextField>
                <TextField.Label>Rest afterwards</TextField.Label>
                <TextField.Input
                  type="number"
                  value={newSessionExercise.restAfter}
                  onInput={(
                    e: InputEvent & {
                      target: HTMLInputElement;
                    }
                  ) => setNewSessionExercise("restAfter", Number(e.target.value))}
                />
              </TextField>
              <Show
                when={
                  newSessionExercise.exercise && newSessionExercise.exercise.expand?.measurementType?.numeric
                }
              >
                <TextField>
                  <TextField.Label>Amount (reps, mins, whatever)</TextField.Label>
                  <TextField.Input
                    type="number"
                    value={newSessionExercise.measurement}
                    onInput={(
                      e: InputEvent & {
                        target: HTMLInputElement;
                      }
                    ) => setNewSessionExercise("measurement", Number(e.target.value))}
                  />
                </TextField>
              </Show>
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
          <button onclick={() => saveSession({})}>Save</button>
        </Show>
      </Container>
    </>
  );
};

export default LogSession;
