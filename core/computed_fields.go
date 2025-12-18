package core

import (
	"encoding/json"
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

					// get exercises order for sorting
					var exercisesOrder []string
					raw := e.Record.GetString("exercisesOrder")
					if err := json.Unmarshal([]byte(raw), &exercisesOrder); err != nil {
						e.App.Logger().Error("couldn't unmarshal exercisesOrder string")
					}

					idPositions := map[string]int{}

					for i, id := range exercisesOrder {
						idPositions[id] = i
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

					// sort the exercises properly.
					routineExsSorted := make([]*core.Record, len(routineExs))
					for _, ex := range routineExs {
						routineExsSorted[idPositions[ex.Id]] = ex
					}

					// cache for exercise names
					exerciseNameCache := map[string]string{}

					// --- 2. Build preview parts ---
					type key struct {
						ExerciseId string
						Amount     string // reps, minutes, distance, etc.
					}
					grouped := map[key]int{}
					orderedKeys := []key{}

					for _, r := range routineExsSorted {
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

						if _, exists := grouped[k]; !exists {
							orderedKeys = append(orderedKeys, k)
						}
						grouped[k]++
					}

					// --- 4. Turn grouped entries into readable preview ---
					parts := []string{}
					for _, k := range orderedKeys {
						count := grouped[k]
						name := exerciseNameCache[k.ExerciseId]

						switch {
						// Many repeated identical exercises with identical measurement
						case k.Amount != "" && count >= 1:
							parts = append(parts, fmt.Sprintf("%d×%s %s", count, k.Amount, name))

						// No measurement, single
						case k.Amount == "" && count == 1:
							parts = append(parts, fmt.Sprintf("1× %s", name))

						// No measurement, grouped
						default:
							parts = append(parts, fmt.Sprintf("%d× %s", count, name))
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
