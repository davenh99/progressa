package routes

import (
	"fmt"
	"net/http"
	c "progressa/core"
	"progressa/types"
	"progressa/utils"

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

var importRoutineCopyFields = []string{
	"exercise",
	"variation",
	"notes",
	"tags",
	"addedWeight",
	"restAfter",
	"isWarmup",
	"measurementNumeric",
	"measurement2Numeric",
	"measurement3Numeric",
	"measurementValue",
	"measurement2Value",
	"measurement3Value",
}

func (h *RoutesHandler) importRoutineIntoRoutine(e *core.RequestEvent) error {
	var payload types.ImportRoutinePayload

	// parse the payload
	if err := utils.ParseJSON(e.Request, &payload); err != nil {
		return e.BadRequestError("bad payload", err)
	}

	// import the routine
	err, msg := c.ImportRoutine(h.app, &payload, types.ROUTINE, importRoutineCopyFields)
	if err != nil {
		return e.InternalServerError(msg, err)
	}

	// fetch the now updated routine
	routine, err := h.app.FindRecordById("routines", payload.SessionOrRoutineId)
	if err != nil {
		return e.InternalServerError("couldn't find new routine", err)
	}

	// expand
	errs := h.app.ExpandRecord(routine, ROUTINE_EXPANDS, nil)
	if len(errs) > 0 {
		return e.InternalServerError("problem expanding records", fmt.Errorf("problem expanding records: %v", errs))
	}

	return e.JSON(http.StatusOK, routine)
}

func (h *RoutesHandler) duplicateRoutineRow(e *core.RequestEvent) error {
	var payload types.DuplicatePayload

	// parse the payload
	if err := utils.ParseJSON(e.Request, &payload); err != nil {
		return e.BadRequestError("bad payload", err)
	}

	parentRoutineExercise, err := h.app.FindRecordById("routineExercises", payload.ExerciseRowId)
	if err != nil {
		return e.InternalServerError("couldn't find parentRoutineExercise", err)
	}

	// duplicate the row
	err, msg := c.DuplicateExerciseRow(h.app, &payload, types.ROUTINE)
	if err != nil {
		return e.InternalServerError(msg, err)
	}

	// fetch the now updated routine
	routine, err := h.app.FindRecordById("routines", parentRoutineExercise.GetString("routine"))
	if err != nil {
		return e.InternalServerError("couldn't find new record", err)
	}

	// expand
	errs := h.app.ExpandRecord(routine, ROUTINE_EXPANDS, nil)
	if len(errs) > 0 {
		return e.InternalServerError("problem expanding records", fmt.Errorf("problem expanding records: %v", errs))
	}

	return e.JSON(http.StatusOK, routine)
}
