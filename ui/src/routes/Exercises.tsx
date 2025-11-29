import { Component } from "solid-js";

import Container from "../views/app/Container";
import Header from "../views/app/Header";
import { ExerciseList } from "../views/exercises/ExerciseList";

const Exercises: Component = () => {
  return (
    <>
      <Header>
        <div class="flex justify-between items-start">
          <h1 class="text-xl font-bold">Exercises</h1>
        </div>
      </Header>
      <Container class="pt-0 pb-25 overflow-y-auto">
        <ExerciseList onClick={() => {}} />
      </Container>
    </>
  );
};

export default Exercises;
