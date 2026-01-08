package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("measurementTypes")
		if err != nil {
			return err
		}

		type MeasurementType struct {
			ID          string
			System      bool
			DisplayName string
			Name        string
			Numeric     bool
			Public      bool
		}

		measurementTypes := []MeasurementType{
			{ID: "m01s8yx7wfk2gxd", Name: "Reps", DisplayName: "reps", Numeric: true},
			{ID: "8ldlgtjjvy3ircl", Name: "Time", DisplayName: "time", Numeric: true},
			{ID: "8ldlgghjvy4ircl", Name: "Boulder grade (hueco)", DisplayName: "grade", Numeric: false},
			{ID: "8ldlgghjvy5yrcl", Name: "Boulder grade (font)", DisplayName: "grade", Numeric: false},
			{ID: "8ldlgghjvt7yrcl", Name: "Route grade (ewbanks)", DisplayName: "grade", Numeric: false},
			{ID: "8ldlyyhjvt7yrbl", Name: "Route grade (french)", DisplayName: "grade", Numeric: false},
			{ID: "distancem000000", Name: "distance (m)", DisplayName: "distance (m)", Numeric: true},
			{ID: "distancekm00000", Name: "distance (km)", DisplayName: "distance (km)", Numeric: true},
			{ID: "egdesizemm00000", Name: "edge size (mm)", DisplayName: "edge (mm)", Numeric: true},
		}

		for _, m := range measurementTypes {
			existing, _ := app.FindRecordById(collection.Id, m.ID)
			if existing != nil {
				continue // already exists
			}

			record := core.NewRecord(collection)
			record.Set("id", m.ID)
			record.Set("system", true)
			record.Set("displayName", m.DisplayName)
			record.Set("name", m.Name)
			record.Set("numeric", m.Numeric)
			record.Set("public", true)

			if err := app.Save(record); err != nil {
				return err
			}
		}

		return nil
	}, func(app core.App) error {
		return nil
	})
}
