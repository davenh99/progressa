export const USER_SESSION_EXPAND =
  "tags, userSessionExercises_via_userSession.exercise.defaultMeasurementType.measurementValues_via_measurementType, userSessionExercises_via_userSession.measurementValue, userSessionExercises_via_userSession.variation, userSessionExercises_via_userSession.tags, meals_via_userSession.tags";
export const USER_SESSION_EXERCISE_EXPAND =
  "exercise.defaultMeasurementType.measurementValues_via_measurementType, measurementValue, variation, tags";
export const USER_SESSION_MEAL_EXPAND = "tags";

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
