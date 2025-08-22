import { SessionExerciseRow } from "../views/data";

// helper for getting existing dropsets when duplicating
export const getIDsToDuplicate = (index: number, data: SessionExerciseRow[]) => {
  const inds = [index];
  const sessionExerciseId = data[index].sessionExercise.id;

  for (const [i, d] of data.entries()) {
    if (d._parentID && d._parentID === sessionExerciseId) {
      inds.push(i);
    }
  }

  return inds;
};

// helper for getting the userSessionExercise in a way that we can send to backend to create new
export const getDropsetAddData = (row: SessionExerciseRow) => {
  const data = {
    user: row.sessionExercise.user,
    exercise: row.sessionExercise.exercise,
    userSession: row.sessionExercise.userSession,
    variation: row.sessionExercise.variation,
    perceivedEffort: row.sessionExercise.perceivedEffort,
    notes: row.sessionExercise.notes,
    tags: row.sessionExercise.tags,
    addedWeight: row.sessionExercise.addedWeight,
    restAfter: row.sessionExercise.restAfter,
    isWarmup: row.sessionExercise.isWarmup,
    measurementNumeric: row.sessionExercise.measurementNumeric,
    measurementValue: row.sessionExercise.measurementValue,
  };
  return data;
};
