import { Component } from "solid-js";
import Container from "../app/Container";

interface Props {
  exercise: ExercisesRecordExpand;
}

export const ExerciseForm: Component<Props> = (props) => {
  return (
    <Container>
      <h2>{props.exercise.name}</h2>
    </Container>
  );
};

export default ExerciseForm;
