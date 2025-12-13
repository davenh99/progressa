/// <reference path="../pb_data/types.d.ts" />

migrate(
  (app) => {
    const exercises = app.findAllRecords("exercises");

    const sessionExercises = app.findAllRecords("sessionExercises");
    const routineExercises = app.findAllRecords("routineExercises");
    const routineAndSessionExercises = [...sessionExercises, ...routineExercises];

    for (const ex of exercises) {
      if (ex.get("defaultMeasurementType") === "8ldlgtjjvy3ircl") {
        ex.set("isTimeBased", true);

        for (const seEx of routineAndSessionExercises) {
          if (seEx.get("exercise") == ex.id) {
            seEx.set("exerciseDuration", seEx.get("measurementNumeric"));
          }
        }

        if (ex.get("defaultMeasurementType2") !== "") {
          ex.set("defaultMeasurementType", ex.get("defaultMeasurementType2"));

          for (const seEx of routineAndSessionExercises) {
            if (seEx.get("exercise") == ex.id) {
              seEx.set("measurementNumeric", seEx.get("measurement2Numeric"));
              seEx.set("measurementValue", seEx.get("measurement2Value"));
              seEx.set("measurement2Value", "");
              seEx.set("measurement2Numeric", 0);
            }
          }
          ex.set("defaultMeasurementType2", "");
        } else {
          ex.set("defaultMeasurementType", "");

          for (const seEx of routineAndSessionExercises) {
            if (seEx.get("exercise") == ex.id) {
              seEx.set("measurementNumeric", 0);
            }
          }
        }
      } else if (ex.get("defaultMeasurementType2") === "8ldlgtjjvy3ircl") {
        ex.set("isTimeBased", true);
        ex.set("defaultMeasurementType2", "");
      }

      for (const seOrRoEx of routineAndSessionExercises) {
        app.save(seOrRoEx);
      }

      app.save(ex);
    }

    const timeMeasurement = app.findRecordById("measurementTypes", "8ldlgtjjvy3ircl");
    // aint need that shii anymore
    app.delete(timeMeasurement);
  },
  (app) => {
    // No down migration, irreversible :)
  }
);
