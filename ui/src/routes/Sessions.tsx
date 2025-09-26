import { Component } from "solid-js";

import { SessionList } from "../views/session/SessionList";
import Container from "../views/app/Container";
import { Button } from "../components";
import SectionHeader from "../views/app/SectionHeader";

const Sessions: Component = () => {
  return (
    <>
      <SectionHeader>
        <div class="flex justify-between items-start">
          <h1 class="text-xl font-bold">Your Workout Sessions</h1>
          <Button href="/log" class="whitespace-nowrap ml-4 text-black">
            Log workout
          </Button>
        </div>
      </SectionHeader>
      <Container noPadding>
        <SessionList />
      </Container>
    </>
  );
};

export default Sessions;
