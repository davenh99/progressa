package migrations

import (
	"progressa/utils"

	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		if utils.Env.SuperuserName == "" || utils.Env.SuperuserPassword == "" {
			return nil // skip if no superuser credentials provided
		}

		superusers, err := app.FindCollectionByNameOrId(core.CollectionNameSuperusers)
		if err != nil {
			return err
		}

		// check if superuser already exists
		existingRecord, _ := app.FindAuthRecordByEmail(core.CollectionNameSuperusers, utils.Env.SuperuserName)
		if existingRecord != nil {
			return nil // superuser already exists
		}

		record := core.NewRecord(superusers)

		record.Set("email", utils.Env.SuperuserName)
		record.Set("password", utils.Env.SuperuserPassword)

		return app.Save(record)
	}, func(app core.App) error {
		record, _ := app.FindAuthRecordByEmail(core.CollectionNameSuperusers, utils.Env.SuperuserName)
		if record == nil {
			return nil // probably already deleted
		}

		return app.Delete(record)
	})
}
