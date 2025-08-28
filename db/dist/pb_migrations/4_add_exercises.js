/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    let exercises = app.findCollectionByNameOrId("exercises");

    const newExercises = [
      {
        id: "70vlzfveuudrmax",
        n: "20mm Edge lift",
        mType: "8ldlggjjvy2ircl",
        b: false,
        d: "A one-hand lift on a 20mm edge, an excellent choice for building finger strength. Select from grip type.",
      },
      {
        id: "a5wjd65uffrjt8f",
        n: "Pullup",
        mType: "m01s8yx7wfk2gxd",
        b: true,
        d: "Select from grip type.",
      },
      {
        id: "a5wjd65ifgrjt8f",
        n: "Boulder",
        mType: "8ldlgghjvy4ircl",
        b: true,
        d: "Select grade",
      },
    ];

    for (const e of newExercises) {
      let record = new Record(exercises);

      record.set("id", e.id);
      record.set("system", true);
      record.set("name", e.n);
      record.set("measurementType", e.mType);
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
