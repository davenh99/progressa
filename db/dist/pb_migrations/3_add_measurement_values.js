/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    let measurementValues = app.findCollectionByNameOrId("measurementValues");

    const newMeasurementValues = [
      { t: "8ldlgghjvy4ircl", v: "V0", p: true },
      { t: "8ldlgghjvy4ircl", v: "V1", p: true },
      { t: "8ldlgghjvy4ircl", v: "V2", p: true },
      { t: "8ldlgghjvy4ircl", v: "V3", p: true },
      { t: "8ldlgghjvy4ircl", v: "V4", p: true },
      { t: "8ldlgghjvy4ircl", v: "V5", p: true },
      { t: "8ldlgghjvy4ircl", v: "V6", p: true },
      { t: "8ldlgghjvy4ircl", v: "V7", p: true },
      { t: "8ldlgghjvy4ircl", v: "V8", p: true },
      { t: "8ldlgghjvy4ircl", v: "V9", p: true },
      { t: "8ldlgghjvy4ircl", v: "V10", p: true },
      { t: "8ldlgghjvy4ircl", v: "V11", p: true },
      { t: "8ldlgghjvy4ircl", v: "V12", p: true },
      { t: "8ldlgghjvy4ircl", v: "V13", p: true },
      { t: "8ldlgghjvy4ircl", v: "V14", p: true },
      { t: "8ldlgghjvy4ircl", v: "V15", p: true },
      { t: "8ldlgghjvy4ircl", v: "V16", p: true },
      { t: "8ldlgghjvy4ircl", v: "V17", p: true },
    ];

    for (const m of newMeasurementValues) {
      let record = new Record(measurementValues);

      record.set("measurementType", m.id);
      record.set("value", m.v);
      record.set("public", m.p);

      app.save(record);
    }
  },
  (app) => {
    // no down migration yet
  }
);
