/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    let exercises = app.findCollectionByNameOrId("exercises");

    const newExercises = [
      {
        id: "70vlzfveuudrmax",
        s: true,
        n: "20mm Edge lift",
        mType: "8ldlggjjvy2ircl",
        p: true,
        b: false,
        d: "A one-hand lift on a 20mm edge, an excellent choice for building finger strength. Select from grip type.",
      },
      {
        id: "a5wjd65uffrjt8f",
        s: true,
        n: "Pullup",
        mType: "m01s8yx7wfk2gxd",
        p: true,
        b: true,
        d: "Select from grip type.",
      },
      {
        id: "a5wjd65ifgrjt8f",
        s: true,
        n: "Boulder (hueco)",
        mType: "8ldlgghjvy4ircl",
        p: true,
        b: true,
        d: "Select grade",
      },
    ];

    for (const e of newExercises) {
      let record = new Record(exercises);

      record.set("id", e.id);
      record.set("system", e.s);
      record.set("name", e.n);
      record.set("measurementType", e.mType);
      record.set("public", e.p);
      record.set("bodyweight", e.b);
      record.set("description", e.d);

      app.save(record);
    }
  },
  (app) => {
    // No down migration yet
  }
);
