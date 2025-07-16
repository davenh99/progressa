export interface User {
  username: string;
  email: string;
}

export interface MeasurementType {
  system: boolean;
  name: string;
}

export interface MeasurementValue {
  measurementType: string;
  name: string;
}

export interface Session {
  name: string;
  description: string;
  usersSaved: string[];
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
  dropSetParent: string; // TODO rename
}

export interface UserSession {
  name: string;
  user: string;
  userDay: string;
  notes: string;
  tags: string[];
}

export interface UserSessionExercise {
  user: string;
  exercise: string;
  notes: string;
  tags: string[];
  addedWeight: number;
  qty: number;
  measurementValue: string;
  restAfter: number;
  sessionExercise?: string;
  dropSetParent?: string; // TODO rename
}

export interface tag {
  name: string;
  user: string;
}
