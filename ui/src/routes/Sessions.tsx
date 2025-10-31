import { Component } from "solid-js";

import { SessionList } from "../views/session/SessionList";
import Container from "../views/app/Container";
import { Button } from "../components";
import Header from "../views/app/Header";

const Sessions: Component = () => {
  return (
    <>
      <Header>
        <div class="flex justify-between items-start">
          <h1 class="text-xl font-bold">Your Workout Sessions</h1>
          <Button href="/log" class="whitespace-nowrap ml-4">
            Log workout
          </Button>
        </div>
      </Header>
      <Container class="pb-25 overflow-y-auto p-0">
        <SessionList />
      </Container>
    </>
  );
};

export default Sessions;
