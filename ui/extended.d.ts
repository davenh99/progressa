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

interface RoutineExercisesRecordExpand extends RoutineExercisesRecord {
  expand?: {
    exercise?: ExercisesRecordExpand;
    measurementValue?: MeasurementValuesRecord;
    measurement2Value?: MeasurementValuesRecord;
    measurement3Value?: MeasurementValuesRecord;
    tags?: TagsRecord[];
  };
}

interface RoutinesRecordExpand extends RoutinesRecord {
  expand?: {
    tags?: TagsRecord[];
    routineExercises_via_routine?: RoutineExercisesRecordExpand[];
  };
}
