/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId("pbc_1139529185");

    // add field
    collection.fields.addAt(
      15,
      new Field({
        cascadeDelete: false,
        collectionId: "pbc_1139529185",
        hidden: false,
        id: "relation3589910472",
        maxSelect: 1,
        minSelect: 0,
        name: "supersetParent",
        presentable: false,
        required: false,
        system: false,
        type: "relation",
      })
    );

    return app.save(collection);
  },
  (app) => {
    const collection = app.findCollectionByNameOrId("pbc_1139529185");

    // remove field
    collection.fields.removeById("relation3589910472");

    return app.save(collection);
  }
);
