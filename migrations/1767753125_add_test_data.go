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

		users, err := app.FindCollectionByNameOrId("users")
		if err != nil {
			return err
		}

		ensure := func(coll *core.Collection, id string, fields map[string]any) error {
			existing, _ := app.FindRecordById(coll, id)
			if existing != nil {
				return nil
			}

			r := core.NewRecord(coll)
			r.Set("id", id)
			for k, v := range fields {
				r.Set(k, v)
			}
			return app.Save(r)
		}

		if err := ensure(users, "m8atu5ac904rx0d", map[string]any{
			"email":    "test@test.com",
			"name":     "test",
			"password": "12345678",
		}); err != nil {
			return err
		}

		routines, _ := app.FindCollectionByNameOrId("routines")
		routineRecords := []struct {
			Id             string
			Name           string
			Description    string
			ExercisesOrder []string
			User           string
		}{
			{
				Id:             "agoxssc6gu5b6sy",
				Name:           "Routine1",
				Description:    "routine 1 for testing",
				ExercisesOrder: []string{"kxd7bpjt6utv3qs", "xxmvskd9g1olbfx"},
				User:           "m8atu5ac904rx0d",
			},
			{
				Id:             "zkwbnif3qomyuyd",
				Name:           "Routine2",
				Description:    "second test routine",
				ExercisesOrder: []string{"5x5fmx8fo79adiq"},
				User:           "m8atu5ac904rx0d",
			},
			{
				Id:          "ju66888fbla85hi",
				Name:        "Routine3",
				Description: "complex routine with dropsets",
				ExercisesOrder: []string{
					"baa27i0s22782ze",
					"trnqakxgfyp1qdc",
					"hmwqwceb56bg0iw",
					"hc1ii6oz30ey02i",
					"qn44x0nbhk1w7j1",
				},
				User: "m8atu5ac904rx0d",
			},
		}

		for _, r := range routineRecords {
			if err := ensure(routines, r.Id, map[string]any{
				"name":           r.Name,
				"description":    r.Description,
				"exercisesOrder": r.ExercisesOrder,
				"user":           r.User,
			}); err != nil {
				return err
			}
		}

		sessions, _ := app.FindCollectionByNameOrId("sessions")
		sessionRecords := []map[string]any{
			{
				"id":             "y12drmbymefk7sv",
				"name":           "Workout4",
				"user":           "m8atu5ac904rx0d",
				"userDay":        "2025-10-24",
				"exercisesOrder": []string{"rnf5rekdrg3cdv1", "76dloshevsizdrg"},
			},
			{
				"id":      "v34ogl10g2bbq7v",
				"name":    "Workout3",
				"user":    "m8atu5ac904rx0d",
				"userDay": "2025-10-23",
			},
			{
				"id":             "ty5tm38yvydssc1",
				"name":           "Workout2",
				"user":           "m8atu5ac904rx0d",
				"userDay":        "2025-10-22",
				"exercisesOrder": []string{"mj8kwiyamoryd7p", "xusbyjdyt1hdfu9"},
			},
			{
				"id":             "huofnpqx7roxybz",
				"name":           "Workout1",
				"user":           "m8atu5ac904rx0d",
				"userDay":        "2025-10-21",
				"exercisesOrder": []string{"n488qowbocakkqv", "cqw0jw1qt7pwgqk", "r3z048lsu52qo3r"},
			},
		}

		for _, s := range sessionRecords {
			id := s["id"].(string)
			delete(s, "id")
			if err := ensure(sessions, id, s); err != nil {
				return err
			}
		}

		sessionExercises, _ := app.FindCollectionByNameOrId("sessionExercises")
		sessionExerciseRecords := []map[string]any{
			{"id": "rnf5rekdrg3cdv1", "exercise": "abwheelstayhtr7", "session": "y12drmbymefk7sv"},
			{"id": "76dloshevsizdrg", "exercise": "barbellseazozsz", "session": "y12drmbymefk7sv"},
			{"id": "mj8kwiyamoryd7p", "exercise": "singlearmksowou", "session": "ty5tm38yvydssc1", "measurementNumeric": 7},
			{"id": "xusbyjdyt1hdfu9", "exercise": "singlearmksowou", "session": "ty5tm38yvydssc1", "notes": "yo"},
			{"id": "n488qowbocakkqv", "exercise": "abwheelstayhtr7", "session": "huofnpqx7roxybz", "measurementNumeric": 5, "addedWeight": 2, "perceivedEffort": 20},
			{"id": "cqw0jw1qt7pwgqk", "exercise": "abwheelstayhtr7", "session": "huofnpqx7roxybz", "measurementNumeric": 4, "perceivedEffort": 30, "restAfter": 1800, "supersetParent": "n488qowbocakkqv"},
			{"id": "r3z048lsu52qo3r", "exercise": "alternatinvxlfp", "session": "huofnpqx7roxybz", "measurementNumeric": 2, "addedWeight": 5, "perceivedEffort": 100},
		}

		for _, se := range sessionExerciseRecords {
			id := se["id"].(string)
			delete(se, "id")
			if err := ensure(sessionExercises, id, se); err != nil {
				return err
			}
		}

		routineExercises, _ := app.FindCollectionByNameOrId("routineExercises")
		routineExerciseRecords := []map[string]any{
			{"id": "kxd7bpjt6utv3qs", "exercise": "bulgarianbh2v1c", "routine": "agoxssc6gu5b6sy", "measurementNumeric": 30, "addedWeight": 50, "notes": "how"},
			{"id": "xxmvskd9g1olbfx", "exercise": "clubbellorxjgvv", "routine": "agoxssc6gu5b6sy", "measurementNumeric": 2, "addedWeight": 5, "notes": "note"},
			{"id": "5x5fmx8fo79adiq", "exercise": "cablestraidmcm0", "routine": "zkwbnif3qomyuyd", "measurementNumeric": 1, "addedWeight": 10, "notes": "hehe"},
			{"id": "trnqakxgfyp1qdc", "exercise": "plateoverhuucz6", "routine": "ju66888fbla85hi", "measurementNumeric": 60, "addedWeight": 30},
			{"id": "hmwqwceb56bg0iw", "exercise": "plateoverhuucz6", "routine": "ju66888fbla85hi", "measurementNumeric": 30, "supersetParent": "trnqakxgfyp1qdc"},
			{"id": "hc1ii6oz30ey02i", "exercise": "plateoverhuucz6", "routine": "ju66888fbla85hi", "measurementNumeric": 20, "supersetParent": "trnqakxgfyp1qdc"},
			{"id": "baa27i0s22782ze", "exercise": "ringchestfvkeps", "routine": "ju66888fbla85hi"},
			{"id": "qn44x0nbhk1w7j1", "exercise": "ringhangini74hr", "routine": "ju66888fbla85hi"},
		}

		for _, re := range routineExerciseRecords {
			id := re["id"].(string)
			delete(re, "id")
			if err := ensure(routineExercises, id, re); err != nil {
				return err
			}
		}

		return nil
	}, func(app core.App) error {
		return nil
	})
}
