/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    let variations = [
      // running
      { e: "a5wjd65ifgrjt9k", n: "1 km run" },
      { e: "a5wjd65ifgrjt9k", n: "2 km run" },
      { e: "a5wjd65ifgrjt9k", n: "5 km run" },
      { e: "a5wjd65ifgrjt9k", n: "10 km run" },
      { e: "a5wjd65ifgrjt9k", n: "Half marathon" },
      { e: "a5wjd65ifgrjt9k", n: "Marathon" },
      // sprint
      { e: "a5wjd65ifgrjt9l", n: "100 m sprint" },
      { e: "a5wjd65ifgrjt9l", n: "200 m sprint" },
      { e: "a5wjd65ifgrjt9l", n: "400 m sprint" },
      { e: "a5wjd65ifgrjt9l", n: "800 m sprint" },
      // swimming
      { e: "a5wjd65ifgrjt9o", n: "Freestyle 50m" },
      { e: "a5wjd65ifgrjt9o", n: "Freestyle 100m" },
      { e: "a5wjd65ifgrjt9o", n: "Freestyle 200m" },
      { e: "a5wjd65ifgrjt9o", n: "Freestyle 400m" },
      { e: "a5wjd65ifgrjt9o", n: "Backstroke 50m" },
      { e: "a5wjd65ifgrjt9o", n: "Backstroke 100m" },
      { e: "a5wjd65ifgrjt9o", n: "Backstroke 200m" },
      { e: "a5wjd65ifgrjt9o", n: "Backstroke 400m" },
      { e: "a5wjd65ifgrjt9o", n: "Breaststroke 50m" },
      { e: "a5wjd65ifgrjt9o", n: "Breaststroke 100m" },
      { e: "a5wjd65ifgrjt9o", n: "Breaststroke 200m" },
      { e: "a5wjd65ifgrjt9o", n: "Breaststroke 400m" },
      { e: "a5wjd65ifgrjt9o", n: "Butterfly 50m" },
      { e: "a5wjd65ifgrjt9o", n: "Butterfly 100m" },
      { e: "a5wjd65ifgrjt9o", n: "Butterfly 200m" },
      { e: "a5wjd65ifgrjt9o", n: "Butterfly 400m" },
      // cycling
      { e: "b5wjd65ifgrjt9o", n: "1 km" },
      { e: "b5wjd65ifgrjt9o", n: "5 km" },
      { e: "b5wjd65ifgrjt9o", n: "10 km" },
      { e: "b5wjd65ifgrjt9o", n: "20 km" },
      { e: "b5wjd65ifgrjt9o", n: "50 km" },
      { e: "b5wjd65ifgrjt9o", n: "100 km" },
    ];

    for (const v of variations) {
      app.delete(app.findFirstRecordByFilter("exerciseVariations", `name = '${v.n}' && exercise = '${v.e}'`));
    }
  },
  (app) => {
    // no down migration
  }
);
