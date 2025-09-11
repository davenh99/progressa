import { Component } from "solid-js";

import { UserSessionList } from "../views/data";
import Container from "../views/Container";
import { Button } from "../components";
import SectionHeader from "../views/SectionHeader";

const Sessions: Component = () => {
  return (
    <>
      <SectionHeader>
        <div class="flex justify-between items-start">
          <h1 class="text-xl font-bold">Your Workout Sessions</h1>
          <Button href="/log" class="whitespace-nowrap ml-4">
            Log workout
          </Button>
        </div>
      </SectionHeader>
      <Container>
        <UserSessionList />
      </Container>
    </>
  );
};

export default Sessions;
