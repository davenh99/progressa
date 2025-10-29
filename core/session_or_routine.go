package core

import (
	"encoding/json"
	"fmt"
	"slices"

	"github.com/pocketbase/pocketbase/core"
)

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

// from colleciton and from record id are where we are fetching exercises order from, if duplicating row,
// it should be the current row, if importing a routine, it should be the src record.
func sortNewIds(app core.App, fromCollection string, oldToNewIdsMap map[string]string, newIds []string, fromRecordId string) ([]string, error) {
	// must sort the newIDs by the position of the old ones from 'exercisesOrder'
	importRoutine, err := app.FindRecordById(fromCollection, fromRecordId)
	if err != nil {
		return []string{}, err
	}

	// get the old exercisesOrder
	var exercisesOrder []string
	raw := importRoutine.GetString("exercisesOrder")
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
		app.Logger().Error("not all old ids were found in exercisesOrder when importing routine")
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
