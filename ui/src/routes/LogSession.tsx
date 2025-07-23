import { Component, createSignal, For, onMount, Show } from "solid-js";
import { useParams } from "@solidjs/router";
import { createStore } from "solid-js/store";

import { useAuthPB } from "../config/pocketbase";
import { UserSession } from "../../Types";
import Loading from "../views/Loading";
import { UserSessionExerciseList } from "../views/data";

const LogSession: Component = () => {
  const [sessions, setSessions] = createSignal<UserSession[]>([]);
  const params = useParams();
  const { pb, user, getUserSessions } = useAuthPB();
  const [showModal, setShowModal] = createSignal(false);
  const [newSession, setNewSession] = createStore({
    name: "",
    userDay: new Date().toLocaleDateString("en-CA"),
    notes: "",
    tags: [] as string[],
  });
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal("");

  const handleTagInput = (
    e: KeyboardEvent & { currentTarget: HTMLInputElement; target: HTMLInputElement }
  ) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      e.preventDefault();
      const newTag = e.target.value.trim();
      if (!newSession.tags.includes(newTag)) {
        setNewSession("tags", [...newSession.tags, newTag]);
        e.target.value = "";
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewSession(
      "tags",
      newSession.tags.filter((tag) => tag !== tagToRemove)
    );
  };

  const createSession = async () => {
    setIsLoading(true);
    setError("");

    try {
      const data = {
        ...newSession,
        user: user.id,
        userHeight: user.height,
        userWeight: user.weight,
      };

      delete data["tags"];

      await pb.collection("userSessions").create(data);
      const s = await getUserSessions();
      setSessions(s);
      setShowModal(false);
      setNewSession({
        name: "",
        userDay: new Date().toISOString().split("T")[0],
        notes: "",
      });
    } catch (err) {
      console.error("Failed to create session:", err);
      setError("Failed to create session. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  onMount(async () => {
    try {
      const data = await getUserSessions();
      setSessions(data);
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    }
  });

  return (
    <Show when={!!sessions()} fallback={<Loading />}>
      <Show when={showModal()}>
        <div class="fixed inset-0 bg--scheme-success bg-opacity-10 flex items-center justify-center z-50">
          <div class="bg-base-100 rounded-lg p-6 w-full max-w-md">
            <h3 class="text-xl font-bold mb-4">Create New Session</h3>

            <div class="space-y-4">
              <div>
                <label class="label">
                  <span class="label-text">Session Name</span>
                </label>
                <input
                  type="text"
                  value={newSession.name}
                  onInput={(e) => setNewSession("name", e.target.value)}
                  class="input input-bordered w-full"
                  placeholder="Morning Workout"
                />
              </div>

              <div>
                <label class="label">
                  <span class="label-text">Date</span>
                </label>
                <input
                  type="date"
                  value={newSession.userDay}
                  onInput={(e) => setNewSession("userDay", e.target.value)}
                  class="input input-bordered w-full"
                />
              </div>

              <div>
                <label class="label">
                  <span class="label-text">Notes</span>
                </label>
                <textarea
                  value={newSession.notes}
                  onInput={(e) => setNewSession("notes", e.target.value)}
                  class="textarea textarea-bordered w-full"
                  rows={3}
                  placeholder="Any notes about this session..."
                />
              </div>

              <div>
                <label class="label">
                  <span class="label-text">Tags</span>
                </label>
                <input
                  type="text"
                  onKeyDown={handleTagInput}
                  class="input input-bordered w-full"
                  placeholder="Add tags (press Enter)"
                />
                <div class="flex flex-wrap gap-2 mt-2">
                  <For each={newSession.tags}>
                    {(tag) => (
                      <span class="badge badge-primary">
                        {tag}
                        <button onClick={() => removeTag(tag)} class="ml-1">
                          ×
                        </button>
                      </span>
                    )}
                  </For>
                </div>
              </div>

              <Show when={error()}>
                <div class="text-error">{error()}</div>
              </Show>

              <div class="flex justify-end gap-2 pt-4">
                <button onClick={() => setShowModal(false)} class="btn" disabled={isLoading()}>
                  Cancel
                </button>
                <button
                  onClick={createSession}
                  class="btn btn-primary"
                  disabled={isLoading() || !newSession.name.trim()}
                >
                  {isLoading() ? "Creating..." : "Create Session"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Show>

      <UserSessionExerciseList sessionID={params.id} />
    </Show>
  );
};

export default LogSession;
