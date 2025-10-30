/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    let exercises = app.findCollectionByNameOrId("exercises");

    const newExercises = [
      {
        id: "73repeater00000",
        n: "7/3 repeaters",
        mType: "egdesizemm00000",
        mType2: "m01s8yx7wfk2gxd",
        b: true,
        d: "Stength endurance protocol. 7 seconds hang, 3 seconds off",
      },
      {
        id: "walking00000000",
        n: "Walking",
        mType: "distancekm00000",
        mType2: "8ldlgtjjvy3ircl",
        b: true,
        d: "Walking, hiking, whatever",
      },
      {
        id: "badminton000000",
        n: "Badminton",
        mType: "8ldlgtjjvy3ircl",
        b: true,
        d: "Playing badminton",
      },
    ];

    for (const e of newExercises) {
      let record = new Record(exercises);

      record.set("id", e.id);
      record.set("system", true);
      record.set("name", e.n);
      record.set("defaultMeasurementType", e.mType);
      record.set("defaultMeasurementType2", e.mType2);
      record.set("public", true);
      record.set("bodyweight", e.b);
      record.set("description", e.d);

      app.save(record);
    }
  },
  (app) => {
    // No down migration yet
  }
);
