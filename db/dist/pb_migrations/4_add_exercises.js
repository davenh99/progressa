/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    let exercises = app.findCollectionByNameOrId("exercises");

    let record = new Record(exercises);

    record.set("id", "70vlzfveuudrmax");
    record.set("system", true);
    record.set("name", "20mm Edge lift");
    record.set("measurementType", "8ldlggjjvy2ircl");
    record.set("public", true);
    record.set("bodyweight", false);
    record.set(
      "description",
      "A one-hand lift on a 20mm edge, an excellent choice for building finger strength. Select from grip type."
    );
    record.set("variations", ["g5zbeg25i7vx1ee", "femr1kq8bsud5il", "olh8p1v1li69xwd"]);

    app.save(record);

    record = new Record(exercises);

    record.set("id", "a5wjd65uffrjt8f");
    record.set("system", true);
    record.set("name", "Pullup");
    record.set("measurementType", "m01s8yx7wfk2gxd");
    record.set("public", true);
    record.set("bodyweight", true);
    record.set("description", "Select from grip type.");
    record.set("variations", ["xlofh42c7nss995", "ul74mgnwah1s0r1", "acbog8cxg2umwhn"]);

    app.save(record);
  },
  (app) => {
    // No down migration yet
  }
);
