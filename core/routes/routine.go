package routes

import (
	"net/http"
	c "progressa/core"
	"progressa/types"
	"progressa/utils"

	"github.com/pocketbase/pocketbase/core"
)

func (h *RoutesHandler) importRoutineIntoRoutine(e *core.RequestEvent) error {
	var payload types.ImportRoutinePayload

	// parse the payload
	if err := utils.ParseJSON(e.Request, &payload); err != nil {
		return e.BadRequestError("bad payload", err)
	}

	expandedRoutine, err := c.ImportRoutineIntoRoutine(h.app, &payload)
	if err != nil {
		return e.InternalServerError("", err)
	}

	return e.JSON(http.StatusOK, expandedRoutine)
}

func (h *RoutesHandler) duplicateRoutineRow(e *core.RequestEvent) error {
	var payload types.DuplicatePayload

	// parse the payload
	if err := utils.ParseJSON(e.Request, &payload); err != nil {
		return e.BadRequestError("bad payload", err)
	}

	expandedRoutine, err := c.DuplicateRoutineRow(h.app, &payload)
	if err != nil {
		return e.InternalServerError("", err)
	}

	return e.JSON(http.StatusOK, expandedRoutine)
}
