/// <reference path="../pb_data/types.d.ts" />

migrate(
  (app) => {
    const variations = app.findAllRecords("exerciseVariations");
    const variationToNewExercise = {};
    const parents = [];

    // create new exercise for each variation
    for (const v of variations) {
      const parentId = v.get("exercise");
      const parent = app.findRecordById("exercises", parentId);
      parents.push(parent);

      let exercises = app.findCollectionByNameOrId("exercises");
      const newExercise = new Record(exercises);

      const fieldsToCopy = [
        "createdBy",
        "description",
        "bodyweight",
        "defaultMeasurementType",
        "allowedMeasurementTypes",
        "defaultMeasurementType2",
        "allowedMeasurementTypes2",
        "defaultMeasurementType3",
        "allowedMeasurementTypes3",
        "image",
        "video",
        "instructions",
        "difficulty",
        "targetMuscleGroup",
        "musclePrimary",
        "muscleSecondary",
        "muscleTertiary",
        "equipmentPrimary",
        "equipmentSecondary",
        "posture",
        "armCount",
        "armPattern",
        "grip",
        "endLoadPosition",
        "legPattern",
        "footElevation",
        "isCombination",
        "movementPattern",
        "movementPattern2",
        "movementPattern3",
        "motionPlane",
        "motionPlane2",
        "motionPlane3",
        "bodyRegion",
        "forceType",
        "mechanics",
        "laterality",
        "field",
        "isTimeBased",
        "system",
      ];

      // copy parent fields
      for (const field of fieldsToCopy) {
        newExercise.set(field, parent.get(field));
      }

      newExercise.set("name", `${parent.get("name")} (${v.get("name")})`);
      newExercise.set("description", `${parent.get("description")}, ${v.get("description")}`);
      newExercise.set("public", false);

      app.save(newExercise);
      variationToNewExercise[v.id] = newExercise.id;
    }

    // update references in sessionExercises
    const sesExercises = app.findAllRecords("sessionExercises");
    for (const r of sesExercises) {
      const variationId = r.get("variation");
      if (!variationId) continue;

      const newExerciseId = variationToNewExercise[variationId];
      if (!newExerciseId) throw new Error(`mapping incomplete for variation id: ${variationId}`);

      r.set("exercise", newExerciseId);
      r.set("variation", undefined);
      app.save(r);
    }

    // update references in routineExercises
    const routineExercises = app.findAllRecords("routineExercises");
    for (const r of routineExercises) {
      const variationId = r.get("variation");
      if (!variationId) continue;

      const newExerciseId = variationToNewExercise[variationId];
      if (!newExerciseId) throw new Error(`mapping incomplete for variation id: ${variationId}`);

      r.set("exercise", newExerciseId);
      r.set("variation", undefined);
      app.save(r);
    }

    for (const p of parents) {
      app.delete(p);
    }
  },
  (app) => {
    // No down migration
  }
);
