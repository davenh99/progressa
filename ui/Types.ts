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
  };
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
  meals: string[];
  sleepQuality: "poor" | "fair" | "good" | "great";
  sessionExercises: string[];
}

export interface UserSession extends UserSessionCreateData {
  id: string;
  expand?: {
    tags?: Tag[];
    sessionExercises?: UserSessionExercise[];
    meals?: Meal[];
  };
}

export interface UserSessionExerciseCreateData {
  user: string;
  exercise: string;
  notes: string;
  tags: string[];
  addedWeight: number;
  // qty: number;
  restAfter: number;
  isWarmup: boolean;
  sequence: number;
  perceivedEffort: number; // 0 - 100
  measurementNumeric?: number;
  measurementValue?: string;
  // sessionExercise?: string;
  supersetParent?: string;
}

export interface UserSessionExercise extends UserSessionExerciseCreateData {
  id: string;
  expand?: {
    exercise?: Exercise;
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
  name: string;
  kj: number;
  gramsProtein: number;
  gramsCarbohydrate: number;
  gramsFat: number;
}
