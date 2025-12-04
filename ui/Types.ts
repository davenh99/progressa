export type SleepQuality = "terrible" | "poor" | "fair" | "good" | "great" | "";
export type DraggingState = "idle" | "dragging" | "dragging-over";
export type Rating = 0 | 1 | 2 | 3 | 4 | 5;

export interface RatingOption<T extends string | number> {
  emoji: string;
  label: string;
  value: T;
}

export const MuscleGroups = [
  "Trapezius",
  "Abductors",
  "Glutes",
  "Adductors",
  "Chest",
  "Forearms",
  "Shins",
  "Hip Flexors",
  "Triceps",
  "Calves",
  "Biceps",
  "Quadriceps",
  "Hamstrings",
  "Shoulders",
  "Abdominals",
  "Back",
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

export interface User {
  id: string;
  name: string;
  email: string;
  dob: string;
  height: number;
  weight: number;
}

export interface MeasurementType {
  id: string;
  system: boolean;
  name: string;
  displayName: string;
  public: boolean;
  createdBy: string;
  numeric: boolean;
  expand?: {
    measurementValues_via_measurementType: MeasurementValue[];
  };
}

export interface MeasurementValue {
  id: string;
  measurementType: string;
  value: string;
  public: boolean;
  createdBy: string;
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  bodyweight: boolean;
  defaultMeasurementType: string;
  defaultMeasurementType2: string;
  defaultMeasurementType3: string;
  allowedMeasurementTypes: string[];
  allowedMeasurementTypes2: string[];
  allowedMeasurementTypes3: string[];
  public: boolean;
  usersSaved: string[];
  createdBy: string;
  expand?: {
    defaultMeasurementType?: MeasurementType;
    defaultMeasurementType2?: MeasurementType;
    defaultMeasurementType3?: MeasurementType;
  };
}

export interface SessionCreateData {
  name: string;
  user: string;
  userDay: string;
  notes: string;
  tags: string[];
  userHeight: number;
  userWeight: number;
  exercisesOrder: string[] | null;
  mealsOrder: string[] | null;
}

export interface Session extends SessionCreateData {
  id: string;
  sleepQuality: SleepQuality;
  stressRating: Rating;
  anxietyRating: Rating;
  moodRating: Rating;
  expand?: {
    tags?: Tag[];
    sessionExercises_via_session?: SessionExercise[];
    sessionMeals_via_session?: SessionMeal[];
  };
}

export interface SessionExerciseCreateData {
  user: string;
  exercise: string;
  session: string;
  perceivedEffort: number; // 0 - 100
}

interface RoutineOrSessionExercise {
  id: string;
  notes: string;
  tags: string[];
  addedWeight: number;
  restAfter: number;
  isWarmup: boolean;
  measurementNumeric?: number;
  measurement2Numeric?: number;
  measurement3Numeric?: number;
  measurementValue?: string;
  measurement2Value?: string;
  measurement3Value?: string;
  supersetParent?: string;
  strengthRating: number; // 0-100
  enduranceRating: number; // 0-100
  expand?: {
    exercise?: Exercise;
    measurementValue?: MeasurementValue;
    measurement2Value?: MeasurementValue;
    measurement3Value?: MeasurementValue;
    tags?: Tag[];
  };
}

export type SessionExercise = SessionExerciseCreateData & RoutineOrSessionExercise;

export interface Tag {
  id: string;
  name: string;
  createdBy: string;
  colorHex: string;
  public: boolean;
}

export interface SessionMealCreateData {
  session: string;
  name: string;
  description: string;
  tags: string[];
  kj: number;
  gramsProtein: number;
  gramsCarbohydrate: number;
  gramsFat: number;
}

export interface SessionMeal extends SessionMealCreateData {
  id: string;
  saved: boolean;
  expand: {
    tags: Tag[];
  };
}

export interface RoutineCreateData {
  name: string;
  user: string;
  description: string;
  exercisesOrder: string[] | null;
}

export interface Routine extends RoutineCreateData {
  id: string;
  expand?: {
    tags?: Tag[];
    routineExercises_via_routine?: RoutineExercise[];
  };
}

export interface RoutineExerciseCreateData {
  exercise: string;
  routine: string;
}

export type RoutineExercise = RoutineExerciseCreateData & RoutineOrSessionExercise;
