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
          id: "_clone_huYE",
          max: 0,
          min: 0,
          name: "name",
          pattern: "",
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
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
        {
          autogeneratePattern: "",
          hidden: false,
          id: "_clone_C0R0",
          max: 0,
          min: 0,
          name: "description",
          pattern: "",
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
          type: "text",
        },
        {
          cascadeDelete: true,
          collectionId: "pbc_1804250889",
          hidden: false,
          id: "_clone_S2P8",
          maxSelect: 1,
          minSelect: 0,
          name: "exercise",
          presentable: false,
          required: true,
          system: false,
          type: "relation",
        },
      ],
      id: "pbc_754532938",
      indexes: [],
      listRule: null,
      name: "exerciseVariations_view",
      system: false,
      type: "view",
      updateRule: null,
      viewQuery:
        "SELECT\n  v.id AS id,\n  v.name AS name,\n  CAST((e.name || ' (' || v.name || ')') AS TEXT) displayName,\n  v.description AS description,\n  v.exercise AS exercise\nFROM exerciseVariations v\nJOIN exercises e ON v.exercise = e.id",
      viewRule: null,
    });

    return app.save(collection);
  },
  (app) => {
    const collection = app.findCollectionByNameOrId("pbc_754532938");

    return app.delete(collection);
  }
);
