/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    let equipments = app.findCollectionByNameOrId("equipments");

    const data = [
      {
        n: "Miniband",
        id: "MinibandISTWZry",
      },
      {
        n: "Cable",
        id: "CablexDeUs6ZQme",
      },
      {
        n: "Tire",
        id: "TireaYfbemQcETj",
      },
      {
        n: "Landmine",
        id: "LandmineqJmIul2",
      },
      {
        n: "Bench (Decline)",
        id: "BenchDecl3jWlkq",
      },
      {
        n: "Sledge Hammer",
        id: "SledgeHammpViFS",
      },
      {
        n: "Clubbell",
        id: "ClubbellTvy41I5",
      },
      {
        n: "Sliders",
        id: "SlidersOjbV9A6t",
      },
      {
        n: "Dumbbell",
        id: "Dumbbell3tBAsD9",
      },
      {
        n: "Kettlebell",
        id: "KettlebellBKvl5",
      },
      {
        n: "Bench (Flat)",
        id: "BenchFlatrn6lbH",
      },
      {
        n: "EZ Bar",
        id: "EZBarfetsNMEbxA",
      },
      {
        n: "Barbell",
        id: "Barbell4RWrt1Tp",
      },
      {
        n: "Heavy Sandbag",
        id: "HeavySandb5VsZG",
      },
      {
        n: "Stability Ball",
        id: "StabilityBcelKc",
      },
      {
        n: "Battle Ropes",
        id: "BattleRopePGudg",
      },
      {
        n: "Slam Ball",
        id: "SlamBallbG1EJfn",
      },
      {
        n: "Weight Plate",
        id: "WeightPlat6PWLV",
      },
      {
        n: "Bulgarian Bag",
        id: "BulgarianBj03vt",
      },
      {
        n: "Bench (Incline)",
        id: "BenchIncl8j7Ov6",
      },
      {
        n: "Superband",
        id: "SuperbandyYXYIC",
      },
      {
        n: "Climbing Rope",
        id: "ClimbingRoTtMes",
      },
      {
        n: "Gymnastic Rings",
        id: "GymnasticRtEUVh",
      },
      {
        n: "Sled",
        id: "SledZYVtxL1PTRW",
      },
      {
        n: "Sandbag",
        id: "SandbagpyNTPcmJ",
      },
      {
        n: "Macebell",
        id: "MacebellCCGmtic",
      },
      {
        n: "Medicine Ball",
        id: "MedicineBatgNDz",
      },
      {
        n: "Parallette Bars",
        id: "ParalletteznBGL",
      },
      {
        n: "Gravity Boots",
        id: "GravityBooPtVxH",
      },
      {
        n: "Slant Board",
        id: "SlantBoardl80qz",
      },
      {
        n: "Wall Ball",
        id: "WallBallB154uR0",
      },
      {
        n: "Bodyweight",
        id: "Bodyweight4X8q1",
      },
      {
        n: "Resistance Band",
        id: "ResistanceKxIYh",
      },
      {
        n: "Trap Bar",
        id: "TrapBarPZs75BEZ",
      },
      {
        n: "Suspension Trainer",
        id: "SuspensionTZGey",
      },
      {
        n: "Indian Club",
        id: "IndianClubl8UDT",
      },
      {
        n: "Plyo Box",
        id: "PlyoBoxCAUbiF0Z",
      },
      {
        n: "Ab Wheel",
        id: "AbWheelc3Hl7cHw",
      },
      {
        n: "Pull Up Bar",
        id: "PullUpBarGRiPxY",
      },
    ];

    for (const d of data) {
      let record = new Record(equipments);

      record.set("id", d.id.toLowerCase());
      record.set("name", d.n);

      app.save(record);
    }
  },
  (app) => {
    // No down migration yet
  }
);
