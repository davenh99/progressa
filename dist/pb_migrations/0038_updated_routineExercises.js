/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId("pbc_1139529185");

    // update field
    collection.fields.addAt(
      1,
      new Field({
        cascadeDelete: true,
        collectionId: "pbc_884676139",
        hidden: false,
        id: "relation1274468566",
        maxSelect: 1,
        minSelect: 0,
        name: "routine",
        presentable: false,
        required: true,
        system: false,
        type: "relation",
      })
    );

    return app.save(collection);
  },
  (app) => {
    const collection = app.findCollectionByNameOrId("pbc_1139529185");

    // update field
    collection.fields.addAt(
      1,
      new Field({
        cascadeDelete: false,
        collectionId: "pbc_884676139",
        hidden: false,
        id: "relation1274468566",
        maxSelect: 1,
        minSelect: 0,
        name: "routine",
        presentable: false,
        required: true,
        system: false,
        type: "relation",
      })
    );

    return app.save(collection);
  }
);
