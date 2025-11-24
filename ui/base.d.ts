/* This file was automatically generated, changes will be overwritten. */

interface BaseRecord {
  id: string;
  collectionName: string;
  collectionId: string;
  created: string;
  updated: string;
}

/* Collection type: auth */
interface Users {
  email: string; // email
  emailVisibility?: boolean; // bool
  verified?: boolean; // bool
  name?: string; // text
  avatar?: string; // file
  height?: number; // number
  weight?: number; // number
  dob?: string; // date
}

type UsersRecord = Users & BaseRecord;

/* Collection type: base */
interface MeasurementTypes {
  system?: boolean; // bool
  createdBy?: string; // relation
  name?: string; // text
  numeric?: boolean; // bool
  public?: boolean; // bool
  displayName?: string; // text
}

type MeasurementTypesRecord = MeasurementTypes & BaseRecord;

/* Collection type: base */
interface MeasurementValues {
  measurementType?: string; // relation
  value?: string; // text
  createdBy?: string; // relation
  public?: boolean; // bool
}

type MeasurementValuesRecord = MeasurementValues & BaseRecord;

/* Collection type: base */
interface Exercises {
  createdBy?: string; // relation
  name?: string; // text
  description?: string; // text
  bodyweight?: boolean; // bool
  defaultMeasurementType?: string; // relation
  usersSaved?: string[]; // relation
  public?: boolean; // bool
  system?: boolean; // bool
  allowedMeasurementTypes?: string[]; // relation
  defaultMeasurementType2?: string; // relation
  allowedMeasurementTypes2?: string[]; // relation
  defaultMeasurementType3?: string; // relation
  allowedMeasurementTypes3?: string[]; // relation
  image?: string; // file
  video?: string; // file
  instructions?: string; // text
  difficulty?: "Novice" | "Beginner" | "Intermediate" | "Advanced" | "Expert" | "Master" | "Grand Master" | "Legendary" | ""; // select
  targetMuscleGroup?: "Trapezius" | "Abductors" | "Glutes" | "Adductors" | "Chest" | "Forearms" | "Shins" | "Hip Flexors" | "Triceps" | "Calves" | "Biceps" | "Quadriceps" | "Hamstrings" | "Shoulders" | "Abdominals" | "Back" | ""; // select
  musclePrimary?: "Gluteus Medius" | "Pectoralis Major" | "Adductor Magnus" | "Anterior Deltoids" | "Subscapularis" | "Gluteus Maximus" | "Erector Spinae" | "Triceps Brachii" | "Upper Trapezius" | "Iliopsoas" | "Soleus" | "Rectus Abdominis" | "Infraspinatus" | "Biceps Brachii" | "Lateral Deltoids" | "Latissimus Dorsi" | "Vastus Mediais" | "Biceps Femoris" | "Quadriceps Femoris" | "Tibialis Anterior" | "Posterior Deltoids" | "Brachioradialis" | "Obliques" | "Gastrocnemius" | ""; // select
  muscleSecondary?: "Gluteus Medius" | "Teres Major" | "Rectus Femoris" | "Pectoralis Major" | "Adductor Magnus" | "Brachialis" | "Anterior Deltoids" | "Subscapularis" | "Rhomboids" | "Gluteus Maximus" | "Iliopsoas" | "Triceps Brachii" | "Soleus" | "Rectus Abdominis" | "Levator Scapulae" | "Infraspinatus" | "Biceps Brachii" | "Latissimus Dorsi" | "Biceps Femoris" | "Extensor Digitorum Longus" | "Quadriceps Femoris" | "Supraspinatus" | "Anconeus" | "Medial Deltoids" | "Posterior Deltoids" | "Brachioradialis" | "Obliques" | "Gluteus Minimus" | "Gastrocnemius" | ""; // select
  muscleTertiary?: "Trapezius" | "Gluteus Medius" | "Teres Major" | "Rectus Femoris" | "Pectoralis Major" | "Adductor Magnus" | "Brachialis" | "Anterior Deltoids" | "Rhomboids" | "Gluteus Maximus" | "Tensor Fasciae Latae" | "Erector Spinae" | "Iliopsoas" | "Upper Trapezius" | "Triceps Brachii" | "Soleus" | "Transverse Abdominis" | "Rectus Abdominis" | "Biceps Brachii" | "Latissimus Dorsi" | "Biceps Femoris" | "Quadriceps Femoris" | "Tibialis Anterior" | "Gastrocnemius" | "Flexor Carpi Radialis" | "Posterior Deltoids" | "Brachioradialis" | "Obliques" | "Gluteus Minimus" | "Extensor Hallucis Longus" | "Teres Minor" | "Serratus Anterior" | "Tibialis Posterior" | ""; // select
  equipmentPrimary?: string[]; // relation
  equipmentSecondary?: string[]; // relation
  posture?: "Walking" | "Split Squat" | "Half Kneeling" | "Staggered Stance" | "Inverted" | "Standing" | "Seated Floor" | "Quadruped" | "Tuck L Sit" | "Side Lying" | "Hanging" | "Toe Balance" | "Isometric Split Squat" | "Side Plank" | "Single Leg Standing Bent Knee" | "Shin Box Seated" | "Horse Stance" | "L Sit" | "Single Leg Supported" | "Knee Over Toe Split Squat" | "Knee Hover Quadruped" | "March" | "90/90 Seated" | "Tall Kneeling" | "Knee Supported" | "Single Leg Bridge" | "Supine" | "Running" | "Bridge" | "Prone" | "Single Leg Standing" | "Seated" | "Wall Sit" | "V Sit Seated" | "Other" | "Kneeling" | ""; // select
  armCount?: "Double Arm" | "No Arms" | "Single Arm" | ""; // select
  armPattern?: "Continuous" | "Alternating" | ""; // select
  grip?: "Flat Palm" | "Fingertip" | "Bottoms Up" | "Mixed Grip" | "Supinated" | "Waiter Hold" | "Crush Grip" | "Horn Grip" | "False Grip" | "Neutral" | "Forearm" | "Hand Assisted" | "Other" | "Goblet" | "Bottoms Up Horn Grip" | "No Grip" | "Head Supported" | "Pronated" | ""; // select
  endLoadPosition?: "Order" | "Overhead" | "Behind Back" | "Low Hold" | "Lateral" | "Shoulder" | "Zercher" | "Bear Hug" | "Above Chest" | "Hip Crease" | "Other" | "No Load" | "Back Rack" | "Front Rack" | "Suitcase" | ""; // select
  legPattern?: "Continuous" | "Alternating" | ""; // select
  footElevation?: "Toes Elevated" | "Feet Elevated" | "Foot Elevated" | "Foot Elevated (Rear)" | "No Elevation" | "Foot Elevated (Side)" | "Heels Elevated" | "Foot Elevated (Front)" | "Foot Elevated (Lateral)" | ""; // select
  isCombination?: boolean; // bool
  movementPattern?: "Wrist Extension" | "Horizontal Pull" | "Locomotion" | "Hip Dominant" | "Knee Dominant" | "Horizontal Push" | "Shoulder Flexion" | "Shoulder Internal Rotation" | "Ankle Dorsiflexion" | "Shoulder Abduction" | "Anti-Extension" | "Anti-Lateral Flexion" | "Loaded Carry" | "Lateral Flexion" | "Scapular Elevation" | "Elbow Flexion" | "Rotational" | "Hip External Rotation" | "Horizontal Adduction" | "Hip Hinge" | "Shoulder External Rotation" | "Lateral Locomotion" | "Ankle Plantar Flexion" | "Spinal Extension" | "Hip Extension" | "Hip Flexion" | "Anti-Rotational" | "Hip Abduction" | "Hip Adduction" | "Vertical Push" | "Wrist Flexion" | "Anti-Flexion" | "Isometric Hold" | "Vertical Pull" | "Elbow Extension" | "Shoulder Scapular Plane Elevation" | "Spinal Flexion" | ""; // select
  movementPattern2?: "Hip Extension" | "Anti-Rotational" | "Hip External Rotation" | "Hip Hinge" | "Hip Abduction" | "Anti-Extension" | "Anti-Lateral Flexion" | "Horizontal Push" | "Vertical Push" | "Horizontal Pull" | "Spinal Rotational" | "Isometric Hold" | "Knee Dominant" | "Other" | "Elbow Flexion" | "Spinal Flexion" | "Rotational" | ""; // select
  movementPattern3?: "Hip Hinge" | "Anti-Extension" | "Anti-Lateral Flexion" | "Vertical Push" | "Horizontal Pull" | "Hip Internal Rotation" | "Isometric Hold" | "Knee Dominant" | ""; // select
  motionPlane?: "Sagittal Plane" | "Transverse Plane" | "Frontal Plane" | ""; // select
  motionPlane2?: "Sagittal Plane" | "Transverse Plane" | "Frontal Plane" | ""; // select
  motionPlane3?: "Sagittal Plane" | ""; // select
  bodyRegion?: "Core" | "Full Body" | "Upper Body" | "Lower Body" | ""; // select
  forceType?: "Push" | "Pull" | "Other" | "Push & Pull" | ""; // select
  mechanics?: "Pull" | "Compound" | "Isolation" | ""; // select
  laterality?: "Contralateral" | "Bilateral" | "Unilateral" | "Ipsilateral" | ""; // select
  field?: "Powerlifting" | "Postural" | "Bodybuilding" | "Ballistics" | "Mobility" | "Grinds" | "Calisthenics" | "Plyometric" | "Balance" | "Olympic Weightlifting" | "Animal Flow" | ""; // select
  isTimeBased?: boolean; // bool
}

