package core

import (
	"encoding/json"
	"fmt"
	"progressa/types"
	"slices"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
)

var ROUTINE_EXPANDS = []string{
	"routineExercises_via_routine.exercise.defaultMeasurementType.measurementValues_via_measurementType",
	"routineExercises_via_routine.exercise.defaultMeasurementType2.measurementValues_via_measurementType",
	"routineExercises_via_routine.exercise.defaultMeasurementType3.measurementValues_via_measurementType",
	"routineExercises_via_routine.measurementValue",
	"routineExercises_via_routine.measurement2Value",
	"routineExercises_via_routine.measurement3Value",
	"routineExercises_via_routine.variation",
	"routineExercises_via_routine.tags",
}

func ImportRoutineIntoRoutine(app core.App, payload *types.ImportRoutinePayload) (*core.Record, error, string) {
	routineExercises, err := app.FindRecordsByFilter(
		"routineExercises",
		"routine = {:routineId}",
		"",
		9999,
		0,
		dbx.Params{"routineId": payload.ImportRoutineId},
	)
	if err != nil {
		return nil, err, "couldn't find matching routine"
	}

	// map ids to inds for easier lookup later
	routineExercisesIdInds := map[string]int{}
	for i, re := range routineExercises {
		routineExercisesIdInds[re.Id] = i
	}

	// map new ids to old ids for later
	oldToNewIdsMap := map[string]string{}

	newRecords := []*core.Record{}

	routineExercisesCollection, err := app.FindCollectionByNameOrId("routineExercises")
	if err != nil {
		return nil, err, "couldn't find routineExercises collection"
	}

	for _, re := range routineExercises {
		record := core.NewRecord(routineExercisesCollection)

		copyRoutineExercise(record, re, payload.SessionOrRoutineId)

		newRecords = append(newRecords, record)
	}

	// fill in the superset parents afterwards. is this correct, are the ids safe to use before 'app.Save(record)'?
	for ind, re := range routineExercises {
		if re.Get("supersetParent") != nil {
			supersetParent := newRecords[routineExercisesIdInds[re.Get("supersetParent").(string)]].Id
			newRecords[ind].Set("supersetParent", supersetParent)
		}
	}

	err = app.RunInTransaction(func(txApp core.App) error {
		for i, record := range newRecords {
			if err := txApp.Save(record); err != nil {
				return err
			}
			// routineExercises is in same order as newRecords
			oldToNewIdsMap[routineExercises[i].Id] = record.Id
		}

		// collect new exercise IDs
		newIds := make([]string, len(newRecords))
		for i, rec := range newRecords {
			newIds[i] = rec.Id
		}

		// must sort the newIDs by the position of the old ones from 'exercisesOrder'
		importRoutine, err := app.FindRecordById("routines", payload.ImportRoutineId)
		if err != nil {
			return err
		}

		// get the old exercisesOrder
		var exercisesOrder []string
		raw := importRoutine.GetString("exercisesOrder")
		if err := json.Unmarshal([]byte(raw), &exercisesOrder); err != nil {
			app.Logger().Error("couldn't unmarshal exercisesOrder string")
		}

		// map new ids to positions
		newIdPositions := map[string]int{}
		for i, id := range exercisesOrder {
			newId := oldToNewIdsMap[id]
			newIdPositions[newId] = i
		}

		if len(newIdPositions) != len(newIds) {
			app.Logger().Error("not all old ids were found in exercisesOrder when importing routine")
			return fmt.Errorf("some ids missing in exercisesOrder mapping: %v", newIds)
		}

		// drop the new Ids in where they belong
		sortedNewIds := make([]string, len(newIds))
		for _, id := range newIds {
			position := newIdPositions[id]
			sortedNewIds[position] = id
		}

		if err := updateRoutineExercisesOrder(txApp, payload.SessionOrRoutineId, payload.InsertIndex, newIds); err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		return nil, err, fmt.Sprintf("problem saving new records: %v", err)
	}

	routine, err := app.FindRecordById("routines", payload.SessionOrRoutineId)
	if err != nil {
		return nil, err, "couldn't find new routine"
	}

	app.ExpandRecord(routine, ROUTINE_EXPANDS, nil)

	return routine, nil, ""
}

func DuplicateRoutineRow(app core.App, payload *types.DuplicatePayload) (*core.Record, error, string) {
	parentRoutineExercise, err := app.FindRecordById("routineExercises", payload.ExerciseRowId)
	if err != nil {
		return nil, err, "couldn't find parentRoutineExercise"
	}
	childRoutineExercises, err := app.FindRecordsByFilter(
		"routineExercises",
		"supersetParent = {:recordId}",
		"",
		9999,
		0,
		dbx.Params{"recordId": payload.ExerciseRowId},
	)
	if err != nil {
		return nil, err, "problem finding child records"
	}

	insertIndex := payload.RowIndex + len(childRoutineExercises)

	err = app.RunInTransaction(func(txApp core.App) error {
		collection, err := app.FindCollectionByNameOrId("routineExercises")
		if err != nil {
			return err
		}

		newParentRecord := core.NewRecord(collection)
		duplicateRoutineExercise(newParentRecord, parentRoutineExercise, nil)

		if err := txApp.Save(newParentRecord); err != nil {
			return err
		}

		// map new ids to old ids for later
		oldToNewIdsMap := map[string]string{}
		oldToNewIdsMap[parentRoutineExercise.Id] = newParentRecord.Id

		// collect new IDs (parent + children)
		newIds := []string{newParentRecord.Id}

		for _, childRecord := range childRoutineExercises {
			newChildRecord := core.NewRecord(collection)
			duplicateRoutineExercise(newChildRecord, childRecord, &newParentRecord.Id)

			if err := txApp.Save(newChildRecord); err != nil {
				return err
			}

			oldToNewIdsMap[childRecord.Id] = newChildRecord.Id
			newIds = append(newIds, newChildRecord.Id)
		}

		// must sort the newIDs by the position of the old ones from 'exercisesOrder'
		routine, err := app.FindRecordById("routines", parentRoutineExercise.GetString("routine"))
		if err != nil {
			return err
		}

		// get the old exercisesOrder
		var exercisesOrder []string
		raw := routine.GetString("exercisesOrder")
		if err := json.Unmarshal([]byte(raw), &exercisesOrder); err != nil {
			app.Logger().Error("couldn't unmarshal exercisesOrder string")
		}

		// map new ids to positions
		newIdPositions := map[string]int{}
		// need to keep track of minimum index of dropset ids, to adjust later
		minInd := -1
		for i, id := range exercisesOrder {
			newId := oldToNewIdsMap[id]

			if slices.Contains(newIds, newId) {
				newIdPositions[newId] = i
				if minInd < 0 || i < minInd {
					minInd = i
				}
			}
		}

		if len(newIdPositions) != len(newIds) {
			app.Logger().Error("not all old ids were found in exercisesOrder when duplicating row")
			return fmt.Errorf("some ids missing in exercisesOrder mapping: %v", newIds)
		}

		// drop the new Ids in where they belong
		sortedNewIds := make([]string, len(newIds))
		for _, id := range newIds {
			position := newIdPositions[id]
			// adjust position by min ind
			sortedNewIds[position-minInd] = id
		}

		// fmt.Printf("map: %v\n", oldToNewIdsMap)
		// fmt.Printf("pos: %v\n", newIdPositions)
		// fmt.Printf("sort: %v\n", sortedNewIds)

		if err := updateRoutineExercisesOrder(txApp, parentRoutineExercise.GetString("routine"), insertIndex, newIds); err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		return nil, err, fmt.Sprintf("problem copying records: %v", err)
	}

	routine, err := app.FindRecordById("routines", parentRoutineExercise.GetString("routine"))
	if err != nil {
		return nil, err, "couldn't find new record"
	}

	app.ExpandRecord(routine, ROUTINE_EXPANDS, nil)

	return routine, nil, ""
}

func updateRoutineExercisesOrder(app core.App, routineId string, insertIndex int, newIds []string) error {
	routineRecord, err := app.FindRecordById("routines", routineId)
	if err != nil {
		return err
	}

	// Parse existing exercisesOrder
	var exercisesOrder []string
	raw := routineRecord.GetString("exercisesOrder")
	if err := json.Unmarshal([]byte(raw), &exercisesOrder); err != nil {
		app.Logger().Error("couldn't unmarshal exercisesOrder string")
	}

	// Clamp index
	if insertIndex < 0 {
		insertIndex = 0
	} else if insertIndex > len(exercisesOrder) {
		insertIndex = len(exercisesOrder)
	}

	// Insert new IDs
	updatedOrder := make([]string, 0, len(exercisesOrder)+len(newIds))
	updatedOrder = append(updatedOrder, exercisesOrder[:insertIndex+1]...)
	updatedOrder = append(updatedOrder, newIds...)
	updatedOrder = append(updatedOrder, exercisesOrder[insertIndex+1:]...)

	// Save back
	routineRecord.Set("exercisesOrder", updatedOrder)
	return app.Save(routineRecord)
}

func copyRoutineExercise(dst *core.Record, src *core.Record, routineId string) {
	dst.Set("exercise", src.Get("exercise"))
	dst.Set("routine", routineId)
	dst.Set("variation", src.Get("variation"))
	dst.Set("notes", src.Get("notes"))
	dst.Set("tags", src.Get("tags"))
	dst.Set("addedWeight", src.Get("addedWeight"))
	dst.Set("restAfter", src.Get("restAfter"))
	dst.Set("isWarmup", src.Get("isWarmup"))
	dst.Set("measurementNumeric", src.Get("measurementNumeric"))
	dst.Set("measurement2Numeric", src.Get("measurement2Numeric"))
	dst.Set("measurement3Numeric", src.Get("measurement3Numeric"))
	dst.Set("measurementValue", src.Get("measurementValue"))
	dst.Set("measurement2Value", src.Get("measurement2Value"))
	dst.Set("measurement3Value", src.Get("measurement3Value"))
}

func duplicateRoutineExercise(dst *core.Record, src *core.Record, parentId *string) {
	dst.Set("exercise", src.Get("exercise"))
	dst.Set("routine", src.Get("routine"))
	dst.Set("variation", src.Get("variation"))
	dst.Set("notes", src.Get("notes"))
	dst.Set("tags", src.Get("tags"))
	dst.Set("addedWeight", src.Get("addedWeight"))
	dst.Set("restAfter", src.Get("restAfter"))
	dst.Set("isWarmup", src.Get("isWarmup"))
	dst.Set("measurementNumeric", src.Get("measurementNumeric"))
	dst.Set("measurement2Numeric", src.Get("measurement2Numeric"))
	dst.Set("measurement3Numeric", src.Get("measurement3Numeric"))
	dst.Set("measurementValue", src.Get("measurementValue"))
	dst.Set("measurement2Value", src.Get("measurement2Value"))
	dst.Set("measurement3Value", src.Get("measurement3Value"))
	if parentId != nil {
		dst.Set("supersetParent", *parentId)
	}
}
