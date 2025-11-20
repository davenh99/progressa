/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId("pbc_415974452");

    // add field
    collection.fields.addAt(
      14,
      new Field({
        hidden: false,
        id: "date2921333693",
        max: "",
        min: "",
        name: "timeStart",
        presentable: false,
        required: false,
        system: false,
        type: "date",
      })
    );

    // add field
    collection.fields.addAt(
      15,
      new Field({
        hidden: false,
        id: "date1731930",
        max: "",
        min: "",
        name: "timeEnd",
        presentable: false,
        required: false,
        system: false,
        type: "date",
      })
    );

    // add field
    collection.fields.addAt(
      16,
      new Field({
        hidden: false,
        id: "number431587761",
        max: null,
        min: 0,
        name: "sessionDuration",
        onlyInt: false,
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
    collection.fields.removeById("date2921333693");

    // remove field
    collection.fields.removeById("date1731930");

    // remove field
    collection.fields.removeById("number431587761");

    return app.save(collection);
  }
);
