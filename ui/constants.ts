export const SESSION_EXPAND =
  "tags, " +
  "sessionExercises_via_session.exercise.defaultMeasurementType.measurementValues_via_measurementType, " +
  "sessionExercises_via_session.exercise.defaultMeasurementType2.measurementValues_via_measurementType, " +
  "sessionExercises_via_session.exercise.defaultMeasurementType3.measurementValues_via_measurementType, " +
  "sessionExercises_via_session.measurementValue, " +
  "sessionExercises_via_session.measurement2Value, " +
  "sessionExercises_via_session.measurement3Value, " +
  "sessionExercises_via_session.tags, " +
  "sessionMeals_via_session.tags";

export const ROUTINE_EXPAND =
  "routineExercises_via_routine.exercise.defaultMeasurementType.measurementValues_via_measurementType, " +
  "routineExercises_via_routine.exercise.defaultMeasurementType2.measurementValues_via_measurementType, " +
  "routineExercises_via_routine.exercise.defaultMeasurementType3.measurementValues_via_measurementType, " +
  "routineExercises_via_routine.measurementValue, " +
  "routineExercises_via_routine.measurement2Value, " +
  "routineExercises_via_routine.measurement3Value, " +
  "routineExercises_via_routine.tags";

export const SESSION_EXERCISE_EXPAND =
  "exercise.defaultMeasurementType.measurementValues_via_measurementType, " +
  "exercise.defaultMeasurementType2.measurementValues_via_measurementType, " +
  "exercise.defaultMeasurementType3.measurementValues_via_measurementType, " +
  "measurementValue, tags";

export const EXERCISE_EXPAND =
  "defaultMeasurementType.measurementValues_via_measurementType, " +
  "defaultMeasurementType2.measurementValues_via_measurementType, " +
  "defaultMeasurementType2.measurementValues_via_measurementType, " +
  "equipmentPrimary, equipmentSecondary, exercisePreferences_via_exercise";

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

export const IGNORE_ERRORS = [
  "ResizeObserver loop completed with undelivered notifications.",
  "ResizeObserver loop limit exceeded",
];

export const moodOptions: RatingOption<Rating>[] = [
  { emoji: "😢", label: "Very Bad", value: 1 },
  { emoji: "☹️", label: "Bad", value: 2 },
  { emoji: "😐", label: "Neutral", value: 3 },
  { emoji: "🙂", label: "Good", value: 4 },
  { emoji: "😄", label: "Great", value: 5 },
];

export const stressOptions: RatingOption<Rating>[] = [
  { emoji: "😌", label: "Very Low", value: 1 },
  { emoji: "🙂", label: "Low", value: 2 },
  { emoji: "😐", label: "Medium", value: 3 },
  { emoji: "😣", label: "High", value: 4 },
  { emoji: "😫", label: "Very High", value: 5 },
];

export const anxietyOptions: RatingOption<Rating>[] = [
  { emoji: "😌", label: "Very Low", value: 1 },
  { emoji: "🙂", label: "Low", value: 2 },
  { emoji: "😕", label: "Medium", value: 3 },
  { emoji: "😟", label: "High", value: 4 },
  { emoji: "😰", label: "Very High", value: 5 },
];

export const sleepOptions: RatingOption<string>[] = [
  { emoji: "😞", label: "Very Poor", value: "terrible" },
  { emoji: "😕", label: "Poor", value: "poor" },
  { emoji: "😐", label: "Fair", value: "fair" },
  { emoji: "😊", label: "Good", value: "good" },
  { emoji: "😴", label: "Excellent", value: "great" },
];
