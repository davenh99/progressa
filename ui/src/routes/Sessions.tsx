import { Component } from "solid-js";

import { UserSessionList } from "../views/data";
import Container from "../views/Container";
import { Button } from "../components";
import SectionHeader from "../views/SectionHeader";

const Sessions: Component = () => {
  return (
    <Container>
      <SectionHeader>
        <div class="flex justify-between items-center">
          <h1 class="text-xl font-bold">Your Workout Sessions</h1>
          <Button href="/log">Log workout</Button>
        </div>
      </SectionHeader>
      <UserSessionList />
    </Container>
  );
};

export default Sessions;
