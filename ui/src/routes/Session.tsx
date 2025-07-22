import { Component, createSignal, onMount, Show } from "solid-js";
import { useParams } from "@solidjs/router";

import { useAuthPB } from "../config/pocketbase";
import { UserSession } from "../../Types";
import Loading from "../views/Loading";
import SessionExercises from "../views/SessionExercises";

const Session: Component = () => {
  const [session, setSession] = createSignal<UserSession>(null);
  const params = useParams();
  const { pb } = useAuthPB();

  const getSession = async () => {
    const session = await pb.collection<UserSession>("userSessions").getOne(params.id);
    setSession(session);
  };

  onMount(() => {
    getSession();
  });

  return (
    <Show when={!!session()} fallback={<Loading />}>
      <p>{session().name}</p>
      <p>{session().notes}</p>
      <p>{session().userDay}</p>

      <SessionExercises sessionID={params.id} />
    </Show>
  );
};

export default Session;
