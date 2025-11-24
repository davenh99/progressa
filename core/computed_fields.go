package core

import (
	"fmt"
	"progressa/plugins/computedfields"
	"strings"

	"github.com/pocketbase/pocketbase/core"
)

var ComputedFieldsCfg = computedfields.Config{
	CollectionComputedFields: map[string][]computedfields.ComputedField{
		"routines": {
			{
				FieldName: "preview",
				FieldType: computedfields.TEXT,
				Compute: func(e *core.RecordEnrichEvent) any {
					// need to get routineExercises belonging to this routine
					// collate if same exercise and number of reps
					// consider non-rep based exercises
					// measurementType == 'm01s8yx7wfk2gxd' (reps)
					// measurementType == 'distancem000000' (reps)
					// measurementType == 'distancekm00000' (reps)
					// and also if time based, prefer some display for that instead
					// name := e.Record.Get("name")
					// return fmt.Sprintf("blah: %s", name)

					routineId := e.Record.Id
					if routineId == "" {
						return ""
					}

					// --- 1. Load routineExercises for this routine ---
					routineExs, err := e.App.FindRecordsByFilter(
						"routineExercises",
						"routine = {:routineId}",
						"",
						500,
						0,
						map[string]any{"routineId": routineId},
					)
					if err != nil || len(routineExs) == 0 {
						return ""
					}

					// cache for exercise names
					exerciseNameCache := map[string]string{}

					// --- 2. Build preview parts ---
					type key struct {
						ExerciseId string
						Amount     string // reps, minutes, distance, etc.
					}
					grouped := map[key]int{}

					for _, r := range routineExs {
						exId := r.GetString("exercise")
						if exId == "" {
							continue
						}

						// fetch exercise name once
						name, ok := exerciseNameCache[exId]
						if !ok {
							ex, err := e.App.FindRecordById("exercises", exId)
							if err != nil {
								continue
							}
							name = ex.GetString("name")
							exerciseNameCache[exId] = name
						}

						// --- 3. Determine measurement style ---
						amount := ""
						// mt := ""

						// If time-based
						if r.GetBool("isTimeBased") {
							dur := r.GetInt("targetDuration")
							if dur > 0 {
								amount = fmt.Sprintf("%ds", dur)
								// mt = "time"
							}
						}

						// If numeric (reps, distance, weight, etc.)
						if amount == "" {
							num := r.GetInt("measurementNumeric")
							if num > 0 {
								amount = fmt.Sprintf("%d", num)
								// mt = "numeric"
							}
						}

						// fallback if no measurement
						if amount == "" {
							amount = ""
						}

						k := key{ExerciseId: exId, Amount: amount}
						grouped[k]++
					}

					// --- 4. Turn grouped entries into readable preview ---
					parts := []string{}
					for k, count := range grouped {
						name := exerciseNameCache[k.ExerciseId]

						switch {
						// Many repeated identical exercises with identical measurement
						case k.Amount != "" && count >= 1:
							parts = append(parts, fmt.Sprintf("%d×%s %s", count, k.Amount, name))

						// No measurement, single
						case k.Amount == "" && count == 1:
							parts = append(parts, name)

						// No measurement, grouped
						default:
							parts = append(parts, fmt.Sprintf("%d×%s", count, name))
						}
					}

					if len(parts) == 0 {
						return ""
					}

					// final preview string
					return strings.Join(parts, ", ")
				},
			},
		},
	},
}
