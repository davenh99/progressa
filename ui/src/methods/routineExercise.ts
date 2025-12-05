// helper for getting the RoutineExercise in a way that we can send to backend to create new
export const getDropsetAddData = (routineExercise: RoutineExercisesRecordExpand) => {
  const { exercise, routine, addedWeight, restAfter, isWarmup, measurementNumeric, measurementValue } =
    routineExercise;

  return {
    exercise,
    routine,
    addedWeight,
    restAfter,
    isWarmup,
    measurementNumeric,
    measurementValue,
    supersetParent: routineExercise.supersetParent || routineExercise.id,
  };
};
