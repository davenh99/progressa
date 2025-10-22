package routes

import (
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
)

type RoutesHandler struct {
	app core.App
}

func NewHandler(app core.App) *RoutesHandler {
	return &RoutesHandler{app}
}

func (h *RoutesHandler) RegisterRoutes(se *core.ServeEvent) {
	se.Router.POST("/session/importRoutine", h.importRoutineIntoSession).Bind(apis.RequireAuth())
	se.Router.POST("/session/duplicateRow", h.duplicateSessionRow).Bind(apis.RequireAuth())
	se.Router.POST("/routine/importRoutine", h.importRoutineIntoRoutine).Bind(apis.RequireAuth())
	se.Router.POST("/routine/duplicateRow", h.duplicateRoutineRow).Bind(apis.RequireAuth())
}
