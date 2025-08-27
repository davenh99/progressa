import { SessionExerciseRow } from "../views/data";

export const getSupersetInds = (index: number, data: SessionExerciseRow[]) => {
  const inds = [index];
  const sessionExerciseId = data[index].sessionExercise.id;

  for (const [i, d] of data.entries()) {
    if (d.sessionExercise.supersetParent && d.sessionExercise.supersetParent === sessionExerciseId) {
      inds.push(i);
    }
  }

  return inds;
};

export const getGroupInds = (index: number, data: SessionExerciseRow[]) => {
  const inds = [];
  const exerciseId = data[index].sessionExercise.exercise;

  for (const [i, d] of data.slice(index).entries()) {
    if (d.sessionExercise.exercise === exerciseId) {
      inds.push(i + index);
    } else {
      break;
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
    supersetParent: row.sessionExercise.id,
  };
  return data;
};
