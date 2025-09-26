import { SessionExercise } from "../../Types";

export const getSupersetInds = (index: number, data: SessionExercise[]) => {
  const inds = [index];
  const sessionExerciseId = data[index].id;

  for (const [i, d] of data.entries()) {
    if (d.supersetParent && d.supersetParent === sessionExerciseId) {
      inds.push(i);
    }
  }

  return inds;
};

export const getGroupInds = (index: number, data: SessionExercise[]) => {
  const inds = [];
  const exerciseId = data[index].exercise;

  for (const [i, d] of data.slice(index).entries()) {
    if (d.exercise === exerciseId) {
      inds.push(i + index);
    } else {
      break;
    }
  }

  return inds;
};

// helper for getting the SessionExercise in a way that we can send to backend to create new
export const getDropsetAddData = (sessionExercise: SessionExercise) => {
  const {
    user,
    exercise,
    session,
    variation,
    perceivedEffort,
    addedWeight,
    restAfter,
    isWarmup,
    measurementNumeric,
    measurementValue,
  } = sessionExercise;

  return {
    user,
    exercise,
    session,
    variation,
    perceivedEffort,
    addedWeight,
    restAfter,
    isWarmup,
    measurementNumeric,
    measurementValue,
    supersetParent: sessionExercise.id,
  };
};

export const sortSessionExercises = (sessionExercises: SessionExercise[], order: string[]) => {
  const itemsMap = new Map(sessionExercises.map((item) => [item.id, item]));

  const orderedItems = order.map((id) => itemsMap.get(id)).filter((item) => item !== undefined);
  const unorderedItems = sessionExercises.filter((item) => !order.includes(item.id));

  return [...orderedItems, ...unorderedItems];
};
