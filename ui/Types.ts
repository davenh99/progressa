export interface User {
  username: string;
  email: string;
  dob: string;
  height: string;
  weight: string;
}

export interface MeasurementType {
  system: boolean;
  name: string;
  public: boolean;
  createdBy: string;
  numeric: boolean;
}

export interface MeasurementValue {
  measurementType: string;
  value: string;
  public: boolean;
  createdBy: string;
}

export interface Session {
  name: string;
  description: string;
  usersSaved: string[];
  public: boolean;
}

export interface Exercise {
  name: string;
  description: string;
  bodyweight: boolean;
  measurementType: string;
  usersSaved: string[];
}

export interface SessionExercise {
  exercise: string;
  setCount: number;
  supersetParent: string | null;
}

export interface UserSession {
  name: string;
  user: string;
  userDay: string;
  notes: string;
  tags: string[];
  userHeight: number;
  userWeight: number;
}

export interface UserSessionExercise {
  user: string;
  exercise: string;
  userSession: string;
  notes: string;
  tags: string[];
  addedWeight: number;
  qty: number;
  restAfter: number;
  measurementNumeric: number | null;
  measurementValue: string | null;
  sessionExercise: string | null;
  supersetParent: string | null;
}

export interface tag {
  name: string;
  user: string;
  public: boolean;
}
