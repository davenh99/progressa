package core

import (
	"cmp"
	"fmt"
	"progressa/types"
	"slices"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
)

var SESSION_EXPANDS = []string{
	"tags",
	"sessionExercises_via_session.exercise.defaultMeasurementType.measurementValues_via_measurementType",
	"sessionExercises_via_session.exercise.defaultMeasurementType2.measurementValues_via_measurementType",
	"sessionExercises_via_session.exercise.defaultMeasurementType3.measurementValues_via_measurementType",
	"sessionExercises_via_session.measurementValue",
	"sessionExercises_via_session.measurement2Value",
	"sessionExercises_via_session.measurement3Value",
	"sessionExercises_via_session.variation",
	"sessionExercises_via_session.tags",
	"sessionMeals_via_session.tags",
}

func ImportRoutineIntoSession(app core.App, payload *types.ImportRoutinePayload, userId string) (*core.Record, error) {
	routineExercises, err := app.FindRecordsByFilter(
		"routineExercises",
		"routine = {:routineId}",
		"",
		9999,
		0,
		dbx.Params{"routineId": payload.ImportRoutineId},
	)
	if err != nil {
		return nil, err
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

	sessionExercisesCollection, err := app.FindCollectionByNameOrId("sessionExercises")
	if err != nil {
		return nil, err
	}

	newRecords := []*core.Record{}
	for _, re := range routineExercises {
		record := core.NewRecord(sessionExercisesCollection)

		copyRoutineExerciseToSessionExercise(record, re, payload.SessionOrRoutineId, userId)

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

		if err := updateSessionOrRoutineExercisesOrder(txApp, "sessions", payload.SessionOrRoutineId, payload.InsertIndex, sortedNewIds); err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		return nil, err
	}

	session, err := app.FindRecordById("sessions", payload.SessionOrRoutineId)
	if err != nil {
		return nil, err
	}

	errs := app.ExpandRecord(session, SESSION_EXPANDS, nil)
	if len(errs) > 0 {
		return nil, fmt.Errorf("problem expanding records: %v", errs)
	}

	return session, nil
}

func DuplicateSessionRow(app core.App, payload *types.DuplicatePayload, userId string) (*core.Record, error) {
	parentSessionExercise, err := app.FindRecordById("sessionExercises", payload.ExerciseRowId)
	if err != nil {
		return nil, err
	}
	childSessionExercises, err := app.FindRecordsByFilter(
		"sessionExercises",
		"supersetParent = {:recordId}",
		"",
		9999,
		0,
		dbx.Params{"recordId": payload.ExerciseRowId},
	)
	if err != nil {
		return nil, err
	}

	err = app.RunInTransaction(func(txApp core.App) error {
		collection, err := app.FindCollectionByNameOrId("sessionExercises")
		if err != nil {
			return err
		}

		newParentRecord := core.NewRecord(collection)
		duplicateSessionExercise(newParentRecord, parentSessionExercise, nil, userId)

		if err := txApp.Save(newParentRecord); err != nil {
			return err
		}

		// map new ids to old ids for later
		oldToNewIdsMap := map[string]string{}
		oldToNewIdsMap[parentSessionExercise.Id] = newParentRecord.Id

		// collect new IDs (parent + children)
		newIds := []string{newParentRecord.Id}

		for _, childRecord := range childSessionExercises {
			newChildRecord := core.NewRecord(collection)
			duplicateRoutineExercise(newChildRecord, childRecord, &newParentRecord.Id)

			if err := txApp.Save(newChildRecord); err != nil {
				return err
			}

			oldToNewIdsMap[childRecord.Id] = newChildRecord.Id
			newIds = append(newIds, newChildRecord.Id)
		}

		sortedNewIds, err := sortNewIds(app, "routines", oldToNewIdsMap, newIds, parentSessionExercise.GetString("session"))
		if err != nil {
			return err
		}

		if err := updateSessionOrRoutineExercisesOrder(txApp, "sessions", parentSessionExercise.GetString("session"), payload.RowIndex, sortedNewIds); err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		return nil, err
	}

	session, err := app.FindRecordById("sessions", parentSessionExercise.GetString("session"))
	if err != nil {
		return nil, err
	}

	errs := app.ExpandRecord(session, SESSION_EXPANDS, nil)
	if len(errs) > 0 {
		return nil, fmt.Errorf("problem expanding records: %v", errs)
	}

	return session, nil
}

func copyRoutineExerciseToSessionExercise(dst *core.Record, src *core.Record, sessionId string, userId string) {
	dst.Set("exercise", src.Get("exercise"))
	dst.Set("user", userId)
	dst.Set("session", sessionId)
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
	dst.Set("perceivedEffort", src.Get("perceivedEffort"))
}

func duplicateSessionExercise(dst *core.Record, src *core.Record, parentId *string, userId string) {
	dst.Set("user", userId)
	dst.Set("exercise", src.Get("exercise"))
	dst.Set("session", src.Get("session"))
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
	dst.Set("perceivedEffort", src.Get("perceivedEffort"))
	if parentId != nil {
		dst.Set("supersetParent", *parentId)
	}
}
