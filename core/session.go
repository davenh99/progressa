package core

import (
	"progressa/types"

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

	// map ids to inds for easier lookup later
	routineExercisesIdInds := map[string]int{}
	for i, re := range routineExercises {
		routineExercisesIdInds[re.Id] = i
	}

	newRecords := []*core.Record{}

	sessionExercisesCollection, err := app.FindCollectionByNameOrId("sessionExercises")
	if err != nil {
		return nil, err
	}

	for _, re := range routineExercises {
		record := core.NewRecord(sessionExercisesCollection)

		copyRoutineExerciseToSessionExercise(record, re, payload.SessionOrRoutineId, userId)

		newRecords = append(newRecords, record)
	}

	// fill in the superset parents afterwards
	for ind, re := range routineExercises {
		if re.Get("supersetParent") != nil {
			supersetParent := newRecords[routineExercisesIdInds[re.Get("supersetParent").(string)]].Get("id")
			newRecords[ind].Set("supersetParent", supersetParent)
		}
	}

	err = app.RunInTransaction(func(txApp core.App) error {
		for _, record := range newRecords {
			if err := txApp.Save(record); err != nil {
				return err
			}
		}

		// collect new exercise IDs
		newIds := make([]string, len(newRecords))
		for i, rec := range newRecords {
			newIds[i] = rec.Id
		}

		if err := updateSessionExercisesOrder(txApp, payload.SessionOrRoutineId, payload.InsertIndex, newIds); err != nil {
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

	app.ExpandRecord(session, SESSION_EXPANDS, nil)

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

		for _, childRecord := range childSessionExercises {
			newChildRecord := core.NewRecord(collection)
			duplicateSessionExercise(newChildRecord, childRecord, &newParentRecord.Id, userId)

			if err := txApp.Save(newChildRecord); err != nil {
				return err
			}
		}

		// collect new IDs (parent + children)
		newIds := []string{newParentRecord.Id}
		for _, childRecord := range childSessionExercises {
			newIds = append(newIds, childRecord.Id)
		}

		if err := updateSessionExercisesOrder(txApp, parentSessionExercise.GetString("session"), payload.RowIndex, newIds); err != nil {
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

	app.ExpandRecord(session, SESSION_EXPANDS, nil)

	return session, nil
}

func updateSessionExercisesOrder(app core.App, sessionId string, insertIndex int, newIds []string) error {
	sessionRecord, err := app.FindRecordById("sessions", sessionId)
	if err != nil {
		return err
	}

	// Parse existing exercisesOrder
	var exercisesOrder []string
	if raw := sessionRecord.Get("exercisesOrder"); raw != nil {
		switch v := raw.(type) {
		case []any:
			for _, id := range v {
				if s, ok := id.(string); ok {
					exercisesOrder = append(exercisesOrder, s)
				}
			}
		case []string:
			exercisesOrder = v
		}
	}

	// Clamp index
	if insertIndex < 0 {
		insertIndex = 0
	} else if insertIndex > len(exercisesOrder) {
		insertIndex = len(exercisesOrder)
	}

	// Insert new IDs
	updatedOrder := make([]string, 0, len(exercisesOrder)+len(newIds))
	updatedOrder = append(updatedOrder, exercisesOrder[:insertIndex]...)
	updatedOrder = append(updatedOrder, newIds...)
	updatedOrder = append(updatedOrder, exercisesOrder[insertIndex:]...)

	// Save back
	sessionRecord.Set("exercisesOrder", updatedOrder)
	return app.Save(sessionRecord)
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
