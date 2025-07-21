/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    let measurementTypes = app.findCollectionByNameOrId("measurementTypes");

    let record = new Record(measurementTypes);

    record.set("system", true);
    record.set("name", "Reps");
    record.set("numeric", true);
    record.set("public", true);

    app.save(record);

    record = new Record(measurementTypes);

    record.set("system", true);
    record.set("name", "Time (s)");
    record.set("numeric", true);
    record.set("public", true);

    app.save(record);
  },
  (app) => {
    // No down migration yet
  }
);
