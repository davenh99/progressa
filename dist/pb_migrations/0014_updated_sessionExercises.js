/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId("pbc_1563017532");

    // update collection data
    unmarshal(
      {
        deleteRule: "session.user=@request.auth.id",
        listRule: "session.user=@request.auth.id",
        updateRule: "session.user=@request.auth.id",
        viewRule: "session.user=@request.auth.id",
      },
      collection
    );

    return app.save(collection);
  },
  (app) => {
    const collection = app.findCollectionByNameOrId("pbc_1563017532");

    // update collection data
    unmarshal(
      {
        deleteRule: "user=@request.auth.id",
        listRule: "user=@request.auth.id",
        updateRule: "user=@request.auth.id",
        viewRule: "user=@request.auth.id",
      },
      collection
    );

    return app.save(collection);
  }
);
