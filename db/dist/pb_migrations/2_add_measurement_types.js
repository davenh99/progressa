/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    let measurementTypes = app.findCollectionByNameOrId("measurementTypes");

    let record = new Record(measurementTypes);

    record.set("id", "m01s8yx7wfk2gxd");
    record.set("system", true);
    record.set("name", "Reps");
    record.set("numeric", true);
    record.set("public", true);

    app.save(record);

    record = new Record(measurementTypes);

    record.set("id", "8ldlggjjvy2ircl");
    record.set("system", true);
    record.set("name", "Time (s)");
    record.set("numeric", true);
    record.set("public", true);

    app.save(record);
  },
  (app) => {
    const createdIDs = ["m01s8yx7wfk2gxd", "8ldlggjjvy2ircl"];
    for (const id of createdIDs) {
      try {
        let record = app.findRecordById("measurementTypes", id);
        app.delete(record);
      } catch {}
    }
  }
);
