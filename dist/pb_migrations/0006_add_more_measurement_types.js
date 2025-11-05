/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    let measurementTypes = app.findCollectionByNameOrId("measurementTypes");

    const newMeasurementTypes = [
      { id: "distancem000000", dn: "distance (m)", n: "distance (m)", num: true },
      { id: "distancekm00000", dn: "distance (km)", n: "distance (km)", num: true },
      { id: "egdesizemm00000", dn: "edge (mm)", n: "edge size (mm)", num: true },
    ];

    for (const m of newMeasurementTypes) {
      let record = new Record(measurementTypes);
      record.set("id", m.id);
      record.set("system", true);
      record.set("name", m.n);
      record.set("displayName", m.dn);
      record.set("numeric", m.num);
      record.set("public", true);

      app.save(record);
    }
  },
  (app) => {
    const createdIDs = ["distancem000000", "distancekm00000", "egdesizemm00000"];
    for (const id of createdIDs) {
      try {
        let record = app.findRecordById("measurementTypes", id);
        app.delete(record);
      } catch {}
    }
  }
);
