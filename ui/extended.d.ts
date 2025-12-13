interface MeasurementTypesExpand extends MeasurementTypesRecord {
  expand?: {
    measurementValues_via_measurementType: MeasurementValuesRecord[];
  };
}

interface ExercisesRecordExpand extends ExercisesRecord {
  expand?: {
    defaultMeasurementType?: MeasurementTypesExpand;
    defaultMeasurementType2?: MeasurementTypesExpand;
    defaultMeasurementType3?: MeasurementTypesExpand;
    exercisePreferences_via_exercise?: ExercisePreferencesRecord[];
    equipmentPrimary?: EquipmentsRecord;
    equipmentSecondary?: EquipmentsRecord;
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

interface ExercisePreferencesExpand extends ExercisePreferences {
  expand?: {
    tags?: TagsRecord[];
  };
}
