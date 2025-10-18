/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    let exerciseVariations = app.findCollectionByNameOrId("exerciseVariations");

    const variations = [
      // 7/3 repeaters
      {
        e: "73repeater00000",
        n: "Full crimp",
        d: "Be careful with this one. Thumb fully wrapped over fingers",
      },
      {
        e: "73repeater00000",
        n: "Half crimp",
        d: "Fingers engaged at slightly more than 90 degrees, no thumb wrap",
      },
      { e: "73repeater00000", n: "Chisel grip", d: "Half way between half crimp and open hand" },
      { e: "73repeater00000", n: "Open hand", d: "Also known as 3-finger drag" },
    ];

    for (const v of variations) {
      let record = new Record(exerciseVariations);

      // record.set("id", v.id);
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
