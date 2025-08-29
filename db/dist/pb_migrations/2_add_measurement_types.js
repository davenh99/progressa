/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    let measurementTypes = app.findCollectionByNameOrId("measurementTypes");

    const newMeasurementTypes = [
      { id: "m01s8yx7wfk2gxd", s: true, dn: "reps", n: "Reps", num: true, p: true },
      { id: "8ldlggjjvy2ircl", s: true, dn: "s", n: "Time (seconds)", num: true, p: true },
      { id: "8ldlgtjjvy3ircl", s: true, dn: "min", n: "Time (minutes)", num: true, p: true },
      { id: "8ldlgghjvy4ircl", s: true, dn: "", n: "Boulder grade (hueco)", num: false, p: true },
      { id: "8ldlgghjvy5yrcl", s: true, dn: "", n: "Boulder grade (font)", num: false, p: true },
      { id: "8ldlgghjvt7yrcl", s: true, dn: "", n: "Route grade (ewbanks)", num: false, p: true },
      { id: "8ldlyyhjvt7yrbl", s: true, dn: "", n: "Route grade (french)", num: false, p: true },
    ];

    for (const m of newMeasurementTypes) {
      let record = new Record(measurementTypes);

      record.set("id", m.id);
      record.set("system", m.s);
      record.set("name", m.n);
      record.set("displayName", m.dn);
      record.set("numeric", m.num);
      record.set("public", m.p);

      app.save(record);
    }
  },
  (app) => {
    const createdIDs = [
      "m01s8yx7wfk2gxd",
      "8ldlggjjvy2ircl",
      "8ldlgghjvy4ircl",
      "8ldlgghjvy5yrcl",
      "8ldlgghjvt7yrcl",
      "8ldlyyhjvt7yrbl",
    ];
    for (const id of createdIDs) {
      try {
        let record = app.findRecordById("measurementTypes", id);
        app.delete(record);
      } catch {}
    }
  }
);
