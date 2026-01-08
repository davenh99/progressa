package migrations

import (
	"strings"

	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("equipments")
		if err != nil {
			return err
		}

		type EquipmentData struct {
			Id   string
			Name string
		}

		equipments := []EquipmentData{
			{Id: "MinibandISTWZry", Name: "Miniband"},
			{Id: "CablexDeUs6ZQme", Name: "Cable"},
			{Id: "TireaYfbemQcETj", Name: "Tire"},
			{Id: "LandmineqJmIul2", Name: "Landmine"},
			{Id: "BenchDecl3jWlkq", Name: "Bench (Decline)"},
			{Id: "SledgeHammpViFS", Name: "Sledge Hammer"},
			{Id: "ClubbellTvy41I5", Name: "Clubbell"},
			{Id: "SlidersOjbV9A6t", Name: "Sliders"},
			{Id: "Dumbbell3tBAsD9", Name: "Dumbbell"},
			{Id: "KettlebellBKvl5", Name: "Kettlebell"},
			{Id: "BenchFlatrn6lbH", Name: "Bench (Flat)"},
			{Id: "EZBarfetsNMEbxA", Name: "EZ Bar"},
			{Id: "Barbell4RWrt1Tp", Name: "Barbell"},
			{Id: "HeavySandb5VsZG", Name: "Heavy Sandbag"},
			{Id: "StabilityBcelKc", Name: "Stability Ball"},
			{Id: "BattleRopePGudg", Name: "Battle Ropes"},
			{Id: "SlamBallbG1EJfn", Name: "Slam Ball"},
			{Id: "WeightPlat6PWLV", Name: "Weight Plate"},
			{Id: "BulgarianBj03vt", Name: "Bulgarian Bag"},
			{Id: "BenchIncl8j7Ov6", Name: "Bench (Incline)"},
			{Id: "SuperbandyYXYIC", Name: "Superband"},
			{Id: "ClimbingRoTtMes", Name: "Climbing Rope"},
			{Id: "GymnasticRtEUVh", Name: "Gymnastic Rings"},
			{Id: "SledZYVtxL1PTRW", Name: "Sled"},
			{Id: "SandbagpyNTPcmJ", Name: "Sandbag"},
			{Id: "MacebellCCGmtic", Name: "Macebell"},
			{Id: "MedicineBatgNDz", Name: "Medicine Ball"},
			{Id: "ParalletteznBGL", Name: "Parallette Bars"},
			{Id: "GravityBooPtVxH", Name: "Gravity Boots"},
			{Id: "SlantBoardl80qz", Name: "Slant Board"},
			{Id: "WallBallB154uR0", Name: "Wall Ball"},
			{Id: "Bodyweight4X8q1", Name: "Bodyweight"},
			{Id: "ResistanceKxIYh", Name: "Resistance Band"},
			{Id: "TrapBarPZs75BEZ", Name: "Trap Bar"},
			{Id: "SuspensionTZGey", Name: "Suspension Trainer"},
			{Id: "IndianClubl8UDT", Name: "Indian Club"},
			{Id: "PlyoBoxCAUbiF0Z", Name: "Plyo Box"},
			{Id: "AbWheelc3Hl7cHw", Name: "Ab Wheel"},
			{Id: "PullUpBarGRiPxY", Name: "Pull Up Bar"},
		}

		for _, e := range equipments {
			eId := strings.ToLower(e.Id)
			existing, _ := app.FindRecordById(collection.Id, eId)
			if existing != nil {
				continue // already exists
			}

			record := core.NewRecord(collection)
			record.Set("id", eId)
			record.Set("name", e.Name)

			if err := app.Save(record); err != nil {
				return err
			}
		}

		return nil
	}, func(app core.App) error {
		return nil
	})
}
