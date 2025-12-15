/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId("pbc_203563952");

    // update field
    collection.fields.addAt(
      2,
      new Field({
        cascadeDelete: true,
        collectionId: "pbc_1804250889",
        hidden: false,
        id: "relation2933576988",
        maxSelect: 1,
        minSelect: 0,
        name: "exercise",
        presentable: false,
        required: true,
        system: false,
        type: "relation",
      })
    );

    return app.save(collection);
  },
  (app) => {
    const collection = app.findCollectionByNameOrId("pbc_203563952");

    // update field
    collection.fields.addAt(
      2,
      new Field({
        cascadeDelete: false,
        collectionId: "pbc_1804250889",
        hidden: false,
        id: "relation2933576988",
        maxSelect: 1,
        minSelect: 0,
        name: "exercise",
        presentable: false,
        required: true,
        system: false,
        type: "relation",
      })
    );

    return app.save(collection);
  }
);
