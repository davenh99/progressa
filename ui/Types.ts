export interface User {
  id: string;
  name: string;
  email: string;
  dob: string;
  height: string;
  weight: string;
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
  expand: {
    measurementType: MeasurementType;
  };
}

export interface SessionExercise {
  id: string;
  session: string;
  exercise: string;
  setCount: number;
  supersetParent: string | null;
}

export interface UserSession {
  id: string;
  name: string;
  user: string;
  userDay: string;
  notes: string;
  tags: string[];
  userHeight: number;
  userWeight: number;
}

export interface UserSessionExercise {
  id: string;
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
  expand: {
    exercise?: Exercise;
  };
}

export interface tag {
  id: string;
  name: string;
  createdBy: string;
  public: boolean;
}
