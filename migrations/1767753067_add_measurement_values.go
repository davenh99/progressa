package migrations

import (
	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("measurementValues")
		if err != nil {
			return err
		}

		type MeasurementValue struct {
			MeasurementType string
			Value           string
			Public          bool
		}

		measurementValues := []MeasurementValue{
			{Value: "VB-", MeasurementType: "8ldlgghjvy4ircl"},
			{Value: "VB", MeasurementType: "8ldlgghjvy4ircl"},
			{Value: "VB+", MeasurementType: "8ldlgghjvy4ircl"},
			{Value: "V0-", MeasurementType: "8ldlgghjvy4ircl"},
			{Value: "V0", MeasurementType: "8ldlgghjvy4ircl"},
			{Value: "V0+", MeasurementType: "8ldlgghjvy4ircl"},
			{Value: "V1", MeasurementType: "8ldlgghjvy4ircl"},
			{Value: "V2", MeasurementType: "8ldlgghjvy4ircl"},
			{Value: "V3", MeasurementType: "8ldlgghjvy4ircl"},
			{Value: "V4", MeasurementType: "8ldlgghjvy4ircl"},
			{Value: "V5", MeasurementType: "8ldlgghjvy4ircl"},
			{Value: "V6", MeasurementType: "8ldlgghjvy4ircl"},
			{Value: "V7", MeasurementType: "8ldlgghjvy4ircl"},
			{Value: "V8", MeasurementType: "8ldlgghjvy4ircl"},
			{Value: "V9", MeasurementType: "8ldlgghjvy4ircl"},
			{Value: "V10", MeasurementType: "8ldlgghjvy4ircl"},
			{Value: "V11", MeasurementType: "8ldlgghjvy4ircl"},
			{Value: "V12", MeasurementType: "8ldlgghjvy4ircl"},
			{Value: "V13", MeasurementType: "8ldlgghjvy4ircl"},
			{Value: "V14", MeasurementType: "8ldlgghjvy4ircl"},
			{Value: "V15", MeasurementType: "8ldlgghjvy4ircl"},
			{Value: "V16", MeasurementType: "8ldlgghjvy4ircl"},
			{Value: "V17", MeasurementType: "8ldlgghjvy4ircl"},
			{Value: "1A", MeasurementType: "8ldlgghjvy5yrcl"},
			{Value: "1A+", MeasurementType: "8ldlgghjvy5yrcl"},
			{Value: "1B", MeasurementType: "8ldlgghjvy5yrcl"},
			{Value: "1B+", MeasurementType: "8ldlgghjvy5yrcl"},
			{Value: "1C", MeasurementType: "8ldlgghjvy5yrcl"},
			{Value: "1C+", MeasurementType: "8ldlgghjvy5yrcl"},
			{Value: "2A", MeasurementType: "8ldlgghjvy5yrcl"},
			{Value: "2A+", MeasurementType: "8ldlgghjvy5yrcl"},
			{Value: "2B", MeasurementType: "8ldlgghjvy5yrcl"},
			{Value: "2B+", MeasurementType: "8ldlgghjvy5yrcl"},
			{Value: "2C", MeasurementType: "8ldlgghjvy5yrcl"},
			{Value: "2C+", MeasurementType: "8ldlgghjvy5yrcl"},
			{Value: "3A", MeasurementType: "8ldlgghjvy5yrcl"},
			{Value: "3A+", MeasurementType: "8ldlgghjvy5yrcl"},
			{Value: "3B", MeasurementType: "8ldlgghjvy5yrcl"},
			{Value: "3B+", MeasurementType: "8ldlgghjvy5yrcl"},
			{Value: "3C", MeasurementType: "8ldlgghjvy5yrcl"},
			{Value: "3C+", MeasurementType: "8ldlgghjvy5yrcl"},
			{Value: "4A", MeasurementType: "8ldlgghjvy5yrcl"},
			{Value: "4A+", MeasurementType: "8ldlgghjvy5yrcl"},
			{Value: "4B", MeasurementType: "8ldlgghjvy5yrcl"},
			{Value: "4B+", MeasurementType: "8ldlgghjvy5yrcl"},
			{Value: "4C", MeasurementType: "8ldlgghjvy5yrcl"},
			{Value: "4C+", MeasurementType: "8ldlgghjvy5yrcl"},
			{Value: "5A", MeasurementType: "8ldlgghjvy5yrcl"},
			{Value: "5A+", MeasurementType: "8ldlgghjvy5yrcl"},
			{Value: "5B", MeasurementType: "8ldlgghjvy5yrcl"},
			{Value: "5B+", MeasurementType: "8ldlgghjvy5yrcl"},
			{Value: "5C", MeasurementType: "8ldlgghjvy5yrcl"},
			{Value: "5C+", MeasurementType: "8ldlgghjvy5yrcl"},
			{Value: "6A", MeasurementType: "8ldlgghjvy5yrcl"},
			{Value: "6A+", MeasurementType: "8ldlgghjvy5yrcl"},
			{Value: "6B", MeasurementType: "8ldlgghjvy5yrcl"},
			{Value: "6B+", MeasurementType: "8ldlgghjvy5yrcl"},
			{Value: "6C", MeasurementType: "8ldlgghjvy5yrcl"},
			{Value: "6C+", MeasurementType: "8ldlgghjvy5yrcl"},
			{Value: "7A", MeasurementType: "8ldlgghjvy5yrcl"},
			{Value: "7A+", MeasurementType: "8ldlgghjvy5yrcl"},
			{Value: "7B", MeasurementType: "8ldlgghjvy5yrcl"},
			{Value: "7B+", MeasurementType: "8ldlgghjvy5yrcl"},
			{Value: "7C", MeasurementType: "8ldlgghjvy5yrcl"},
			{Value: "7C+", MeasurementType: "8ldlgghjvy5yrcl"},
			{Value: "8A", MeasurementType: "8ldlgghjvy5yrcl"},
			{Value: "8A+", MeasurementType: "8ldlgghjvy5yrcl"},
			{Value: "8B", MeasurementType: "8ldlgghjvy5yrcl"},
			{Value: "8B+", MeasurementType: "8ldlgghjvy5yrcl"},
			{Value: "8C", MeasurementType: "8ldlgghjvy5yrcl"},
			{Value: "8C+", MeasurementType: "8ldlgghjvy5yrcl"},
			{Value: "9A", MeasurementType: "8ldlgghjvy5yrcl"},
			{Value: "1", MeasurementType: "8ldlgghjvt7yrcl"},
			{Value: "2", MeasurementType: "8ldlgghjvt7yrcl"},
			{Value: "3", MeasurementType: "8ldlgghjvt7yrcl"},
			{Value: "4", MeasurementType: "8ldlgghjvt7yrcl"},
			{Value: "5", MeasurementType: "8ldlgghjvt7yrcl"},
			{Value: "6", MeasurementType: "8ldlgghjvt7yrcl"},
			{Value: "7", MeasurementType: "8ldlgghjvt7yrcl"},
			{Value: "8", MeasurementType: "8ldlgghjvt7yrcl"},
			{Value: "9", MeasurementType: "8ldlgghjvt7yrcl"},
			{Value: "10", MeasurementType: "8ldlgghjvt7yrcl"},
			{Value: "11", MeasurementType: "8ldlgghjvt7yrcl"},
			{Value: "12", MeasurementType: "8ldlgghjvt7yrcl"},
			{Value: "13", MeasurementType: "8ldlgghjvt7yrcl"},
			{Value: "14", MeasurementType: "8ldlgghjvt7yrcl"},
			{Value: "15", MeasurementType: "8ldlgghjvt7yrcl"},
			{Value: "16", MeasurementType: "8ldlgghjvt7yrcl"},
			{Value: "17", MeasurementType: "8ldlgghjvt7yrcl"},
			{Value: "18", MeasurementType: "8ldlgghjvt7yrcl"},
			{Value: "19", MeasurementType: "8ldlgghjvt7yrcl"},
			{Value: "20", MeasurementType: "8ldlgghjvt7yrcl"},
			{Value: "21", MeasurementType: "8ldlgghjvt7yrcl"},
			{Value: "22", MeasurementType: "8ldlgghjvt7yrcl"},
			{Value: "23", MeasurementType: "8ldlgghjvt7yrcl"},
			{Value: "24", MeasurementType: "8ldlgghjvt7yrcl"},
			{Value: "25", MeasurementType: "8ldlgghjvt7yrcl"},
			{Value: "26", MeasurementType: "8ldlgghjvt7yrcl"},
			{Value: "27", MeasurementType: "8ldlgghjvt7yrcl"},
			{Value: "28", MeasurementType: "8ldlgghjvt7yrcl"},
			{Value: "29", MeasurementType: "8ldlgghjvt7yrcl"},
			{Value: "30", MeasurementType: "8ldlgghjvt7yrcl"},
			{Value: "31", MeasurementType: "8ldlgghjvt7yrcl"},
			{Value: "32", MeasurementType: "8ldlgghjvt7yrcl"},
			{Value: "33", MeasurementType: "8ldlgghjvt7yrcl"},
			{Value: "34", MeasurementType: "8ldlgghjvt7yrcl"},
			{Value: "35", MeasurementType: "8ldlgghjvt7yrcl"},
			{Value: "36", MeasurementType: "8ldlgghjvt7yrcl"},
			{Value: "37", MeasurementType: "8ldlgghjvt7yrcl"},
			{Value: "38", MeasurementType: "8ldlgghjvt7yrcl"},
			{Value: "39", MeasurementType: "8ldlgghjvt7yrcl"},
			{Value: "1A", MeasurementType: "8ldlyyhjvt7yrbl"},
			{Value: "1A+", MeasurementType: "8ldlyyhjvt7yrbl"},
			{Value: "1B", MeasurementType: "8ldlyyhjvt7yrbl"},
			{Value: "1B+", MeasurementType: "8ldlyyhjvt7yrbl"},
			{Value: "1C", MeasurementType: "8ldlyyhjvt7yrbl"},
			{Value: "1C+", MeasurementType: "8ldlyyhjvt7yrbl"},
			{Value: "2A", MeasurementType: "8ldlyyhjvt7yrbl"},
			{Value: "2A+", MeasurementType: "8ldlyyhjvt7yrbl"},
			{Value: "2B", MeasurementType: "8ldlyyhjvt7yrbl"},
			{Value: "2B+", MeasurementType: "8ldlyyhjvt7yrbl"},
			{Value: "2C", MeasurementType: "8ldlyyhjvt7yrbl"},
			{Value: "2C+", MeasurementType: "8ldlyyhjvt7yrbl"},
			{Value: "3A", MeasurementType: "8ldlyyhjvt7yrbl"},
			{Value: "3A+", MeasurementType: "8ldlyyhjvt7yrbl"},
			{Value: "3B", MeasurementType: "8ldlyyhjvt7yrbl"},
			{Value: "3B+", MeasurementType: "8ldlyyhjvt7yrbl"},
			{Value: "3C", MeasurementType: "8ldlyyhjvt7yrbl"},
			{Value: "3C+", MeasurementType: "8ldlyyhjvt7yrbl"},
			{Value: "4A", MeasurementType: "8ldlyyhjvt7yrbl"},
			{Value: "4A+", MeasurementType: "8ldlyyhjvt7yrbl"},
			{Value: "4B", MeasurementType: "8ldlyyhjvt7yrbl"},
			{Value: "4B+", MeasurementType: "8ldlyyhjvt7yrbl"},
			{Value: "4C", MeasurementType: "8ldlyyhjvt7yrbl"},
			{Value: "4C+", MeasurementType: "8ldlyyhjvt7yrbl"},
			{Value: "5A", MeasurementType: "8ldlyyhjvt7yrbl"},
			{Value: "5A+", MeasurementType: "8ldlyyhjvt7yrbl"},
			{Value: "5B", MeasurementType: "8ldlyyhjvt7yrbl"},
			{Value: "5B+", MeasurementType: "8ldlyyhjvt7yrbl"},
			{Value: "5C", MeasurementType: "8ldlyyhjvt7yrbl"},
			{Value: "5C+", MeasurementType: "8ldlyyhjvt7yrbl"},
			{Value: "6A", MeasurementType: "8ldlyyhjvt7yrbl"},
			{Value: "6A+", MeasurementType: "8ldlyyhjvt7yrbl"},
			{Value: "6B", MeasurementType: "8ldlyyhjvt7yrbl"},
			{Value: "6B+", MeasurementType: "8ldlyyhjvt7yrbl"},
			{Value: "6C", MeasurementType: "8ldlyyhjvt7yrbl"},
			{Value: "6C+", MeasurementType: "8ldlyyhjvt7yrbl"},
			{Value: "7A", MeasurementType: "8ldlyyhjvt7yrbl"},
			{Value: "7A+", MeasurementType: "8ldlyyhjvt7yrbl"},
			{Value: "7B", MeasurementType: "8ldlyyhjvt7yrbl"},
			{Value: "7B+", MeasurementType: "8ldlyyhjvt7yrbl"},
			{Value: "7C", MeasurementType: "8ldlyyhjvt7yrbl"},
			{Value: "7C+", MeasurementType: "8ldlyyhjvt7yrbl"},
			{Value: "8A", MeasurementType: "8ldlyyhjvt7yrbl"},
			{Value: "8A+", MeasurementType: "8ldlyyhjvt7yrbl"},
			{Value: "8B", MeasurementType: "8ldlyyhjvt7yrbl"},
			{Value: "8B+", MeasurementType: "8ldlyyhjvt7yrbl"},
			{Value: "8C", MeasurementType: "8ldlyyhjvt7yrbl"},
			{Value: "8C+", MeasurementType: "8ldlyyhjvt7yrbl"},
			{Value: "9A", MeasurementType: "8ldlyyhjvt7yrbl"},
			{Value: "9A+", MeasurementType: "8ldlyyhjvt7yrbl"},
			{Value: "9B", MeasurementType: "8ldlyyhjvt7yrbl"},
			{Value: "9B+", MeasurementType: "8ldlyyhjvt7yrbl"},
			{Value: "9C", MeasurementType: "8ldlyyhjvt7yrbl"},
		}

		for _, m := range measurementValues {
			existing, _ := app.FindFirstRecordByFilter(
				collection.Id,
				"measurementType = {:mType} && value = {:val}", dbx.Params{"mType": m.MeasurementType, "val": m.Value},
			)
			if existing != nil {
				continue
			}

			record := core.NewRecord(collection)
			record.Set("measurementType", m.MeasurementType)
			record.Set("value", m.Value)
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
