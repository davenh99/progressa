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
        mTypes: ["8ldlgghjvy4ircl", "8ldlgghjvy5yrcl"],
        b: true,
        d: "Select grade",
      },
      {
        id: "a5wjd65ifgrjt9f",
        n: "Chin-up",
        mType: "m01s8yx7wfk2gxd",
        b: true,
        d: "Select from grip type.",
      },
      {
        id: "a5wjd65ifgrjt9g",
        n: "Push-up",
        mType: "m01s8yx7wfk2gxd",
        b: true,
        d: "Select from stance.",
      },
      {
        id: "a5wjd65ifgrjt9h",
        n: "Squat",
        mType: "m01s8yx7wfk2gxd",
        b: true,
        d: "Select type",
      },
      {
        id: "a5wjd65ifgrjt9i",
        n: "Bar dip",
        mType: "m01s8yx7wfk2gxd",
        b: true,
        d: "Good push exercise",
      },
      {
        id: "a5wjd65ifgrjt9j",
        n: "Ring dip",
        mType: "m01s8yx7wfk2gxd",
        b: true,
        d: "Good push exercise",
      },
      {
        id: "a5wjd65ifgrjt9k",
        n: "Running",
        mType: "8ldlgtjjvy3ircl",
        b: false,
        d: "Cardio exercise",
      },
      {
        id: "a5wjd65ifgrjt9l",
        n: "Sprint",
        mType: "8ldlggjjvy2ircl",
        b: false,
        d: "High intensity exercise",
      },
      {
        id: "a5wjd65ifgrjt9m",
        n: "Barbell bench press",
        mType: "m01s8yx7wfk2gxd",
        b: false,
        d: "Good push exercise",
      },
      {
        id: "a5wjd65ifgrjt9n",
        n: "Dumbbell bench press",
        mType: "m01s8yx7wfk2gxd",
        b: false,
        d: "Good push exercise",
      },
      {
        id: "a5wjd65ifgrjt9o",
        n: "Swimming",
        mType: "8ldlgtjjvy3ircl",
        b: false,
        d: "Good cardio",
      },
      {
        id: "a5wjd65ifgrjt9p",
        n: "Face pull",
        mType: "m01s8yx7wfk2gxd",
        b: false,
        d: "Athleanx sent you?",
      },
      {
        id: "a5wjd65ifgrjt9q",
        n: "Barbell curl",
        mType: "m01s8yx7wfk2gxd",
        b: false,
        d: "For biceps",
      },
      {
        id: "a5wjd65ifgrjt9r",
        n: "Deadlift",
        mType: "m01s8yx7wfk2gxd",
        b: false,
        d: "Be careful",
      },
      {
        id: "a5wjd65ifgrjt9s",
        n: "Hammer curl",
        mType: "m01s8yx7wfk2gxd",
        b: false,
        d: "For biceps",
      },
      {
        id: "a5wjd65ifgrjt9t",
        n: "Bench dip",
        mType: "m01s8yx7wfk2gxd",
        b: true,
        d: "For triceps",
      },
      {
        id: "a5wjd65ifgrjt9u",
        n: "Skull crusher",
        mType: "m01s8yx7wfk2gxd",
        b: false,
        d: "For triceps",
      },
      {
        id: "a5wjd65ifgrjt9v",
        n: "Australian pull-up",
        mType: "m01s8yx7wfk2gxd",
        b: true,
        d: "Wacky back and bicep exercise",
      },
      {
        id: "a5wjd65ifgrjt9w",
        n: "Box jump",
        mType: "m01s8yx7wfk2gxd",
        b: true,
        d: "Sounds tiring",
      },
      {
        id: "a5wjd65ifgrjt9x",
        n: "Skipping",
        mType: "8ldlgtjjvy3ircl",
        b: true,
        d: "Also sounds tiring",
      },
      {
        id: "a5wjd65ifgrjt9y",
        n: "Leg press",
        mType: "m01s8yx7wfk2gxd",
        b: false,
        d: "Get big legs",
      },
      {
        id: "a5wjd65ifgrjt9z",
        n: "Muscle up",
        mType: "m01s8yx7wfk2gxd",
        b: true,
        d: "Do this if you are a show-off",
      },
      {
        id: "b5wjd65ifgrjt9a",
        n: "Sport climb",
        mType: "8ldlyyhjvt7yrbl",
        mTypes: ["8ldlyyhjvt7yrbl", "8ldlgghjvt7yrcl"],
        b: true,
        d: "Very fun, highly recommend",
      },
      {
        id: "b5wjd65ifgrjt9b",
        n: "Top-rope climb",
        mType: "8ldlyyhjvt7yrbl",
        mTypes: ["8ldlyyhjvt7yrbl", "8ldlgghjvt7yrcl"],
        b: true,
        d: "Pretty fun, highly recommend",
      },
      {
        id: "b5wjd65ifgrjt9c",
        n: "Hip thrust",
        mType: "m01s8yx7wfk2gxd",
        b: true,
        d: "Improve thrusting performance 👀",
      },
      {
        id: "b5wjd65ifgrjt9d",
        n: "Step up",
        mType: "m01s8yx7wfk2gxd",
        b: true,
        d: "Training to climb stairs more easily",
      },
      {
        id: "b5wjd65ifgrjt9e",
        n: "Crunch",
        mType: "m01s8yx7wfk2gxd",
        b: false,
        d: "For six pack",
      },
      {
        id: "b5wjd65ifgrjt9f",
        n: "Sit-up",
        mType: "m01s8yx7wfk2gxd",
        b: true,
        d: "Ab workout",
      },
      {
        id: "b5wjd65ifgrjt9g",
        n: "Plank",
        mType: "8ldlgtjjvy3ircl",
        b: true,
        d: "How long can you hold?",
      },
      {
        id: "b5wjd65ifgrjt9h",
        n: "Side plank",
        mType: "8ldlggjjvy2ircl",
        b: true,
        d: "How long can you hold?",
      },
      {
        id: "b5wjd65ifgrjt9i",
        n: "Hanging sit-up",
        mType: "m01s8yx7wfk2gxd",
        b: true,
        d: "Brutal variation of sit-up",
      },
      {
        id: "b5wjd65ifgrjt9j",
        n: "Calf raise",
        mType: "m01s8yx7wfk2gxd",
        b: true,
        d: "For big calves",
      },
      {
        id: "b5wjd65ifgrjt9k",
        n: "Bar dead hang",
        mType: "8ldlgtjjvy3ircl",
        b: true,
        d: "How long can you hold?",
      },
      {
        id: "b5wjd65ifgsjt9k",
        n: "20mm edge dead hang",
        mType: "8ldlggjjvy2ircl",
        b: true,
        d: "How long can you hold?",
      },
      {
        id: "b5wjd55ifggjt9k",
        n: "Roling bar dead hang",
        mType: "8ldlgtjjvy3ircl",
        b: true,
        d: "How long can you hold?",
      },
      {
        id: "b5wjd65ifgrjt9l",
        n: "One arm bar dead hang",
        mType: "8ldlgtjjvy3ircl",
        b: true,
        d: "You must have strong arms",
      },
      {
        id: "b5wjd75ifgrjt9l",
        n: "One arm rolling bar dead hang",
        mType: "8ldlggjjvy2ircl",
        b: true,
        d: "You must have strong arms",
      },
      {
        id: "b5whd75ifgrjt9l",
        n: "One arm 20mm edge dead hang",
        mType: "8ldlggjjvy2ircl",
        b: true,
        d: "You must have strong arms",
      },
      {
        id: "b5wid75ifgrjt9l",
        n: "One arm 25mm edge dead hang",
        mType: "8ldlggjjvy2ircl",
        b: true,
        d: "You must have strong arms",
      },
      {
        id: "b5wid85ifgrjt9l",
        n: "One arm 30mm edge dead hang",
        mType: "8ldlggjjvy2ircl",
        b: true,
        d: "You must have strong arms",
      },
      {
        id: "b5wid95ifgrjt9l",
        n: "One arm 35mm edge dead hang",
        mType: "8ldlggjjvy2ircl",
        b: true,
        d: "You must have strong arms",
      },
      {
        id: "b5wid96ifgrjt9l",
        n: "One arm 40mm edge dead hang",
        mType: "8ldlggjjvy2ircl",
        b: true,
        d: "You must have strong arms",
      },
      {
        id: "b5wjd65ifgrjt9m",
        n: "Barbell wrist curl",
        mType: "m01s8yx7wfk2gxd",
        b: false,
        d: "For big wrists??",
      },
      {
        id: "b5wjd65ifgrjt9n",
        n: "Dumbbell wrist curl",
        mType: "m01s8yx7wfk2gxd",
        b: false,
        d: "For big wrists??",
      },
      {
        id: "b5wjd65ifgrjt9o",
        n: "Cycling",
        mType: "8ldlgtjjvy3ircl",
        b: false,
        d: "Ride your bike",
      },
      {
        id: "b5wjd65ifgrjt9p",
        n: "Lunge",
        mType: "m01s8yx7wfk2gxd",
        b: true,
        d: "Leg training",
      },
      {
        id: "b5wjd65ifgrjt9q",
        n: "Climbing",
        mType: "8ldlgtjjvy3ircl",
        b: true,
        d: "Open climbing, measure for a climbing session that you can rate intensity at a general level, not for individual climbs",
      },
    ];

    for (const e of newExercises) {
      let record = new Record(exercises);

      record.set("id", e.id);
      record.set("system", true);
      record.set("name", e.n);
      record.set("defaultMeasurementType", e.mType);
      record.set("allowedMeasurementTypes", e.mTypes);
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
