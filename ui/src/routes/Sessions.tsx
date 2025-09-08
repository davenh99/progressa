import { Component } from "solid-js";
import { A } from "@solidjs/router";

import { UserSessionList } from "../views/data";
import Container from "../views/Container";

const Sessions: Component = () => {
  return (
    <Container>
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-xl font-bold">Your Workout Sessions</h3>
        <A href="/log" class="btn btn-primary">
          Log workout
        </A>
      </div>
      <UserSessionList />
    </Container>
  );
};

export default Sessions;
