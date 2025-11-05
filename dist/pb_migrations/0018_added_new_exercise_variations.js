/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    let exerciseVariations = app.findCollectionByNameOrId("exerciseVariations");

    let variations = [
      { e: "a5wjd65ifgrjt9o", n: "Freestyle", d: "" },
      { e: "a5wjd65ifgrjt9o", n: "Backstroke", d: "" },
      { e: "a5wjd65ifgrjt9o", n: "Breaststroke", d: "" },
      { e: "a5wjd65ifgrjt9o", n: "Butterfly", d: "" },
    ];

    for (const v of variations) {
      let record = new Record(exerciseVariations);

      record.set("exercise", v.e);
      record.set("description", v.d);
      record.set("name", v.n);
      app.save(record);
    }
  },
  (app) => {
    // no down migration
  }
);
