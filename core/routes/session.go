package routes

import (
	"fmt"
	"net/http"
	c "progressa/core"
	"progressa/types"
	"progressa/utils"

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
	"sessionExercises_via_session.tags",
	"sessionMeals_via_session.tags",
}

func (h *RoutesHandler) importRoutineIntoSession(e *core.RequestEvent) error {
	var payload types.ImportRoutinePayload

	// parse the payload
	if err := utils.ParseJSON(e.Request, &payload); err != nil {
		return e.BadRequestError("bad payload", err)
	}

	// import the routine
	err, msg := c.ImportRoutine(h.app, &payload, types.SESSION, importRoutineCopyFields)
	if err != nil {
		return e.InternalServerError(msg, err)
	}

	// fetch the now updated session
	session, err := h.app.FindRecordById("sessions", payload.SessionOrRoutineId)
	if err != nil {
		return e.InternalServerError("couldn't find new session", err)
	}

	// expand
	errs := h.app.ExpandRecord(session, SESSION_EXPANDS, nil)
	if len(errs) > 0 {
		return e.InternalServerError("problem expanding records", fmt.Errorf("problem expanding records: %v", errs))
	}

	return e.JSON(http.StatusOK, session)
}

func (h *RoutesHandler) duplicateSessionRow(e *core.RequestEvent) error {
	var payload types.DuplicatePayload

	// parse the payload
	if err := utils.ParseJSON(e.Request, &payload); err != nil {
		return e.BadRequestError("bad payload", err)
	}

	parentSessionExercise, err := h.app.FindRecordById("sessionExercises", payload.ExerciseRowId)
	if err != nil {
		return e.InternalServerError("could not find sessionExercises collection", err)
	}

	err, msg := c.DuplicateExerciseRow(h.app, &payload, types.SESSION)
	if err != nil {
		return e.InternalServerError(msg, err)
	}

	session, err := h.app.FindRecordById("sessions", parentSessionExercise.GetString("session"))
	if err != nil {
		return e.InternalServerError("couldn't find new session", err)
	}

	errs := h.app.ExpandRecord(session, SESSION_EXPANDS, nil)
	if len(errs) > 0 {
		return e.InternalServerError("problem expanding records", fmt.Errorf("problem expanding records: %v", errs))
	}

	return e.JSON(http.StatusOK, session)
}
