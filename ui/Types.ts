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

export interface Session {
  id: string;
  name: string;
  createdBy: string;
  description: string;
  usersSaved: string[];
  public: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  bodyweight: boolean;
  measurementType: string;
  public: boolean;
  usersSaved: string[];
  createdBy: string;
  expand?: {
    measurementType?: MeasurementType;
    exerciseVariations_via_exercise?: ExerciseVariation[];
  };
}

export interface ExerciseVariation {
  id: string;
  exercise: string;
  name: string;
  description: string;
}

export interface SessionExercise {
  id: string;
  session: string;
  exercise: string;
  setCount: number;
  supersetParent: string | null;
}

export interface UserSessionCreateData {
  name: string;
  user: string;
  userDay: string;
  notes: string;
  tags: string[];
  userHeight: number;
  userWeight: number;
  sleepQuality: "poor" | "fair" | "good" | "great";
}

export interface UserSession extends UserSessionCreateData {
  id: string;
  expand?: {
    tags?: Tag[];
    userSessionExercises_via_userSession?: UserSessionExercise[];
    meals_via_userSession?: Meal[];
  };
}

export interface UserSessionExerciseCreateData {
  user: string;
  exercise: string;
  userSession: string;
  variation: string;
  sequence: number;
  perceivedEffort: number; // 0 - 100
}

export interface UserSessionExercise extends UserSessionExerciseCreateData {
  id: string;
  notes: string;
  tags: string[];
  addedWeight: number;
  restAfter: number;
  isWarmup: boolean;
  measurementNumeric?: number;
  measurementValue?: string;
  supersetParent?: string;
  expand?: {
    exercise?: Exercise;
    variation?: ExerciseVariation;
  };
}

export interface Tag {
  id: string;
  name: string;
  createdBy: string;
  public: boolean;
}

export interface Meal {
  id: string;
  userSession: string;
  name: string;
  kj: number;
  gramsProtein: number;
  gramsCarbohydrate: number;
  gramsFat: number;
}
