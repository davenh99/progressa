import { RoutineExercise } from "../../Types";

// helper for getting the RoutineExercise in a way that we can send to backend to create new
export const getDropsetAddData = (routineExercise: RoutineExercise) => {
  const {
    exercise,
    routine,
    variation,
    addedWeight,
    restAfter,
    isWarmup,
    measurementNumeric,
    measurementValue,
  } = routineExercise;

  return {
    exercise,
    routine,
    variation,
    addedWeight,
    restAfter,
    isWarmup,
    measurementNumeric,
    measurementValue,
    supersetParent: routineExercise.id,
  };
};
