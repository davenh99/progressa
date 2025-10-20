export type SleepQuality = "terrible" | "poor" | "fair" | "good" | "great";
export type DraggingState = "idle" | "dragging" | "dragging-over";

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
    exerciseVariations_via_exercise?: ExerciseVariation[];
  };
}

export interface ExerciseVariation {
  id: string;
  exercise: string;
  name: string;
  description: string;
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
  sleepQuality?: SleepQuality;
}

export interface Session extends SessionCreateData {
  id: string;
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
  variation?: string;
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
  expand?: {
    exercise?: Exercise;
    variation?: ExerciseVariation;
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
  variation?: string;
}

export type RoutineExercise = RoutineExerciseCreateData & RoutineOrSessionExercise;