type ExercisesRecord = Exercises & BaseRecord;

/* Collection type: base */
interface Sessions {
  name?: string; // text
  user?: string; // relation
  userDay?: string; // text
  notes?: string; // text
  userHeight?: number; // number
  userWeight?: number; // number
  tags?: string[]; // relation
  sleepQuality?: "terrible" | "poor" | "fair" | "good" | "great" | ""; // select
  exercisesOrder?: any; // json
  mealsOrder?: any; // json
  stressRating?: number; // number
  anxietyRating?: number; // number
  moodRating?: number; // number
  timeStart?: string; // date
  timeEnd?: string; // date
  sessionDuration?: number; // number
}

type SessionsRecord = Sessions & BaseRecord;

/* Collection type: base */
interface Tags {
  name?: string; // text
  createdBy?: string; // relation
  public?: boolean; // bool
  colorHex?: string; // text
}

type TagsRecord = Tags & BaseRecord;

/* Collection type: base */
interface SessionExercises {
  exercise: string; // relation
  notes?: string; // text
  tags?: string[]; // relation
  addedWeight?: number; // number
  restAfter?: number; // number
  measurementNumeric?: number; // number
  measurement2Numeric?: number; // number
  measurement3Numeric?: number; // number
  measurementValue?: string; // relation
  measurement2Value?: string; // relation
  measurement3Value?: string; // relation
  supersetParent?: string; // relation
  isWarmup?: boolean; // bool
  perceivedEffort?: number; // number
  session: string; // relation
  enduranceRating?: number; // number
  strengthRating?: number; // number
  timeStart?: string; // date
  timeEnd?: string; // date
  exerciseDuration?: number; // number
}

