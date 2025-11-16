/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId("pbc_1563017532");

    // add field
    collection.fields.addAt(
      17,
      new Field({
        hidden: false,
        id: "number1984494829",
        max: 100,
        min: 0,
        name: "enduranceRating",
        onlyInt: true,
        presentable: false,
        required: false,
        system: false,
        type: "number",
      })
    );

    // add field
    collection.fields.addAt(
      18,
      new Field({
        hidden: false,
        id: "number3716291499",
        max: 100,
        min: 0,
        name: "strengthRating",
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
    const collection = app.findCollectionByNameOrId("pbc_1563017532");

    // remove field
    collection.fields.removeById("number1984494829");

    // remove field
    collection.fields.removeById("number3716291499");

    return app.save(collection);
  }
);
