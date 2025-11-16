/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId("pbc_415974452");

    // add field
    collection.fields.addAt(
      11,
      new Field({
        hidden: false,
        id: "number319486758",
        max: 5,
        min: 0,
        name: "stressRating",
        onlyInt: true,
        presentable: false,
        required: false,
        system: false,
        type: "number",
      })
    );

    // add field
    collection.fields.addAt(
      12,
      new Field({
        hidden: false,
        id: "number1570253453",
        max: 5,
        min: 0,
        name: "anxietyRating",
        onlyInt: true,
        presentable: false,
        required: false,
        system: false,
        type: "number",
      })
    );

    // add field
    collection.fields.addAt(
      13,
      new Field({
        hidden: false,
        id: "number1553789333",
        max: 5,
        min: 0,
        name: "moodRating",
        onlyInt: true,
        presentable: false,
        required: false,
        system: false,
        type: "number",
      })
    );

    return app.save(collection);
  },
  (app) => {
    const collection = app.findCollectionByNameOrId("pbc_415974452");

    // remove field
    collection.fields.removeById("number319486758");

    // remove field
    collection.fields.removeById("number1570253453");

    // remove field
    collection.fields.removeById("number1553789333");

    return app.save(collection);
  }
);
