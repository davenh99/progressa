import { Component } from "solid-js";

import { UserSessionList } from "../views/data";

const Sessions: Component = () => {
  return (
    <>
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-xl font-bold">Your Workout Sessions</h3>
        <a href="/workouts/log" class="btn btn-primary">
          Log workout
        </a>
      </div>
      <UserSessionList />
    </>
  );
};

export default Sessions;
