/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    let exerciseVariations = app.findCollectionByNameOrId("exerciseVariations");

    variations = [
      { id: "g5zbeg25i7vx1ee", n: "Open hand", d: "" },
      { id: "femr1kq8bsud5il", n: "Half crimp", d: "" },
      { id: "olh8p1v1li69xwd", n: "Full crimp", d: "" },
      { id: "xlofh42c7nss995", n: "Wide grip", d: "" },
      { id: "ul74mgnwah1s0r1", n: "Standard grip", d: "Shoulder width grip" },
      { id: "acbog8cxg2umwhn", n: "Close grip", d: "" },
    ];

    for (const v of variations) {
      let record = new Record(exerciseVariations);

      record.set("id", v.id);
      record.set("description", v.d);
      record.set("name", v.n);
      app.save(record);
    }
  },
  (app) => {
    // No down migration yet
  }
);
