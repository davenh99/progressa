import { SessionExercise } from "../../Types";

export const getSupersetInds = (index: number, data: (SessionExercise | RoutineExercisesRecordExpand)[]) => {
  const inds = [index];
  const sessionExerciseId = data[index].id;

  for (const [i, d] of data.entries()) {
    if (d.supersetParent && d.supersetParent === sessionExerciseId) {
      inds.push(i);
    }
  }

  return inds;
};

export const getGroups = (exercises: (SessionExercise | RoutineExercisesRecordExpand)[]) => {
  type Res = { [id: string]: { exerciseNames: string[] } };
  const resMap: Res = {};

  // loop and populate resMap
  for (const routineOrSessionExercise of exercises) {
    const id = routineOrSessionExercise.supersetParent || routineOrSessionExercise.id;
    const name = routineOrSessionExercise.expand?.exercise?.name || "";

    if (!resMap[id]) {
      resMap[id] = { exerciseNames: [name] };
    } else if (!resMap[id].exerciseNames.includes(name)) {
      resMap[id].exerciseNames.push(name);
    }
  }

  // map inds to group titles
  const groups = exercises.map((routineOrSessionExercise) =>
    resMap[routineOrSessionExercise.supersetParent || routineOrSessionExercise.id].exerciseNames.join(" ✕ ")
  );

  return groups;
};

export const getGroupInds = (index: number, groups: string[]) => {
  const inds = [];
  const group = groups[index];

  for (const [i, d] of groups.slice(index).entries()) {
    if (d === group) {
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
    perceivedEffort,
    addedWeight,
    restAfter,
    isWarmup,
    measurementNumeric,
    measurementValue,
    supersetParent: sessionExercise.supersetParent || sessionExercise.id,
  };
};

export const sortSessionOrRoutineExercises = <T extends SessionExercise | RoutineExercisesRecordExpand>(
  sessionExercises: T[],
  order: string[]
): T[] => {
  const itemsMap = new Map(sessionExercises.map((item) => [item.id, item]));

  const orderedItems = order.map((id) => itemsMap.get(id)).filter((item) => item !== undefined);
  const unorderedItems = sessionExercises.filter((item) => !order.includes(item.id));

  return [...orderedItems, ...unorderedItems];
};
