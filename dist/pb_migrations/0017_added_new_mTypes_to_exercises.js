/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    let records = [];
    // running
    let record = app.findRecordById("exercises", "a5wjd65ifgrjt9k");
    record.set("defaultMeasurementType2", "distancekm00000");
    record.set("allowedMeasurementTypes2", ["distancekm00000"]);
    records.push(record);

    // sprint
    record = app.findRecordById("exercises", "a5wjd65ifgrjt9l");
    record.set("defaultMeasurementType2", "distancem000000");
    record.set("allowedMeasurementTypes2", ["distancem000000"]);
    records.push(record);

    // swimming
    record = app.findRecordById("exercises", "a5wjd65ifgrjt9o");
    record.set("defaultMeasurementType2", "distancem000000");
    record.set("allowedMeasurementTypes2", ["distancem000000"]);
    records.push(record);

    // cycling
    record = app.findRecordById("exercises", "b5wjd65ifgrjt9o");
    record.set("defaultMeasurementType2", "distancekm00000");
    record.set("allowedMeasurementTypes2", ["distancekm00000"]);
    records.push(record);

    for (const r of records) {
      app.save(r);
    }
  },
  (app) => {
    // no down migration
  }
);
