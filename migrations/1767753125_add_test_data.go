package migrations

import (
	"progressa/utils"

	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		if utils.Env.Env != "development" {
			return nil // only add test data in development environment
		}

		return nil
	}, func(app core.App) error {
		return nil
	})
}
