/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId("pbc_1563017532");

    // add field
    collection.fields.addAt(
      8,
      new Field({
        hidden: false,
        id: "number2381468880",
        max: null,
        min: null,
        name: "measurement2Numeric",
        onlyInt: false,
        presentable: false,
        required: false,
        system: false,
        type: "number",
      })
    );

    // add field
    collection.fields.addAt(
      9,
      new Field({
        hidden: false,
        id: "number1096307790",
        max: null,
        min: null,
        name: "measurement3Numeric",
        onlyInt: false,
        presentable: false,
        required: false,
        system: false,
        type: "number",
      })
    );

    // add field
    collection.fields.addAt(
      11,
      new Field({
        cascadeDelete: false,
        collectionId: "pbc_920668891",
        hidden: false,
        id: "relation1958976562",
        maxSelect: 1,
        minSelect: 0,
        name: "measurement2Value",
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
        collectionId: "pbc_920668891",
        hidden: false,
        id: "relation3214888855",
        maxSelect: 1,
        minSelect: 0,
        name: "measurement3Value",
        presentable: false,
        required: false,
        system: false,
        type: "relation",
      })
    );

    return app.save(collection);
  },
  (app) => {
    const collection = app.findCollectionByNameOrId("pbc_1563017532");

    // remove field
    collection.fields.removeById("number2381468880");

    // remove field
    collection.fields.removeById("number1096307790");

    // remove field
    collection.fields.removeById("relation1958976562");

    // remove field
    collection.fields.removeById("relation3214888855");

    return app.save(collection);
  }
);
