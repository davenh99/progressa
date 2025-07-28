/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    let exerciseVariations = app.findCollectionByNameOrId("exerciseVariations");

    variations = [
      { e: "70vlzfveuudrmax", n: "Open hand", d: "" },
      { e: "70vlzfveuudrmax", n: "Half crimp", d: "" },
      { e: "70vlzfveuudrmax", n: "Full crimp", d: "" },
      { e: "70vlzfveuudrmax", n: "Wide grip", d: "" },
      { e: "a5wjd65uffrjt8f", n: "Standard grip", d: "Shoulder width grip" },
      { e: "a5wjd65uffrjt8f", n: "Close grip", d: "" },
    ];

    for (const v of variations) {
      let record = new Record(exerciseVariations);

      record.set("id", v.id);
      record.set("exercise", v.e);
      record.set("description", v.d);
      record.set("name", v.n);
      app.save(record);
    }
  },
  (app) => {
    // No down migration yet
  }
);
