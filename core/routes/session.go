package routes

import (
	"net/http"
	c "progressa/core"
	"progressa/types"
	"progressa/utils"

	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
)

func (h *RoutesHandler) importRoutineIntoSession(e *core.RequestEvent) error {
	var payload types.ImportRoutinePayload

	// parse the payload
	if err := utils.ParseJSON(e.Request, &payload); err != nil {
		return e.BadRequestError("bad payload", err)
	}

	expandedSession, err := c.ImportRoutineIntoSession(h.app, &payload)
	if err != nil {
		return e.InternalServerError("error while importing routine", err)
	}

	return e.JSON(http.StatusOK, expandedSession)
}

func (h *RoutesHandler) duplicateSessionRow(e *core.RequestEvent) error {
	var payload types.DuplicatePayload

	// parse the payload
	if err := utils.ParseJSON(e.Request, &payload); err != nil {
		return apis.NewBadRequestError("bad payload", err)
	}

	expandedSession, err := c.DuplicateSessionRow(h.app, &payload)
	if err != nil {
		return e.InternalServerError("error while duplicating session row", err)
	}

	return e.JSON(http.StatusOK, expandedSession)
}
