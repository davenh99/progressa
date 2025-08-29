/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    let exerciseVariations = app.findCollectionByNameOrId("exerciseVariations");

    variations = [
       // 20mm edge lift
      { e: "70vlzfveuudrmax", n: "Full crimp", d: "Be careful with this one. Thumb fully wrapped over fingers" },
      { e: "70vlzfveuudrmax", n: "Half crimp", d: "Fingers engaged at slightly more than 90 degrees, no thumb wrap" },
      { e: "70vlzfveuudrmax", n: "Chisel grip", d: "Half way between half crimp and open hand" },
      { e: "70vlzfveuudrmax", n: "Open hand", d: "Also known as 3-finger drag" },
      // Pull-up
      { e: "a5wjd65uffrjt8f", n: "Standard grip", d: "Shoulder-width grip, palms facing away" },
      { e: "a5wjd65uffrjt8f", n: "Wide grip", d: "Hands wider than shoulders, emphasizes lats" },
      { e: "a5wjd65uffrjt8f", n: "Close grip", d: "Hands close together, more biceps involvement" },
      { e: "a5wjd65uffrjt8f", n: "Neutral grip", d: "Palms facing each other, easier on wrists/shoulders" },
      { e: "a5wjd65uffrjt8f", n: "Mixed grip", d: "One palm facing in, one facing out (commando style)" },
      { e: "a5wjd65uffrjt8f", n: "Archer", d: "Pull up to one side while keeping other arm extended" },
      { e: "a5wjd65uffrjt8f", n: "Typewriter", d: "Pull up wide, then shift side to side at the top" },
      { e: "a5wjd65uffrjt8f", n: "L-sit", d: "Hold legs extended straight out while performing pull-ups" },
      // Chin-up
      { e: "a5wjd65ifgrjt9f", n: "Standard grip", d: "Shoulder-width supinated grip, palms facing you" },
      { e: "a5wjd65ifgrjt9f", n: "Close grip", d: "Hands close together, strong biceps emphasis" },
      { e: "a5wjd65ifgrjt9f", n: "Wide grip", d: "Hands wider than shoulders, harder on wrists" },
      { e: "a5wjd65ifgrjt9f", n: "Offset grip", d: "One hand higher or lower on the bar" },
      { e: "a5wjd65ifgrjt9f", n: "Towel grip", d: "Grip towels or ropes over the bar for forearm challenge" },
      { e: "a5wjd65ifgrjt9f", n: "L-sit", d: "Hold legs extended straight out while performing chin-ups" },
      // Push-up
      { e: "a5wjd65ifgrjt9g", n: "Standard", d: "Shoulder-width hand placement" },
      { e: "a5wjd65ifgrjt9g", n: "Wide", d: "Hands placed wider than shoulders, chest emphasis" },
      { e: "a5wjd65ifgrjt9g", n: "Diamond", d: "Hands close together under chest forming a diamond, triceps focus" },
      { e: "a5wjd65ifgrjt9g", n: "Staggered", d: "One hand forward, one hand back" },
      { e: "a5wjd65ifgrjt9g", n: "Incline", d: "Hands elevated on a surface, easier version" },
      { e: "a5wjd65ifgrjt9g", n: "Decline", d: "Feet elevated on a surface, harder, upper chest focus" },
      { e: "a5wjd65ifgrjt9g", n: "Archer", d: "Wide push-up, shifting weight to one side" },
      { e: "a5wjd65ifgrjt9g", n: "Spiderman", d: "Knee comes to elbow during each rep" },
      { e: "a5wjd65ifgrjt9g", n: "Pike", d: "Hips raised high, shoulders more engaged" },
      { e: "a5wjd65ifgrjt9g", n: "One-arm", d: "Advanced variation, one hand only" },
      // Squat
      { e: "a5wjd65ifgrjt9h", n: "Bodyweight", d: "Standard squat with no external load" },
      { e: "a5wjd65ifgrjt9h", n: "Back squat", d: "Barbell resting across upper back" },
      { e: "a5wjd65ifgrjt9h", n: "Front squat", d: "Barbell racked on front shoulders" },
      { e: "a5wjd65ifgrjt9h", n: "Overhead squat", d: "Barbell held overhead, mobility and core heavy" },
      { e: "a5wjd65ifgrjt9h", n: "Goblet squat", d: "Single dumbbell or kettlebell held at chest" },
      { e: "a5wjd65ifgrjt9h", n: "Split squat", d: "Staggered stance, one foot forward" },
      { e: "a5wjd65ifgrjt9h", n: "Bulgarian split squat", d: "Rear foot elevated on bench" },
      { e: "a5wjd65ifgrjt9h", n: "Pistol squat", d: "Single-leg squat with opposite leg extended" },
      // Bar dip
      { e: "a5wjd65ifgrjt9i", n: "Standard", d: "Shoulder-width grip, controlled descent" },
      { e: "a5wjd65ifgrjt9i", n: "Wide grip", d: "Hands placed wider, chest emphasis" },
      { e: "a5wjd65ifgrjt9i", n: "Narrow grip", d: "Hands close together, triceps focus" },
      { e: "a5wjd65ifgrjt9i", n: "Knee raise dip", d: "Bring knees up during dip for added core" },
      { e: "a5wjd65ifgrjt9i", n: "Straight bar dip", d: "Hands on single straight bar, more chest load" },
      // Ring dip
      { e: "a5wjd65ifgrjt9j", n: "Standard", d: "Neutral grip on rings, requires stability" },
      { e: "a5wjd65ifgrjt9j", n: "Deep dip", d: "Go lower than parallel for extra range" },
      { e: "a5wjd65ifgrjt9j", n: "Bulgarian dip", d: "Slight forward lean, greater chest activation" },
      { e: "a5wjd65ifgrjt9j", n: "L-sit dip", d: "Hold legs extended straight out while dipping" },
      { e: "a5wjd65ifgrjt9j", n: "RTO dip", d: "Rings turned out at top, increases shoulder demand" },
      // Running
      { e: "a5wjd65ifgrjt9k", n: "1 km run", d: "Steady pace run for ~1 kilometer" },
      { e: "a5wjd65ifgrjt9k", n: "2 km run", d: "Steady pace run for ~2 kilometers" },
      { e: "a5wjd65ifgrjt9k", n: "5 km run", d: "Common training distance for endurance" },
      { e: "a5wjd65ifgrjt9k", n: "10 km run", d: "Longer steady-state endurance run" },
      { e: "a5wjd65ifgrjt9k", n: "Half marathon", d: "21.1 km endurance run" },
      { e: "a5wjd65ifgrjt9k", n: "Marathon", d: "42.2 km long-distance endurance run" },
      // Sprint
      { e: "a5wjd65ifgrjt9l", n: "100 m sprint", d: "Short explosive sprint, maximum intensity" },
      { e: "a5wjd65ifgrjt9l", n: "200 m sprint", d: "Fast sprint with slight endurance demand" },
      { e: "a5wjd65ifgrjt9l", n: "400 m sprint", d: "Long sprint, tests both speed and endurance" },
      { e: "a5wjd65ifgrjt9l", n: "800 m sprint", d: "Middle-distance, sustained high intensity" },
      // Barbell bench press
      { e: "a5wjd65ifgrjt9m", n: "Flat bench", d: "Standard barbell bench press on flat bench" },
      { e: "a5wjd65ifgrjt9m", n: "Incline bench", d: "Bench set at incline, targets upper chest" },
      { e: "a5wjd65ifgrjt9m", n: "Decline bench", d: "Bench set at decline, targets lower chest" },
      { e: "a5wjd65ifgrjt9m", n: "Close grip", d: "Hands closer together, triceps emphasis" },
      { e: "a5wjd65ifgrjt9m", n: "Wide grip", d: "Hands wider than shoulder width, chest emphasis" },
      { e: "a5wjd65ifgrjt9m", n: "Paused bench", d: "Pause at the chest before pressing" },
      // Dumbbell bench press
      { e: "a5wjd65ifgrjt9n", n: "Flat bench", d: "Standard dumbbell press on flat bench" },
      { e: "a5wjd65ifgrjt9n", n: "Incline bench", d: "Incline bench, more upper chest focus" },
      { e: "a5wjd65ifgrjt9n", n: "Decline bench", d: "Decline bench, more lower chest focus" },
      { e: "a5wjd65ifgrjt9n", n: "Neutral grip", d: "Palms facing each other, shoulder-friendly" },
      { e: "a5wjd65ifgrjt9n", n: "Single-arm", d: "One dumbbell at a time, core stabilization" },
      // Swimming
      { e: "a5wjd65ifgrjt9o", n: "Freestyle 50m", d: "Front crawl sprint for 50 meters" },
      { e: "a5wjd65ifgrjt9o", n: "Freestyle 100m", d: "Front crawl for 100 meters" },
      { e: "a5wjd65ifgrjt9o", n: "Freestyle 200m", d: "Front crawl for 200 meters" },
      { e: "a5wjd65ifgrjt9o", n: "Freestyle 400m", d: "Front crawl for 400 meters" },
      { e: "a5wjd65ifgrjt9o", n: "Backstroke 50m", d: "Backstroke sprint for 50 meters" },
      { e: "a5wjd65ifgrjt9o", n: "Backstroke 100m", d: "Backstroke for 100 meters" },
      { e: "a5wjd65ifgrjt9o", n: "Backstroke 200m", d: "Backstroke for 200 meters" },
      { e: "a5wjd65ifgrjt9o", n: "Backstroke 400m", d: "Backstroke for 400 meters" },
      { e: "a5wjd65ifgrjt9o", n: "Breaststroke 50m", d: "Breaststroke sprint for 50 meters" },
      { e: "a5wjd65ifgrjt9o", n: "Breaststroke 100m", d: "Breaststroke for 100 meters" },
      { e: "a5wjd65ifgrjt9o", n: "Breaststroke 200m", d: "Breaststroke for 200 meters" },
      { e: "a5wjd65ifgrjt9o", n: "Breaststroke 400m", d: "Breaststroke for 400 meters" },
      { e: "a5wjd65ifgrjt9o", n: "Butterfly 50m", d: "Butterfly sprint for 50 meters" },
      { e: "a5wjd65ifgrjt9o", n: "Butterfly 100m", d: "Butterfly for 100 meters" },
      { e: "a5wjd65ifgrjt9o", n: "Butterfly 200m", d: "Butterfly for 200 meters" },
      { e: "a5wjd65ifgrjt9o", n: "Butterfly 400m", d: "Butterfly for 400 meters" },
      // Face pull
      { e: "a5wjd65ifgrjt9p", n: "Standard", d: "Cable set at upper chest height, elbows high" },
      { e: "a5wjd65ifgrjt9p", n: "Overhead", d: "Pull rope slightly upward, more upper traps" },
      { e: "a5wjd65ifgrjt9p", n: "Underhand grip", d: "Palms facing up, hits rear delts differently" },
      { e: "a5wjd65ifgrjt9p", n: "Single-arm", d: "One arm at a time, more unilateral stability" },
      // Barbell curl
      { e: "a5wjd65ifgrjt9q", n: "Standard", d: "Shoulder-width grip, standing" },
      { e: "a5wjd65ifgrjt9q", n: "Wide grip", d: "Hands wider than shoulders, emphasizes short head" },
      { e: "a5wjd65ifgrjt9q", n: "Close grip", d: "Hands close together, emphasizes long head" },
      { e: "a5wjd65ifgrjt9q", n: "Reverse curl", d: "Overhand grip, targets brachialis and forearms" },
      { e: "a5wjd65ifgrjt9q", n: "Spider curl", d: "Performed face down on incline bench for strict form" },
      // Deadlift
      { e: "a5wjd65ifgrjt9r", n: "Conventional", d: "Standard stance, bar over mid-foot" },
      { e: "a5wjd65ifgrjt9r", n: "Sumo", d: "Wide stance, hands inside knees" },
      { e: "a5wjd65ifgrjt9r", n: "Romanian", d: "Bar lowered to mid-shin with slight knee bend, hamstring focus" },
      { e: "a5wjd65ifgrjt9r", n: "Deficit", d: "Performed standing on platform for increased range of motion" },
      { e: "a5wjd65ifgrjt9r", n: "Block pull / Rack pull", d: "Barbell elevated, shorter range, heavy overload" },
      { e: "a5wjd65ifgrjt9r", n: "Trap bar", d: "Using hex bar, more quad and trap emphasis" },
      // Hammer curl
      { e: "a5wjd65ifgrjt9s", n: "Standard", d: "Neutral grip dumbbell curl" },
      { e: "a5wjd65ifgrjt9s", n: "Cross-body", d: "Curl dumbbell across body toward opposite shoulder" },
      { e: "a5wjd65ifgrjt9s", n: "Incline", d: "Performed seated on incline bench, deeper stretch" },
      { e: "a5wjd65ifgrjt9s", n: "Preacher", d: "Performed on preacher bench, isolates brachialis" },
      { e: "a5wjd65ifgrjt9s", n: "Rope cable", d: "Using rope attachment on cable for constant tension" },
      // Bench dip
      { e: "a5wjd65ifgrjt9t", n: "Standard", d: "Hands on bench, feet on floor" },
      { e: "a5wjd65ifgrjt9t", n: "Feet elevated", d: "Feet placed on another bench or platform, harder" },
      { e: "a5wjd65ifgrjt9t", n: "Weighted", d: "Plate or dumbbell placed on lap for added resistance" },
      { e: "a5wjd65ifgrjt9t", n: "Single-leg", d: "One foot elevated, other leg extended for more stability challenge" },
      // Skull crusher
      { e: "a5wjd65ifgrjt9u", n: "Barbell (EZ bar)", d: "Classic version with EZ curl bar" },
      { e: "a5wjd65ifgrjt9u", n: "Dumbbell", d: "Each arm works independently" },
      { e: "a5wjd65ifgrjt9u", n: "Incline bench", d: "Performed on incline bench for greater stretch" },
      { e: "a5wjd65ifgrjt9u", n: "Decline bench", d: "Performed on decline bench for different angle" },
      { e: "a5wjd65ifgrjt9u", n: "Cable", d: "Constant tension with cable attachment" },
      // Australian pull-up (inverted row)
      { e: "a5wjd65ifgrjt9v", n: "Standard", d: "Shoulder-width overhand grip" },
      { e: "a5wjd65ifgrjt9v", n: "Underhand grip", d: "Chin-up style grip, more biceps" },
      { e: "a5wjd65ifgrjt9v", n: "Wide grip", d: "Hands wider than shoulders, upper back focus" },
      { e: "a5wjd65ifgrjt9v", n: "Feet elevated", d: "Harder version with feet raised" },
      // Box jump
      { e: "a5wjd65ifgrjt9w", n: "Standard", d: "Two-foot jump onto box" },
      { e: "a5wjd65ifgrjt9w", n: "Single-leg", d: "Jump off one leg, land on box" },
      { e: "a5wjd65ifgrjt9w", n: "Depth jump", d: "Step off box and immediately jump onto another" },
      { e: "a5wjd65ifgrjt9w", n: "Lateral jump", d: "Jump sideways onto box" },
      // Leg press
      { e: "a5wjd65ifgrjt9y", n: "Standard", d: "Shoulder-width stance" },
      { e: "a5wjd65ifgrjt9y", n: "Wide stance", d: "Feet placed wide apart, inner thigh focus" },
      { e: "a5wjd65ifgrjt9y", n: "Narrow stance", d: "Feet close together, quad focus" },
      { e: "a5wjd65ifgrjt9y", n: "Single-leg", d: "Unilateral variation, more balance required" },
      { e: "a5wjd65ifgrjt9y", n: "High foot placement", d: "Glute and hamstring emphasis" },
      { e: "a5wjd65ifgrjt9y", n: "Low foot placement", d: "Quad emphasis" },
      // Muscle up
      { e: "a5wjd65ifgrjt9z", n: "Standard", d: "Overhand grip on bar" },
      { e: "a5wjd65ifgrjt9z", n: "Ring muscle up", d: "Performed on gymnastic rings" },
      { e: "a5wjd65ifgrjt9z", n: "Strict", d: "No kipping, pure strength" },
      { e: "a5wjd65ifgrjt9z", n: "Kipping", d: "Use momentum to assist" },
      // Hip thrust
      { e: "b5wjd65ifgrjt9c", n: "Standard", d: "Barbell across hips, shoulder blades on bench" },
      { e: "b5wjd65ifgrjt9c", n: "Single-leg", d: "One leg lifted, unilateral strength" },
      { e: "b5wjd65ifgrjt9c", n: "Banded", d: "Resistance band around knees for glute activation" },
      { e: "b5wjd65ifgrjt9c", n: "Paused", d: "Hold at top for extra tension" },
      { e: "b5wjd65ifgrjt9c", n: "Feet elevated", d: "Feet on a platform, increases range of motion" },
      // Step up
      { e: "b5wjd65ifgrjt9d", n: "Standard", d: "Bodyweight, step onto bench or box" },
      { e: "b5wjd65ifgrjt9d", n: "Lateral step up", d: "Step up from the side for hip and glute focus" },
      { e: "b5wjd65ifgrjt9d", n: "Crossover", d: "Step across body onto bench" },
      { e: "b5wjd65ifgrjt9d", n: "Knee drive", d: "Drive opposite knee upward explosively" },
      // Crunch
      { e: "b5wjd65ifgrjt9e", n: "Standard", d: "Basic bodyweight crunch" },
      { e: "b5wjd65ifgrjt9e", n: "Bicycle crunch", d: "Alternating elbow to opposite knee" },
      { e: "b5wjd65ifgrjt9e", n: "Reverse crunch", d: "Lift hips off floor, lower abs focus" },
      { e: "b5wjd65ifgrjt9e", n: "Oblique crunch", d: "Twist torso, target obliques" },
      // Sit-up
      { e: "b5wjd65ifgrjt9f", n: "Standard", d: "Full sit-up with bodyweight" },
      { e: "b5wjd65ifgrjt9f", n: "Butterfly sit-up", d: "Feet together, knees out" },
      { e: "b5wjd65ifgrjt9f", n: "Incline sit-up", d: "Perform on decline bench" },
      { e: "b5wjd65ifgrjt9f", n: "Twisting sit-up", d: "Rotate torso to target obliques" },
      // Plank
      { e: "b5wjd65ifgrjt9g", n: "Standard plank", d: "Forearms on ground, straight body" },
      { e: "b5wjd65ifgrjt9g", n: "High plank", d: "Arms extended like push-up position" },
      { e: "b5wjd65ifgrjt9g", n: "Plank with leg lift", d: "Alternate lifting one leg" },
      { e: "b5wjd65ifgrjt9g", n: "Plank with shoulder tap", d: "Tap alternating shoulders" },
      // Side plank
      { e: "b5wjd65ifgrjt9h", n: "Standard side plank", d: "On one forearm, body straight" },
      { e: "b5wjd65ifgrjt9h", n: "Side plank with hip dip", d: "Lower and raise hips" },
      { e: "b5wjd65ifgrjt9h", n: "Side plank with leg lift", d: "Raise top leg for extra challenge" },
      { e: "b5wjd65ifgrjt9h", n: "Side plank reach-through", d: "Rotate and thread arm under body" },
      // Hanging sit-up
      { e: "b5wjd65ifgrjt9i", n: "Standard", d: "Sit-up motion while hanging from bar" },
      { e: "b5wjd65ifgrjt9i", n: "Twisting", d: "Rotate torso to alternate sides" },
      { e: "b5wjd65ifgrjt9i", n: "L-sit hold", d: "Hold legs straight out instead of sit-up reps" },
      { e: "b5wjd65ifgrjt9i", n: "Toes-to-bar progression", d: "Lift legs fully to bar" },
      // Calf raise
      { e: "b5wjd65ifgrjt9j", n: "Standing", d: "Basic calf raise on flat ground" },
      { e: "b5wjd65ifgrjt9j", n: "Single-leg calf raise", d: "One leg at a time" },
      { e: "b5wjd65ifgrjt9j", n: "Seated calf raise", d: "Focuses on soleus muscle" },
      { e: "b5wjd65ifgrjt9j", n: "Donkey calf raise", d: "Bent-over position, bodyweight or loaded" },
      // Bar dead hang
      { e: "b5wjd65ifgrjt9k", n: "Standard grip", d: "Shoulder-width overhand grip" },
      { e: "b5wjd65ifgrjt9k", n: "Wide grip", d: "Hands wider than shoulders" },
      { e: "b5wjd65ifgrjt9k", n: "Close grip", d: "Hands close together" },
      { e: "b5wjd65ifgrjt9k", n: "Neutral grip", d: "Palms facing each other" },
      { e: "b5wjd65ifgrjt9k", n: "Mixed grip", d: "One palm facing forward, one back" },
      // 20mm edge dead hang
      { e: "b5wjd65ifgsjt9k", n: "Full crimp", d: "Thumb wrapped over fingers, intense grip" },
      { e: "b5wjd65ifgsjt9k", n: "Half crimp", d: "Fingers bent slightly >90°, no thumb wrap" },
      { e: "b5wjd65ifgsjt9k", n: "Chisel grip", d: "Between half crimp and open hand" },
      { e: "b5wjd65ifgsjt9k", n: "Open hand", d: "Fingers open, less stress on joints" },
      // Rolling bar dead hang
      { e: "b5wjd55ifggjt9k", n: "Standard grip", d: "Shoulder-width overhand grip" },
      { e: "b5wjd55ifggjt9k", n: "Wide grip", d: "Hands wider than shoulders" },
      { e: "b5wjd55ifggjt9k", n: "Close grip", d: "Hands close together" },
      { e: "b5wjd55ifggjt9k", n: "Neutral grip", d: "Palms facing each other" },
      { e: "b5wjd55ifggjt9k", n: "Mixed grip", d: "One palm forward, one back" },
      // One arm 20mm edge dead hang
      { e: "b5whd75ifgrjt9l", n: "Full crimp", d: "Thumb wrapped over fingers, intense grip" },
      { e: "b5whd75ifgrjt9l", n: "Half crimp", d: "Fingers bent slightly >90°, no thumb wrap" },
      { e: "b5whd75ifgrjt9l", n: "Chisel grip", d: "Between half crimp and open hand" },
      { e: "b5whd75ifgrjt9l", n: "Open hand", d: "Fingers open, less stress on joints" },
      // One arm 25mm edge dead hang
      { e: "b5wid75ifgrjt9l", n: "Full crimp", d: "Thumb wrapped over fingers, intense grip" },
      { e: "b5wid75ifgrjt9l", n: "Half crimp", d: "Fingers bent slightly >90°, no thumb wrap" },
      { e: "b5wid75ifgrjt9l", n: "Chisel grip", d: "Between half crimp and open hand" },
      { e: "b5wid75ifgrjt9l", n: "Open hand", d: "Fingers open, less stress on joints" },
      // One arm 30mm edge dead hang
      { e: "b5wid85ifgrjt9l", n: "Full crimp", d: "Thumb wrapped over fingers, intense grip" },
      { e: "b5wid85ifgrjt9l", n: "Half crimp", d: "Fingers bent slightly >90°, no thumb wrap" },
      { e: "b5wid85ifgrjt9l", n: "Chisel grip", d: "Between half crimp and open hand" },
      { e: "b5wid85ifgrjt9l", n: "Open hand", d: "Fingers open, less stress on joints" },
      // One arm 35mm edge dead hang
      { e: "b5wid95ifgrjt9l", n: "Full crimp", d: "Thumb wrapped over fingers, intense grip" },
      { e: "b5wid95ifgrjt9l", n: "Half crimp", d: "Fingers bent slightly >90°, no thumb wrap" },
      { e: "b5wid95ifgrjt9l", n: "Chisel grip", d: "Between half crimp and open hand" },
      { e: "b5wid95ifgrjt9l", n: "Open hand", d: "Fingers open, less stress on joints" },
      // One arm 40mm edge dead hang
      { e: "b5wid96ifgrjt9l", n: "Full crimp", d: "Thumb wrapped over fingers, intense grip" },
      { e: "b5wid96ifgrjt9l", n: "Half crimp", d: "Fingers bent slightly >90°, no thumb wrap" },
      { e: "b5wid96ifgrjt9l", n: "Chisel grip", d: "Between half crimp and open hand" },
      { e: "b5wid96ifgrjt9l", n: "Open hand", d: "Fingers open, less stress on joints" },
      // Barbell wrist curl
      { e: "b5wjd65ifgrjt9m", n: "Standard", d: "Seated or standing, palms up" },
      { e: "b5wjd65ifgrjt9m", n: "Reverse", d: "Palms facing down, targets forearm extensors" },
      // Dumbbell wrist curl
      { e: "b5wjd65ifgrjt9n", n: "Standard", d: "Seated or standing, palms up" },
      { e: "b5wjd65ifgrjt9n", n: "Reverse", d: "Palms down, forearm extensors" },
      // Cycling
      { e: "b5wjd65ifgrjt9o", n: "1 km ride", d: "Surely you can do more than that?" },
      { e: "b5wjd65ifgrjt9o", n: "5 km ride", d: "Short ride for warm-up or recovery" },
      { e: "b5wjd65ifgrjt9o", n: "10 km ride", d: "Moderate distance ride" },
      { e: "b5wjd65ifgrjt9o", n: "20 km ride", d: "Endurance-focused ride" },
      { e: "b5wjd65ifgrjt9o", n: "50 km ride", d: "Long distance, aerobic challenge" },
      { e: "b5wjd65ifgrjt9o", n: "100 km ride", d: "Epic endurance ride" },
      // Lunge
      { e: "b5wjd65ifgrjt9p", n: "Forward lunge", d: "Step forward, drop back knee toward ground" },
      { e: "b5wjd65ifgrjt9p", n: "Reverse lunge", d: "Step backward, focus on glutes and balance" },
      { e: "b5wjd65ifgrjt9p", n: "Walking lunge", d: "Alternate legs moving forward with each step" },
      { e: "b5wjd65ifgrjt9p", n: "Side lunge", d: "Step sideways, targets inner thighs" },
      { e: "b5wjd65ifgrjt9p", n: "Curtsy lunge", d: "Step back and across, targets glutes and outer thigh" },
      { e: "b5wjd65ifgrjt9p", n: "Weighted lunge", d: "Hold dumbbells or barbell for added resistance" },
      { e: "b5wjd65ifgrjt9p", n: "Bulgarian split lunge", d: "Rear foot elevated on bench, increases range of motion" },
    ];

    for (const v of variations) {
      let record = new Record(exerciseVariations);

      record.set("id", v.id);
      record.set("exercise", v.e);
      record.set("description", v.d);
      record.set("name", v.n);
      app.save(record);
    }
  },
  (app) => {
    // No down migration yet
  }
);
