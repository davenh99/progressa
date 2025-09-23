import { UserSessionExercise } from "../../Types";

export const getSupersetInds = (index: number, data: UserSessionExercise[]) => {
  const inds = [index];
  const sessionExerciseId = data[index].id;

  for (const [i, d] of data.entries()) {
    if (d.supersetParent && d.supersetParent === sessionExerciseId) {
      inds.push(i);
    }
  }

  return inds;
};

export const getGroupInds = (index: number, data: UserSessionExercise[]) => {
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

// helper for getting the userSessionExercise in a way that we can send to backend to create new
export const getDropsetAddData = (sessionExercise: UserSessionExercise) => {
  const {
    user,
    exercise,
    userSession,
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
    userSession,
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

export const sortUserSessionExercises = (userSessionExercises: UserSessionExercise[], order: string[]) => {
  const itemsMap = new Map(userSessionExercises.map((item) => [item.id, item]));

  const orderedItems = order.map((id) => itemsMap.get(id)).filter((item) => item !== undefined);
  const unorderedItems = userSessionExercises.filter((item) => !order.includes(item.id));

  return [...orderedItems, ...unorderedItems];
};
