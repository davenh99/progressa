/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const collection = new Collection({
      createRule: null,
      deleteRule: null,
      fields: [
        {
          autogeneratePattern: "",
          hidden: false,
          id: "text3208210256",
          max: 0,
          min: 0,
          name: "id",
          pattern: "^[a-z0-9]+$",
          presentable: false,
          primaryKey: true,
          required: true,
          system: true,
          type: "text",
        },
        {
          autogeneratePattern: "",
          hidden: false,
          id: "text1731158936",
          max: 0,
          min: 0,
          name: "displayName",
          pattern: "",
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
          type: "text",
        },
      ],
      id: "pbc_98694773",
      indexes: [],
      listRule: "",
      name: "exerciseVariations_computed",
      system: false,
      type: "view",
      updateRule: null,
      viewQuery:
        "SELECT\n  (ROW_NUMBER() OVER()) as id,\n  CAST((exercises.name || ' (' || exerciseVariations.name || ')') AS TEXT) displayName\nFROM exerciseVariations\nJOIN exercises ON exerciseVariations.exercise = exercises.id",
      viewRule: "",
    });

    return app.save(collection);
  },
  (app) => {
    const collection = app.findCollectionByNameOrId("pbc_98694773");

    return app.delete(collection);
  }
);