type SessionExercisesRecord = SessionExercises & BaseRecord;

/* Collection type: base */
interface SessionMeals {
  name?: string; // text
  kj?: number; // number
  gramsProtein?: number; // number
  gramsCarbohydrate?: number; // number
  gramsFat?: number; // number
  session: string; // relation
  tags?: string[]; // relation
  description?: string; // text
  saved?: boolean; // bool
}

type SessionMealsRecord = SessionMeals & BaseRecord;

/* Collection type: base */
interface Routines {
  name: string; // text
  user?: string; // relation
  description?: string; // text
  exercisesOrder?: any; // json
  readonly preview: string; // text
}

type RoutinesRecord = Routines & BaseRecord;

/* Collection type: base */
interface RoutineExercises {
  routine: string; // relation
  exercise: string; // relation
  notes?: string; // text
  tags?: string[]; // relation
  addedWeight?: number; // number
  restAfter?: number; // number
  measurementNumeric?: number; // number
  measurement2Numeric?: number; // number
  measurement3Numeric?: number; // number
  measurementValue?: string; // relation
  measurement2Value?: string; // relation
  measurement3Value?: string; // relation
  isWarmup?: boolean; // bool
  targetDuration?: number; // number
  supersetParent?: string; // relation
  enduranceRating?: number; // number
  strengthRating?: number; // number
}

type RoutineExercisesRecord = RoutineExercises & BaseRecord;

/* Collection type: base */
interface Equipments {
  name: string; // text
}

type EquipmentsRecord = Equipments & BaseRecord;

