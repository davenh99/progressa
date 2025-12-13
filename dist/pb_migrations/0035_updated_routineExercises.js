/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId("pbc_1139529185");

    // remove field
    collection.fields.removeById("relation1654338538");

    // add field
    collection.fields.addAt(
      14,
      new Field({
        hidden: false,
        id: "duration1654338838",
        min: 0,
        name: "targetDuration",
        presentable: false,
        required: false,
        system: false,
        type: "number",
      })
    );

    return app.save(collection);
  },
  (app) => {
    const collection = app.findCollectionByNameOrId("pbc_1139529185");

    // add field
    collection.fields.addAt(
      13,
      new Field({
        cascadeDelete: false,
        collectionId: "pbc_2642941843",
        hidden: false,
        id: "relation1654338538",
        maxSelect: 1,
        minSelect: 0,
        name: "variation",
        presentable: false,
        required: false,
        system: false,
        type: "relation",
      })
    );

    // remove field
    collection.fields.removeById("duration1654338838");

    return app.save(collection);
  }
);
