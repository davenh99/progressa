/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId("pbc_1804250889");

    // remove field
    collection.fields.removeById("relation1538482014");

    // add field
    collection.fields.addAt(
      11,
      new Field({
        cascadeDelete: false,
        collectionId: "pbc_2821557499",
        hidden: false,
        id: "relation1160476469",
        maxSelect: 1,
        minSelect: 0,
        name: "defaultMeasurementType2",
        presentable: false,
        required: false,
        system: false,
        type: "relation",
      })
    );

    // add field
    collection.fields.addAt(
      12,
      new Field({
        cascadeDelete: false,
        collectionId: "pbc_2821557499",
        hidden: false,
        id: "relation3665259660",
        maxSelect: 999,
        minSelect: 0,
        name: "allowdMeasurementTypes2",
        presentable: false,
        required: false,
        system: false,
        type: "relation",
      })
    );

    // add field
    collection.fields.addAt(
      13,
      new Field({
        cascadeDelete: false,
        collectionId: "pbc_2821557499",
        hidden: false,
        id: "relation841762723",
        maxSelect: 1,
        minSelect: 0,
        name: "defaultMeasurementType3",
        presentable: false,
        required: false,
        system: false,
        type: "relation",
      })
    );

    // add field
    collection.fields.addAt(
      14,
      new Field({
        cascadeDelete: false,
        collectionId: "pbc_2821557499",
        hidden: false,
        id: "relation2909821978",
        maxSelect: 999,
        minSelect: 0,
        name: "allowdMeasurementTypes3",
        presentable: false,
        required: false,
        system: false,
        type: "relation",
      })
    );

    return app.save(collection);
  },
  (app) => {
    const collection = app.findCollectionByNameOrId("pbc_1804250889");

    // remove field
    collection.fields.removeById("relation1160476469");

    // remove field
    collection.fields.removeById("relation3665259660");

    // remove field
    collection.fields.removeById("relation841762723");

    // remove field
    collection.fields.removeById("relation2909821978");

    collection.fields.addAt(
      9,
      new Field({
        cascadeDelete: false,
        collectionId: "pbc_2642941843",
        hidden: false,
        id: "relation1538482014",
        maxSelect: 999,
        minSelect: 0,
        name: "variations",
        presentable: false,
        required: false,
        system: false,
        type: "relation",
      })
    );

    return app.save(collection);
  }
);
