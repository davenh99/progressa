/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId("pbc_1563017532");

    // add field
    collection.fields.addAt(
      19,
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
      20,
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
      21,
      new Field({
        hidden: false,
        id: "number3514102958",
        max: null,
        min: null,
        name: "exerciseDuration",
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
    const collection = app.findCollectionByNameOrId("pbc_1563017532");

    // remove field
    collection.fields.removeById("date2921333693");

    // remove field
    collection.fields.removeById("date1731930");

    // remove field
    collection.fields.removeById("number3514102958");

    return app.save(collection);
  }
);
