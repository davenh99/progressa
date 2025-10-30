package core

import (
	"cmp"
	"encoding/json"
	"fmt"
	"progressa/types"
	"slices"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
)

type Config struct {
	MainCollection         string
	ExerciseRowCollection  string
	ExerciseRowParentField string
}

var configs = map[types.CollectionType]Config{
	"session": {
		MainCollection:         "sessions",
		ExerciseRowCollection:  "sessionExercises",
		ExerciseRowParentField: "session",
	},
	"routine": {
		MainCollection:         "routines",
		ExerciseRowCollection:  "routineExercises",
		ExerciseRowParentField: "routine",
	},
}

func ImportRoutine(
	app core.App,
	payload *types.ImportRoutinePayload,
	collectionType types.CollectionType,
	copyFields []string,
) (error, string) {
	routineExercises, err := app.FindRecordsByFilter(
		"routineExercises",
		"routine = {:routineId}",
		"",
		9999,
		0,
		dbx.Params{"routineId": payload.ImportRoutineId},
	)
	if err != nil {
		return err, "couldn't find matching routine"
	}

	cfg := configs[collectionType]

	collection, err := app.FindCollectionByNameOrId(cfg.ExerciseRowCollection)
	if err != nil {
		return err, "couldn't find exercise row collection"
	}

	// sort so parents always come before children, so their ids exist when we want to link them to children.
	slices.SortFunc(routineExercises, func(a *core.Record, b *core.Record) int {
		return cmp.Compare(len(a.GetString("supersetParent")), len(b.GetString("supersetParent")))
	})

	// map new ids to old ids for later
	oldToNewIdsMap := map[string]string{}

	err = app.RunInTransaction(func(txApp core.App) error {
		// to collect new IDs
		newIds := []string{}

		for _, re := range routineExercises {
			record := core.NewRecord(collection)
			for _, f := range copyFields {
				record.Set(f, re.Get(f))
			}

			record.Set(cfg.ExerciseRowParentField, payload.SessionOrRoutineId)

			if re.Get("supersetParent") != nil {
				// get the new id, it will exist by now
				newSupersetParent := oldToNewIdsMap[re.GetString("supersetParent")]
				record.Set("supersetParent", newSupersetParent)
			}

			if err := txApp.Save(record); err != nil {
				return err
			}

			newIds = append(newIds, record.Id)

			// routineExercises is in same order as newRecords
			oldToNewIdsMap[re.Id] = record.Id
		}

		sortedNewIds, err := sortNewIds(txApp, "routines", oldToNewIdsMap, newIds, payload.ImportRoutineId)
		if err != nil {
			return err
		}

		if err := updateSessionOrRoutineExercisesOrder(txApp, cfg.MainCollection, payload.SessionOrRoutineId, payload.InsertIndex, sortedNewIds); err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		return err, fmt.Sprintf("problem saving new records: %v", err)
	}

	return nil, ""
}

func DuplicateExerciseRow(app core.App, payload *types.DuplicatePayload, collectionType types.CollectionType) (error, string) {
	cfg := configs[collectionType]

	parentExercise, err := app.FindRecordById(cfg.ExerciseRowCollection, payload.ExerciseRowId)
	if err != nil {
		return err, "couldn't find parentExercise"
	}
	childExercises, err := app.FindRecordsByFilter(
		cfg.ExerciseRowCollection,
		"supersetParent = {:recordId}",
		"",
		9999,
		0,
		dbx.Params{"recordId": payload.ExerciseRowId},
	)
	if err != nil {
		return err, "problem finding child records"
	}

	insertIndex := payload.RowIndex + len(childExercises)

	err = app.RunInTransaction(func(txApp core.App) error {
		collection, err := app.FindCollectionByNameOrId(cfg.ExerciseRowCollection)
		if err != nil {
			return err
		}

		newParentRecord := core.NewRecord(collection)
		duplicateExercise(newParentRecord, parentExercise, nil)

		if err := txApp.Save(newParentRecord); err != nil {
			return err
		}

		// map new ids to old ids for later
		oldToNewIdsMap := map[string]string{}
		oldToNewIdsMap[parentExercise.Id] = newParentRecord.Id

		// collect new IDs (parent + children)
		newIds := []string{newParentRecord.Id}

		for _, childRecord := range childExercises {
			newChildRecord := core.NewRecord(collection)
			duplicateExercise(newChildRecord, childRecord, &newParentRecord.Id)

			if err := txApp.Save(newChildRecord); err != nil {
				return err
			}

			oldToNewIdsMap[childRecord.Id] = newChildRecord.Id
			newIds = append(newIds, newChildRecord.Id)
		}

		parentId := parentExercise.GetString(cfg.ExerciseRowParentField)

		sortedNewIds, err := sortNewIds(txApp, cfg.MainCollection, oldToNewIdsMap, newIds, parentId)
		if err != nil {
			return err
		}

		if err := updateSessionOrRoutineExercisesOrder(txApp, cfg.MainCollection, parentId, insertIndex+1, sortedNewIds); err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		return err, fmt.Sprintf("problem copying records: %v", err)
	}

	return nil, ""
}

func updateSessionOrRoutineExercisesOrder(app core.App, collectionName string, routineId string, insertIndex int, newIds []string) error {
	routineRecord, err := app.FindRecordById(collectionName, routineId)
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
	updatedOrder = append(updatedOrder, exercisesOrder[:insertIndex]...)
	updatedOrder = append(updatedOrder, newIds...)
	updatedOrder = append(updatedOrder, exercisesOrder[insertIndex:]...)

	// Save back
	routineRecord.Set("exercisesOrder", updatedOrder)
	return app.Save(routineRecord)
}

// from collection and from record id are where we are fetching exercises order from, if duplicating row,
// it should be the current session or routine, if importing a routine, it should be the src routine.
func sortNewIds(app core.App, fromCollection string, oldToNewIdsMap map[string]string, newIds []string, fromRecordId string) ([]string, error) {
	// must sort the newIDs by the position of the old ones from 'exercisesOrder'
	originalRecord, err := app.FindRecordById(fromCollection, fromRecordId)
	if err != nil {
		return []string{}, err
	}

	// get the old exercisesOrder
	var exercisesOrder []string
	raw := originalRecord.GetString("exercisesOrder")
	if err := json.Unmarshal([]byte(raw), &exercisesOrder); err != nil {
		app.Logger().Error("couldn't unmarshal exercisesOrder string")
		return []string{}, err
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
		app.Logger().Error("some ids missing in exercisesOrder mapping")
		return []string{}, fmt.Errorf("some ids missing in exercisesOrder mapping: %v", newIds)
	}

	// drop the new Ids in where they belong
	sortedNewIds := make([]string, len(newIds))
	for _, id := range newIds {
		position := newIdPositions[id]
		sortedNewIds[position-minInd] = id
	}

	return sortedNewIds, nil
}

func duplicateExercise(dst *core.Record, src *core.Record, parentId *string) {
	dst.Set("exercise", src.Get("exercise"))
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

	if src.Get("routine") != nil {
		dst.Set("routine", src.Get("routine"))
	} else if src.Get("session") != nil {
		dst.Set("session", src.Get("session"))
	}
	if parentId != nil {
		dst.Set("supersetParent", *parentId)
	}
}
