import { Component, createSignal, For, onMount, Show } from "solid-js";

import { useAuthPB } from "../config/pocketbase";
import { getAge } from "../methods/getAge";
import UserSessionListView from "../components/UserSessionListView";
import { createStore } from "solid-js/store";
import { UserSession } from "../../Types";

const Home: Component = () => {
  const { pb, user, logout, getUserSessions } = useAuthPB();
  const [sessions, setSessions] = createSignal<UserSession[]>([]);
  const [showModal, setShowModal] = createSignal(false);
  const [newSession, setNewSession] = createStore({
    name: "",
    userDay: new Date().toLocaleDateString("en-CA"),
    notes: "",
    tags: [] as string[],
  });
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal("");

  const handleInputChange = (field: keyof typeof newSession, value: any) => {
    setNewSession((prev) => ({ ...prev, [field]: value }));
  };

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

  // Create new session
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
    <div class="container mx-auto p-4">
      <div class="bg-base-100 rounded-lg shadow p-6 mb-6">
        <h2 class="text-2xl font-bold mb-4">Home</h2>
        <div>
          <h4 class="text-xl font-semibold">Logged in as {user.name}</h4>
          <h5 class="text-lg font-medium mt-4">Stats</h5>
          <div class="grid grid-cols-2 gap-2 mt-2">
            <p>Email: {user.email}</p>
            <p>Height: {user.height}</p>
            <p>Weight: {user.weight}</p>
            <p>Age: {user.dob ? getAge(user.dob) : "N/A"}</p>
          </div>
          <button onClick={logout} class="btn btn-error mt-4">
            Logout
          </button>
        </div>
      </div>

      <div class="flex justify-between items-center mb-4">
        <h3 class="text-xl font-bold">Your Workout Sessions</h3>
        <button onClick={() => setShowModal(true)} class="btn btn-primary">
          New Session
        </button>
      </div>

      <Show when={showModal()}>
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
                  onInput={(e) => handleInputChange("name", e.target.value)}
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
                  onInput={(e) => handleInputChange("userDay", e.target.value)}
                  class="input input-bordered w-full"
                />
              </div>

              <div>
                <label class="label">
                  <span class="label-text">Notes</span>
                </label>
                <textarea
                  value={newSession.notes}
                  onInput={(e) => handleInputChange("notes", e.target.value)}
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

      <UserSessionListView sessions={sessions} />
    </div>
  );
};

export default Home;
