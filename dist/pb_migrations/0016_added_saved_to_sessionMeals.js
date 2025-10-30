/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId("pbc_695162881");

    // add field
    collection.fields.addAt(
      9,
      new Field({
        hidden: false,
        id: "bool4192457509",
        name: "saved",
        presentable: false,
        required: false,
        system: false,
        type: "bool",
      })
    );

    return app.save(collection);
  },
  (app) => {
    const collection = app.findCollectionByNameOrId("pbc_695162881");

    // remove field
    collection.fields.removeById("bool4192457509");

    return app.save(collection);
  }
);
