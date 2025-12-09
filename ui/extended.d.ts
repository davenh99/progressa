interface MeasurementTypeExpand extends MeasurementTypesRecord {
  expand?: {
    measurementValues_via_measurementType: MeasurementValuesRecord[];
  };
}

interface ExercisesRecordExpand extends ExercisesRecord {
  expand?: {
    defaultMeasurementType?: MeasurementTypeExpand;
    defaultMeasurementType2?: MeasurementTypeExpand;
    defaultMeasurementType3?: MeasurementTypeExpand;
    exercisePreferences_via_exercise?: ExercisePreferencesRecord[];
  };
}

interface SessionsRecordExpand extends SessionsRecord {
  expand?: {
    tags?: TagsRecord[];
    sessionExercises_via_session?: SessionExercisesRecordExpand[];
    sessionMeals_via_session?: SessionMealsRecordExpand[];
  };
}

interface SessionOrRoutineExerciseExpand {
  expand?: {
    exercise?: ExercisesRecordExpand;
    measurementValue?: MeasurementValuesRecord;
    measurement2Value?: MeasurementValuesRecord;
    measurement3Value?: MeasurementValuesRecord;
  };
}

type SessionExercisesRecordExpand = SessionExercisesRecord & {
  expand?: SessionOrRoutineExerciseExpand["expand"] & {
    tags?: TagsRecord[];
  };
};

type RoutineExercisesRecordExpand = RoutineExercisesRecord & SessionOrRoutineExerciseExpand;

interface RoutinesRecordExpand extends RoutinesRecord {
  expand?: {
    tags?: TagsRecord[];
    routineExercises_via_routine?: RoutineExercisesRecordExpand[];
  };
}

interface SessionMealsRecordExpand extends SessionMealsRecord {
  expand?: {
    tags?: TagsRecord[];
  };
}
