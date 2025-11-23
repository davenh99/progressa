/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId("pbc_1563017532");

    // remove field
    collection.fields.removeById("relation1654338538");

    return app.save(collection);
  },
  (app) => {
    const collection = app.findCollectionByNameOrId("pbc_1563017532");

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

    return app.save(collection);
  }
);
