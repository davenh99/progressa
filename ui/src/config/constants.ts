export const SESSION_EXPAND =
  "tags, " +
  "sessionExercises_via_session.exercise.defaultMeasurementType.measurementValues_via_measurementType, " +
  "sessionExercises_via_session.exercise.defaultMeasurementType2.measurementValues_via_measurementType, " +
  "sessionExercises_via_session.exercise.defaultMeasurementType3.measurementValues_via_measurementType, " +
  "sessionExercises_via_session.measurementValue, " +
  "sessionExercises_via_session.measurement2Value, " +
  "sessionExercises_via_session.measurement3Value, " +
  "sessionExercises_via_session.variation, " +
  "sessionExercises_via_session.tags, " +
  "sessionMeals_via_session.tags";

export const ROUTINE_EXPAND =
  "tags, " +
  "routineExercises_via_routine.exercise.defaultMeasurementType.measurementValues_via_measurementType, " +
  "routineExercises_via_routine.exercise.defaultMeasurementType2.measurementValues_via_measurementType, " +
  "routineExercises_via_routine.exercise.defaultMeasurementType3.measurementValues_via_measurementType, " +
  "routineExercises_via_routine.measurementValue, " +
  "routineExercises_via_routine.measurement2Value, " +
  "routineExercises_via_routine.measurement3Value, " +
  "routineExercises_via_routine.variation, " +
  "routineExercises_via_routine.tags";

export const SESSION_EXERCISE_EXPAND =
  "exercise.defaultMeasurementType.measurementValues_via_measurementType, measurementValue, variation, tags";

export const SESSION_MEAL_EXPAND = "tags";

export const DROP_ABOVE_CLASS = `
  relative 
  before:absolute 
  before:inset-x-1
  before:top-0
  before:h-1 
  before:rounded-full 
  before:bg-blue-500
  before:content-['']
`;

export const DROP_BELOW_CLASS = `
  relative 
  after:absolute 
  after:inset-x-1
  after:bottom-0 
  after:h-1 
  after:rounded-full 
  after:bg-blue-500 
  after:content-['']
`;
