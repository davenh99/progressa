/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    let variations = [
      // running
      { e: "a5wjd65ifgrjt9k", n: "1 km run", m: 1 },
      { e: "a5wjd65ifgrjt9k", n: "2 km run", m: 2 },
      { e: "a5wjd65ifgrjt9k", n: "5 km run", m: 5 },
      { e: "a5wjd65ifgrjt9k", n: "10 km run", m: 10 },
      { e: "a5wjd65ifgrjt9k", n: "Half marathon", m: 21 },
      { e: "a5wjd65ifgrjt9k", n: "Marathon", m: 42 },
      // sprint
      { e: "a5wjd65ifgrjt9l", n: "100 m sprint", m: 100 },
      { e: "a5wjd65ifgrjt9l", n: "200 m sprint", m: 200 },
      { e: "a5wjd65ifgrjt9l", n: "400 m sprint", m: 400 },
      { e: "a5wjd65ifgrjt9l", n: "800 m sprint", m: 800 },
      // swimming
      { e: "a5wjd65ifgrjt9o", n: "Freestyle 50m", now: "Freestyle", m: 50 },
      { e: "a5wjd65ifgrjt9o", n: "Freestyle 100m", now: "Freestyle", m: 100 },
      { e: "a5wjd65ifgrjt9o", n: "Freestyle 200m", now: "Freestyle", m: 200 },
      { e: "a5wjd65ifgrjt9o", n: "Freestyle 400m", now: "Freestyle", m: 400 },
      { e: "a5wjd65ifgrjt9o", n: "Backstroke 50m", now: "Backstroke", m: 50 },
      { e: "a5wjd65ifgrjt9o", n: "Backstroke 100m", now: "Backstroke", m: 100 },
      { e: "a5wjd65ifgrjt9o", n: "Backstroke 200m", now: "Backstroke", m: 200 },
      { e: "a5wjd65ifgrjt9o", n: "Backstroke 400m", now: "Backstroke", m: 400 },
      { e: "a5wjd65ifgrjt9o", n: "Breaststroke 50m", now: "Breaststroke", m: 50 },
      { e: "a5wjd65ifgrjt9o", n: "Breaststroke 100m", now: "Breaststroke", m: 100 },
      { e: "a5wjd65ifgrjt9o", n: "Breaststroke 200m", now: "Breaststroke", m: 200 },
      { e: "a5wjd65ifgrjt9o", n: "Breaststroke 400m", now: "Breaststroke", m: 400 },
      { e: "a5wjd65ifgrjt9o", n: "Butterfly 50m", now: "Butterfly", m: 50 },
      { e: "a5wjd65ifgrjt9o", n: "Butterfly 100m", now: "Butterfly", m: 100 },
      { e: "a5wjd65ifgrjt9o", n: "Butterfly 200m", now: "Butterfly", m: 200 },
      { e: "a5wjd65ifgrjt9o", n: "Butterfly 400m", now: "Butterfly", m: 400 },
      // cycling
      { e: "b5wjd65ifgrjt9o", n: "1 km", m: 1 },
      { e: "b5wjd65ifgrjt9o", n: "5 km", m: 2 },
      { e: "b5wjd65ifgrjt9o", n: "10 km", m: 10 },
      { e: "b5wjd65ifgrjt9o", n: "20 km", m: 20 },
      { e: "b5wjd65ifgrjt9o", n: "50 km", m: 50 },
      { e: "b5wjd65ifgrjt9o", n: "100 km", m: 100 },
    ];

    // Inefficient but easy loop, ok because not much data
    let records = app.findAllRecords("sessionExercises");

    // let vs = app.findAllRecords("exerciseVariations");
    // for (const v of vs) {
    //   console.log(v.get("name"), v.get("exercise"));
    // }

    for (const r of records) {
      app.expandRecord(r, ["variation"]);
      let curVariation = r.expandedOne("variation");
      if (!curVariation) {
        continue;
      }
      let found = false;
      let newVariation = undefined;
      let newVal = 0;

      for (const v of variations) {
        if (r.get("exercise") === v.e && curVariation.get("name") === v.n) {
          found = true;
          if (v.now) {
            newVariation = app.findFirstRecordByFilter(
              "exerciseVariations",
              `name = '${v.now}' && exercise = '${v.e}'`
            );
          }
          newVal = v.m;
          break;
        }
      }

      if (!found) continue;

      if (newVariation) r.set("variation", newVariation.id);
      r.set("measurement2Numeric", newVal);

      app.save(r);
    }
  },
  (app) => {
    // no down migration
  }
);
