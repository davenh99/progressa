/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId("exercises");

    collection.fields.addAt(
      5,
      new Field({
        cascadeDelete: false,
        collectionId: "pbc_2821557499",
        hidden: false,
        id: "relation729101162",
        maxSelect: 1,
        minSelect: 0,
        name: "defaultMeasurementType",
        presentable: false,
        required: false,
        system: false,
        type: "relation",
      })
    );

    // add field
    collection.fields.addAt(
      15,
      new Field({
        hidden: false,
        id: "file3309110367",
        maxSelect: 1,
        maxSize: 0,
        mimeTypes: [],
        name: "image",
        presentable: false,
        protected: false,
        required: false,
        system: false,
        thumbs: [],
        type: "file",
      })
    );

    // add field
    collection.fields.addAt(
      16,
      new Field({
        hidden: false,
        id: "file2093472300",
        maxSelect: 1,
        maxSize: 0,
        mimeTypes: [],
        name: "video",
        presentable: false,
        protected: false,
        required: false,
        system: false,
        thumbs: [],
        type: "file",
      })
    );

    // add field
    collection.fields.addAt(
      17,
      new Field({
        autogeneratePattern: "",
        hidden: false,
        id: "text2575139115",
        max: 0,
        min: 0,
        name: "instructions",
        pattern: "",
        presentable: false,
        primaryKey: false,
        required: false,
        system: false,
        type: "text",
      })
    );

    // add field
    collection.fields.addAt(
      18,
      new Field({
        hidden: false,
        id: "select3144380399",
        maxSelect: 1,
        name: "difficulty",
        presentable: false,
        required: false,
        system: false,
        type: "select",
        values: [
          "Novice",
          "Beginner",
          "Intermediate",
          "Advanced",
          "Expert",
          "Master",
          "Grand Master",
          "Legendary",
        ],
      })
    );

    // add field
    collection.fields.addAt(
      19,
      new Field({
        hidden: false,
        id: "relation3738894301",
        maxSelect: 1,
        name: "targetMuscleGroup",
        presentable: false,
        required: false,
        system: false,
        type: "select",
        values: [
          "Trapezius",
          "Abductors",
          "Glutes",
          "Adductors",
          "Chest",
          "Forearms",
          "Shins",
          "Hip Flexors",
          "Triceps",
          "Calves",
          "Biceps",
          "Quadriceps",
          "Hamstrings",
          "Shoulders",
          "Abdominals",
          "Back",
        ],
      })
    );

    // add field
    collection.fields.addAt(
      20,
      new Field({
        hidden: false,
        id: "relation3231338956",
        maxSelect: 1,
        name: "musclePrimary",
        presentable: false,
        required: false,
        system: false,
        type: "select",
        values: [
          "Gluteus Medius",
          "Pectoralis Major",
          "Adductor Magnus",
          "Anterior Deltoids",
          "Subscapularis",
          "Gluteus Maximus",
          "Erector Spinae",
          "Triceps Brachii",
          "Upper Trapezius",
          "Iliopsoas",
          "Soleus",
          "Rectus Abdominis",
          "Infraspinatus",
          "Biceps Brachii",
          "Lateral Deltoids",
          "Latissimus Dorsi",
          "Vastus Mediais",
          "Biceps Femoris",
          "Quadriceps Femoris",
          "Tibialis Anterior",
          "Posterior Deltoids",
          "Brachioradialis",
          "Obliques",
          "Gastrocnemius",
        ],
      })
    );

    // add field
    collection.fields.addAt(
      21,
      new Field({
        hidden: false,
        id: "relation1299607105",
        maxSelect: 1,
        name: "muscleSecondary",
        presentable: false,
        required: false,
        system: false,
        type: "select",
        values: [
          "Gluteus Medius",
          "Teres Major",
          "Rectus Femoris",
          "Pectoralis Major",
          "Adductor Magnus",
          "Brachialis",
          "Anterior Deltoids",
          "Subscapularis",
          "Rhomboids",
          "Gluteus Maximus",
          "Iliopsoas",
          "Triceps Brachii",
          "Soleus",
          "Rectus Abdominis",
          "Levator Scapulae",
          "Infraspinatus",
          "Biceps Brachii",
          "Latissimus Dorsi",
          "Biceps Femoris",
          "Extensor Digitorum Longus",
          "Quadriceps Femoris",
          "Supraspinatus",
          "Anconeus",
          "Medial Deltoids",
          "Posterior Deltoids",
          "Brachioradialis",
          "Obliques",
          "Gluteus Minimus",
          "Gastrocnemius",
        ],
      })
    );

    // add field
    collection.fields.addAt(
      22,
      new Field({
        hidden: false,
        id: "relation1933276611",
        maxSelect: 1,
        name: "muscleTertiary",
        presentable: false,
        required: false,
        system: false,
        type: "select",
        values: [
          "Trapezius",
          "Gluteus Medius",
          "Teres Major",
          "Rectus Femoris",
          "Pectoralis Major",
          "Adductor Magnus",
          "Brachialis",
          "Anterior Deltoids",
          "Rhomboids",
          "Gluteus Maximus",
          "Tensor Fasciae Latae",
          "Erector Spinae",
          "Iliopsoas",
          "Upper Trapezius",
          "Triceps Brachii",
          "Soleus",
          "Transverse Abdominis",
          "Rectus Abdominis",
          "Biceps Brachii",
          "Latissimus Dorsi",
          "Biceps Femoris",
          "Quadriceps Femoris",
          "Tibialis Anterior",
          "Gastrocnemius",
          "Flexor Carpi Radialis",
          "Posterior Deltoids",
          "Brachioradialis",
          "Obliques",
          "Gluteus Minimus",
          "Extensor Hallucis Longus",
          "Teres Minor",
          "Serratus Anterior",
          "Tibialis Posterior",
        ],
      })
    );

    // add field
    collection.fields.addAt(
      23,
      new Field({
        cascadeDelete: false,
        collectionId: "pbc_2447119828",
        hidden: false,
        id: "relation2252688345",
        maxSelect: 1,
        minSelect: 0,
        name: "equipmentPrimary",
        presentable: false,
        required: false,
        system: false,
        type: "relation",
      })
    );

    // add field
    collection.fields.addAt(
      24,
      new Field({
        cascadeDelete: false,
        collectionId: "pbc_2447119828",
        hidden: false,
        id: "relation2275489776",
        maxSelect: 1,
        minSelect: 0,
        name: "equipmentSecondary",
        presentable: false,
        required: false,
        system: false,
        type: "relation",
      })
    );

    // add field
    collection.fields.addAt(
      25,
      new Field({
        hidden: false,
        id: "select2690792214",
        maxSelect: 1,
        name: "posture",
        presentable: false,
        required: false,
        system: false,
        type: "select",
        values: [
          "Walking",
          "Split Squat",
          "Half Kneeling",
          "Staggered Stance",
          "Inverted",
          "Standing",
          "Seated Floor",
          "Quadruped",
          "Tuck L Sit",
          "Side Lying",
          "Hanging",
          "Toe Balance",
          "Isometric Split Squat",
          "Side Plank",
          "Single Leg Standing Bent Knee",
          "Shin Box Seated",
          "Horse Stance",
          "L Sit",
          "Single Leg Supported",
          "Knee Over Toe Split Squat",
          "Knee Hover Quadruped",
          "March",
          "90/90 Seated",
          "Tall Kneeling",
          "Knee Supported",
          "Single Leg Bridge",
          "Supine",
          "Running",
          "Bridge",
          "Prone",
          "Single Leg Standing",
          "Seated",
          "Wall Sit",
          "V Sit Seated",
          "Other",
          "Kneeling",
        ],
      })
    );

    // add field
    collection.fields.addAt(
      26,
      new Field({
        hidden: false,
        id: "select885276337",
        maxSelect: 1,
        name: "armCount",
        presentable: false,
        required: false,
        system: false,
        type: "select",
        values: ["Double Arm", "No Arms", "Single Arm"],
      })
    );

    // add field
    collection.fields.addAt(
      27,
      new Field({
        hidden: false,
        id: "select3111732077",
        maxSelect: 1,
        name: "armPattern",
        presentable: false,
        required: false,
        system: false,
        type: "select",
        values: ["Continuous", "Alternating"],
      })
    );

    // add field
    collection.fields.addAt(
      28,
      new Field({
        hidden: false,
        id: "select888802634",
        maxSelect: 1,
        name: "grip",
        presentable: false,
        required: false,
        system: false,
        type: "select",
        values: [
          "Flat Palm",
          "Fingertip",
          "Bottoms Up",
          "Mixed Grip",
          "Supinated",
          "Waiter Hold",
          "Crush Grip",
          "Horn Grip",
          "False Grip",
          "Neutral",
          "Forearm",
          "Hand Assisted",
          "Other",
          "Goblet",
          "Bottoms Up Horn Grip",
          "No Grip",
          "Head Supported",
          "Pronated",
        ],
      })
    );

    // add field
    collection.fields.addAt(
      29,
      new Field({
        hidden: false,
        id: "select1022487629",
        maxSelect: 1,
        name: "endLoadPosition",
        presentable: false,
        required: false,
        system: false,
        type: "select",
        values: [
          "Order",
          "Overhead",
          "Behind Back",
          "Low Hold",
          "Lateral",
          "Shoulder",
          "Zercher",
          "Bear Hug",
          "Above Chest",
          "Hip Crease",
          "Other",
          "No Load",
          "Back Rack",
          "Front Rack",
          "Suitcase",
        ],
      })
    );

    // add field
    collection.fields.addAt(
      30,
      new Field({
        hidden: false,
        id: "select367459245",
        maxSelect: 1,
        name: "legPattern",
        presentable: false,
        required: false,
        system: false,
        type: "select",
        values: ["Continuous", "Alternating"],
      })
    );

    // add field
    collection.fields.addAt(
      31,
      new Field({
        hidden: false,
        id: "select2683841512",
        maxSelect: 1,
        name: "footElevation",
        presentable: false,
        required: false,
        system: false,
        type: "select",
        values: [
          "Toes Elevated",
          "Feet Elevated",
          "Foot Elevated",
          "Foot Elevated (Rear)",
          "No Elevation",
          "Foot Elevated (Side)",
          "Heels Elevated",
          "Foot Elevated (Front)",
          "Foot Elevated (Lateral)",
        ],
      })
    );

    // add field
    collection.fields.addAt(
      32,
      new Field({
        hidden: false,
        id: "bool3872711076",
        name: "isCombination",
        presentable: false,
        required: false,
        system: false,
        type: "bool",
      })
    );

    // add field
    collection.fields.addAt(
      33,
      new Field({
        hidden: false,
        id: "text4161961133",
        maxSelect: 1,
        name: "movementPattern",
        presentable: false,
        required: false,
        system: false,
        type: "select",
        values: [
          "Wrist Extension",
          "Horizontal Pull",
          "Locomotion",
          "Hip Dominant",
          "Knee Dominant",
          "Horizontal Push",
          "Shoulder Flexion",
          "Shoulder Internal Rotation",
          "Ankle Dorsiflexion",
          "Shoulder Abduction",
          "Anti-Extension",
          "Anti-Lateral Flexion",
          "Loaded Carry",
          "Lateral Flexion",
          "Scapular Elevation",
          "Elbow Flexion",
          "Rotational",
          "Hip External Rotation",
          "Horizontal Adduction",
          "Hip Hinge",
          "Shoulder External Rotation",
          "Lateral Locomotion",
          "Ankle Plantar Flexion",
          "Spinal Extension",
          "Hip Extension",
          "Hip Flexion",
          "Anti-Rotational",
          "Hip Abduction",
          "Hip Adduction",
          "Vertical Push",
          "Wrist Flexion",
          "Anti-Flexion",
          "Isometric Hold",
          "Vertical Pull",
          "Elbow Extension",
          "Shoulder Scapular Plane Elevation",
          "Spinal Flexion",
        ],
      })
    );

    // add field
    collection.fields.addAt(
      34,
      new Field({
        hidden: false,
        id: "text2991223588",
        maxSelect: 1,
        name: "movementPattern2",
        presentable: false,
        required: false,
        system: false,
        type: "select",
        values: [
          "Hip Extension",
          "Anti-Rotational",
          "Hip External Rotation",
          "Hip Hinge",
          "Hip Abduction",
          "Anti-Extension",
          "Anti-Lateral Flexion",
          "Horizontal Push",
          "Vertical Push",
          "Horizontal Pull",
          "Spinal Rotational",
          "Isometric Hold",
          "Knee Dominant",
          "Other",
          "Elbow Flexion",
          "Spinal Flexion",
          "Rotational",
        ],
      })
    );

    // add field
    collection.fields.addAt(
      35,
      new Field({
        hidden: false,
        id: "text3310175154",
        maxSelect: 1,
        name: "movementPattern3",
        presentable: false,
        required: false,
        system: false,
        type: "select",
        values: [
          "Hip Hinge",
          "Anti-Extension",
          "Anti-Lateral Flexion",
          "Vertical Push",
          "Horizontal Pull",
          "Hip Internal Rotation",
          "Isometric Hold",
          "Knee Dominant",
        ],
      })
    );

    // add field
    collection.fields.addAt(
      36,
      new Field({
        hidden: false,
        id: "select999341016",
        maxSelect: 1,
        name: "motionPlane",
        presentable: false,
        required: false,
        system: false,
        type: "select",
        values: ["Sagittal Plane", "Transverse Plane", "Frontal Plane"],
      })
    );

    // add field
    collection.fields.addAt(
      37,
      new Field({
        hidden: false,
        id: "select2464576592",
        maxSelect: 1,
        name: "motionPlane2",
        presentable: false,
        required: false,
        system: false,
        type: "select",
        values: ["Sagittal Plane", "Transverse Plane", "Frontal Plane"],
      })
    );

    // add field
    collection.fields.addAt(
      38,
      new Field({
        hidden: false,
        id: "select3856745670",
        maxSelect: 1,
        name: "motionPlane3",
        presentable: false,
        required: false,
        system: false,
        type: "select",
        values: ["Sagittal Plane"],
      })
    );

    // add field
    collection.fields.addAt(
      39,
      new Field({
        hidden: false,
        id: "select555719700",
        maxSelect: 1,
        name: "bodyRegion",
        presentable: false,
        required: false,
        system: false,
        type: "select",
        values: ["Core", "Full Body", "Upper Body", "Lower Body"],
      })
    );

    // add field
    collection.fields.addAt(
      40,
      new Field({
        hidden: false,
        id: "select1767259479",
        maxSelect: 1,
        name: "forceType",
        presentable: false,
        required: false,
        system: false,
        type: "select",
        values: ["Push", "Pull", "Other", "Push & Pull"],
      })
    );

    // add field
    collection.fields.addAt(
      41,
      new Field({
        hidden: false,
        id: "select849752397",
        maxSelect: 1,
        name: "mechanics",
        presentable: false,
        required: false,
        system: false,
        type: "select",
        values: ["Pull", "Compound", "Isolation"],
      })
    );

    // add field
    collection.fields.addAt(
      42,
      new Field({
        hidden: false,
        id: "select605673998",
        maxSelect: 1,
        name: "laterality",
        presentable: false,
        required: false,
        system: false,
        type: "select",
        values: ["Contralateral", "Bilateral", "Unilateral", "Ipsilateral"],
      })
    );

    // add field
    collection.fields.addAt(
      43,
      new Field({
        hidden: false,
        id: "select1542800728",
        maxSelect: 1,
        name: "field",
        presentable: false,
        required: false,
        system: false,
        type: "select",
        values: [
          "Powerlifting",
          "Postural",
          "Bodybuilding",
          "Ballistics",
          "Mobility",
          "Grinds",
          "Calisthenics",
          "Plyometric",
          "Balance",
          "Olympic Weightlifting",
          "Animal Flow",
        ],
      })
    );

    // add field
    collection.fields.addAt(
      44,
      new Field({
        hidden: false,
        id: "booltime711034",
        name: "isTimeBased",
        presentable: false,
        required: false,
        system: false,
        type: "bool",
      })
    );

    return app.save(collection);
  },
  (app) => {
    const collection = app.findCollectionByNameOrId("pbc_1804250889");

    // remove field
    collection.fields.removeById("file3309110367");

    // remove field
    collection.fields.removeById("file2093472300");

    // remove field
    collection.fields.removeById("text2575139115");

    // remove field
    collection.fields.removeById("select3144380399");

    // remove field
    collection.fields.removeById("relation3738894301");

    // remove field
    collection.fields.removeById("relation3231338956");

    // remove field
    collection.fields.removeById("relation1299607105");

    // remove field
    collection.fields.removeById("relation1933276611");

    // remove field
    collection.fields.removeById("relation2252688345");

    // remove field
    collection.fields.removeById("relation2275489776");

    // remove field
    collection.fields.removeById("select2690792214");

    // remove field
    collection.fields.removeById("select885276337");

    // remove field
    collection.fields.removeById("select3111732077");

    // remove field
    collection.fields.removeById("select888802634");

    // remove field
    collection.fields.removeById("select1022487629");

    // remove field
    collection.fields.removeById("select367459245");

    // remove field
    collection.fields.removeById("select2683841512");

    // remove field
    collection.fields.removeById("bool3872711076");

    // remove field
    collection.fields.removeById("text4161961133");

    // remove field
    collection.fields.removeById("text2991223588");

    // remove field
    collection.fields.removeById("text3310175154");

    // remove field
    collection.fields.removeById("select999341016");

    // remove field
    collection.fields.removeById("select2464576592");

    // remove field
    collection.fields.removeById("select3856745670");

    // remove field
    collection.fields.removeById("select555719700");

    // remove field
    collection.fields.removeById("select1767259479");

    // remove field
    collection.fields.removeById("select849752397");

    // remove field
    collection.fields.removeById("select605673998");

    // remove field
    collection.fields.removeById("select1542800728");

    return app.save(collection);
  }
);
