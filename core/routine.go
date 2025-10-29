package core

import (
	"cmp"
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

	// sort so parents always come before children, so their ids exist when we want to link them to children.
	slices.SortFunc(routineExercises, func(a *core.Record, b *core.Record) int {
		return cmp.Compare(len(a.GetString("supersetParent")), len(b.GetString("supersetParent")))
	})

	// map ids to inds for easier lookup later
	routineExercisesIdInds := map[string]int{}
	for i, re := range routineExercises {
		routineExercisesIdInds[re.Id] = i
	}

	routineExercisesCollection, err := app.FindCollectionByNameOrId("routineExercises")
	if err != nil {
		return nil, err, "couldn't find routineExercises collection"
	}

	newRecords := []*core.Record{}
	for _, re := range routineExercises {
		record := core.NewRecord(routineExercisesCollection)

		copyRoutineExercise(record, re, payload.SessionOrRoutineId)

		newRecords = append(newRecords, record)
	}

	// map new ids to old ids for later
	oldToNewIdsMap := map[string]string{}

	err = app.RunInTransaction(func(txApp core.App) error {
		for i, record := range newRecords {
			if routineExercises[i].Get("supersetParent") != nil {
				// get the new id, it will exist by now
				newSupersetParent := oldToNewIdsMap[routineExercises[i].GetString("supersetParent")]
				record.Set("supersetParent", newSupersetParent)
			}

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

		sortedNewIds, err := sortNewIds(app, "routines", oldToNewIdsMap, newIds, payload.ImportRoutineId)
		if err != nil {
			return err
		}

		if err := updateSessionOrRoutineExercisesOrder(txApp, "routines", payload.SessionOrRoutineId, payload.InsertIndex, sortedNewIds); err != nil {
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

	errs := app.ExpandRecord(routine, ROUTINE_EXPANDS, nil)
	if len(errs) > 0 {
		return nil, fmt.Errorf("problem expanding records: %v", errs), "problem expanding records"
	}

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

		sortedNewIds, err := sortNewIds(app, "routines", oldToNewIdsMap, newIds, parentRoutineExercise.GetString("routine"))
		if err != nil {
			return err
		}

		if err := updateSessionOrRoutineExercisesOrder(txApp, "routines", parentRoutineExercise.GetString("routine"), insertIndex+1, sortedNewIds); err != nil {
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

	errs := app.ExpandRecord(routine, ROUTINE_EXPANDS, nil)
	if len(errs) > 0 {
		return nil, fmt.Errorf("problem expanding records: %v", errs), "problem expanding records"
	}

	return routine, nil, ""
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
