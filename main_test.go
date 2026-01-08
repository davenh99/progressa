package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"progressa/core/routes"
	"strings"
	"testing"

	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tests"
	"github.com/stretchr/testify/assert"
)

const testDataDir = "./dist/pb_data"

type MockSessionOrRoutineExercise struct {
	Id                 string  `json:"id"`
	Exercise           string  `json:"exercise"`
	SupersetParent     string  `json:"supersetParent"`
	Notes              string  `json:"notes"`
	MeasurementNumeric float64 `json:"measurementNumeric"`
	ParendInd          int
}

type MockSessionExpand struct {
	SessionExercises_via_session []MockSessionOrRoutineExercise `json:"sessionExercises_via_session"`
}

type MockRoutineExpand struct {
	RoutineExercises_via_routine []MockSessionOrRoutineExercise `json:"routineExercises_via_routine"`
}

type MockSessionResponse struct {
	ExercisesOrder []string          `json:"exercisesOrder"`
	Expand         MockSessionExpand `json:"expand"`
}

type MockRoutineResponse struct {
	ExercisesOrder []string          `json:"exercisesOrder"`
	Expand         MockRoutineExpand `json:"expand"`
}

func generateToken(collectionNameOrId string, email string) (string, error) {
	app, err := tests.NewTestApp(testDataDir)
	if err != nil {
		return "", err // t.Log(string(b))
	}
	defer app.Cleanup()

	record, err := app.FindAuthRecordByEmail(collectionNameOrId, email)
	if err != nil {
		return "", err
	}

	return record.NewAuthToken()
}

// set up the test ApiScenario app instance
func setupTestApp(t testing.TB) *tests.TestApp {
	testApp, err := tests.NewTestApp(testDataDir)
	if err != nil {
		t.Fatal(err)
	}
	// no need to cleanup since scenario.Test() will do that for us
	// defer testApp.Cleanup()
	testApp.OnServe().BindFunc(func(e *core.ServeEvent) error {
		handler := routes.NewHandler(testApp)
		handler.RegisterRoutes(e)

		return e.Next()
	})

	return testApp
}

func createTestDuplicateRowBody(recordId string, rowIndex int) io.Reader {
	body := map[string]any{}

	body["exerciseRowId"] = recordId
	body["rowIndex"] = rowIndex

	jsonBytes, err := json.Marshal(body)
	if err != nil {
		return strings.NewReader("")
	}
	jsonString := string(jsonBytes)

	return strings.NewReader(jsonString)
}

func createTestImportRoutineBody(importRoutineId string, insertRecordId string, insertIndex int) io.Reader {
	body := map[string]any{}

	body["importRoutineId"] = importRoutineId
	body["sessionOrRoutineId"] = insertRecordId
	body["insertIndex"] = insertIndex

	jsonBytes, err := json.Marshal(body)
	if err != nil {
		return strings.NewReader("")
	}
	jsonString := string(jsonBytes)

	return strings.NewReader(jsonString)
}

func verfiySessionResponse(t testing.TB, res *http.Response, expected MockSessionResponse) {
	defer res.Body.Close()
	b, err := io.ReadAll(res.Body)
	if err != nil {
		t.Error("Error reading request body")
		return
	}

	var body MockSessionResponse
	if err := json.Unmarshal(b, &body); err != nil {
		t.Errorf("Error unmarshalling JSON: %v", err)
		return
	}

	if len(expected.Expand.SessionExercises_via_session) != len(body.Expand.SessionExercises_via_session) {
		t.Logf("Got body: %v", body)
		t.Fatalf(
			"expected received exercises to have length %d, got length %d",
			len(expected.Expand.SessionExercises_via_session),
			len(body.Expand.SessionExercises_via_session),
		)
	}

	if len(expected.Expand.SessionExercises_via_session) != len(body.ExercisesOrder) {
		t.Logf("Got body: %v", body)
		t.Fatalf(
			"expected received exercisesOrder to have length %d, got length %d",
			len(expected.Expand.SessionExercises_via_session),
			len(body.ExercisesOrder),
		)
	}

	receivedItemsSorted := []MockSessionOrRoutineExercise{}
	receivedItemsIdMap := map[string]MockSessionOrRoutineExercise{}

	for _, item := range body.Expand.SessionExercises_via_session {
		receivedItemsIdMap[item.Id] = item
	}
	// sort the received sessionOrRoutine exercises by the received exercisesOrder
	// then it should match the order of the expected
	for _, id := range body.ExercisesOrder {
		item, ok := receivedItemsIdMap[id]
		if !ok {
			t.Errorf("unexpected exercise id in ExercisesOrder: %s", id)
			continue
		}
		receivedItemsSorted = append(receivedItemsSorted, item)
	}

	if len(expected.Expand.SessionExercises_via_session) != len(receivedItemsSorted) {
		t.Logf("Got body: %v", body)
		t.Fatalf(
			"expected sorted items to have length %d, got length %d",
			len(expected.Expand.SessionExercises_via_session),
			len(receivedItemsSorted),
		)
	}

	for i, se := range expected.Expand.SessionExercises_via_session {
		assert.Equal(t, se.Exercise, receivedItemsSorted[i].Exercise, fmt.Sprintf("failed at ind %d (exerciseId)", i))
		if se.SupersetParent != "?" {
			assert.Equal(t, se.SupersetParent, receivedItemsSorted[i].SupersetParent, fmt.Sprintf("failed at ind %d (setparent)", i))
		} else {
			assert.Equal(
				t,
				receivedItemsSorted[se.ParendInd].Id,
				receivedItemsSorted[i].SupersetParent,
				fmt.Sprintf("failed at ind %d (setparent)", i),
			)
		}
		assert.Equal(t, se.Notes, receivedItemsSorted[i].Notes, fmt.Sprintf("failed at ind %d (notes)", i))
		assert.Equal(t, se.MeasurementNumeric, receivedItemsSorted[i].MeasurementNumeric, fmt.Sprintf("failed at ind %d (measurement)", i))
	}
}

func verfiyRoutineResponse(t testing.TB, res *http.Response, expected MockRoutineResponse) {
	defer res.Body.Close()
	b, err := io.ReadAll(res.Body)
	if err != nil {
		t.Error("Error reading request body")
		return
	}

	var body MockRoutineResponse
	if err := json.Unmarshal(b, &body); err != nil {
		t.Errorf("Error unmarshalling JSON: %v", err)
		return
	}

	if len(expected.Expand.RoutineExercises_via_routine) != len(body.Expand.RoutineExercises_via_routine) {
		t.Logf("Got body: %v", body)
		t.Fatalf(
			"expected received exercises to have length %d, got length %d",
			len(expected.Expand.RoutineExercises_via_routine),
			len(body.Expand.RoutineExercises_via_routine),
		)
	}

	if len(expected.Expand.RoutineExercises_via_routine) != len(body.ExercisesOrder) {
		t.Logf("Got body: %v", body)
		t.Fatalf(
			"expected received exercisesOrder to have length %d, got length %d",
			len(expected.Expand.RoutineExercises_via_routine),
			len(body.ExercisesOrder),
		)
	}

	receivedItemsSorted := []MockSessionOrRoutineExercise{}
	receivedItemsIdMap := map[string]MockSessionOrRoutineExercise{}

	for _, item := range body.Expand.RoutineExercises_via_routine {
		receivedItemsIdMap[item.Id] = item
	}
	// sort the received sessionOrRoutine exercises by the received exercisesOrder
	// then it should match the order of the expected
	for _, id := range body.ExercisesOrder {
		item, ok := receivedItemsIdMap[id]
		if !ok {
			t.Errorf("unexpected exercise id in ExercisesOrder: %s", id)
			continue
		}
		receivedItemsSorted = append(receivedItemsSorted, item)
	}

	if len(expected.Expand.RoutineExercises_via_routine) != len(receivedItemsSorted) {
		t.Logf("Got body: %v", body)
		t.Fatalf(
			"expected sorted items to have length %d, got length %d",
			len(expected.Expand.RoutineExercises_via_routine),
			len(receivedItemsSorted),
		)
	}

	for i, re := range expected.Expand.RoutineExercises_via_routine {
		assert.Equal(t, re.Exercise, receivedItemsSorted[i].Exercise, fmt.Sprintf("failed at ind %d (exerciseId)", i))
		if re.SupersetParent != "?" {
			assert.Equal(t, re.SupersetParent, receivedItemsSorted[i].SupersetParent, fmt.Sprintf("failed at ind %d (setparent)", i))
		} else {
			assert.Equal(
				t,
				receivedItemsSorted[re.ParendInd].Id,
				receivedItemsSorted[i].SupersetParent,
				fmt.Sprintf("failed at ind %d (setparent)", i),
			)
		}
		assert.Equal(t, re.Notes, receivedItemsSorted[i].Notes, fmt.Sprintf("failed at ind %d (notes)", i))
		assert.Equal(t, re.MeasurementNumeric, receivedItemsSorted[i].MeasurementNumeric, fmt.Sprintf("failed at ind %d (measurement)", i))
	}
}

func TestRoutineDuplicateRowEndpoint(t *testing.T) {
	endpoint := "/routine/duplicateRow"
	userToken, err := generateToken("users", "test@test.com")
	if err != nil {
		t.Fatal(err)
	}

	scenarios := []tests.ApiScenario{
		{
			Name:            "try with different http method, e.g. GET",
			Method:          http.MethodGet,
			URL:             endpoint,
			ExpectedStatus:  404,
			ExpectedContent: []string{"\"data\":{}"},
			TestAppFactory:  setupTestApp,
		},
		{
			Name:            "try as guest (aka. no Authorization header)",
			Method:          http.MethodPost,
			URL:             endpoint,
			ExpectedStatus:  401,
			ExpectedContent: []string{"\"data\":{}"},
			TestAppFactory:  setupTestApp,
		},
		{
			Name:            "try duplicate second row in routine with 2 exercises",
			Method:          http.MethodPost,
			URL:             endpoint,
			Body:            createTestDuplicateRowBody("xxmvskd9g1olbfx", 1),
			Headers:         map[string]string{"Authorization": userToken},
			ExpectedStatus:  200,
			ExpectedContent: []string{"collectionId"},
			TestAppFactory:  setupTestApp,
			AfterTestFunc: func(t testing.TB, app *tests.TestApp, res *http.Response) {
				expected := MockRoutineResponse{
					Expand: MockRoutineExpand{
						RoutineExercises_via_routine: []MockSessionOrRoutineExercise{
							{Exercise: "bulgarianbh2v1c", SupersetParent: "", Notes: "how", MeasurementNumeric: 30},
							{Exercise: "clubbellorxjgvv", SupersetParent: "", Notes: "note", MeasurementNumeric: 2},
							{Exercise: "clubbellorxjgvv", SupersetParent: "", Notes: "note", MeasurementNumeric: 2},
						},
					},
				}
				verfiyRoutineResponse(t, res, expected)
			},
		},
		{
			Name:            "try duplicate row with dropset",
			Method:          http.MethodPost,
			URL:             endpoint,
			Body:            createTestDuplicateRowBody("trnqakxgfyp1qdc", 1),
			Headers:         map[string]string{"Authorization": userToken},
			ExpectedStatus:  200,
			ExpectedContent: []string{"collectionId"},
			TestAppFactory:  setupTestApp,
			AfterTestFunc: func(t testing.TB, app *tests.TestApp, res *http.Response) {
				expected := MockRoutineResponse{
					Expand: MockRoutineExpand{
						RoutineExercises_via_routine: []MockSessionOrRoutineExercise{
							{Exercise: "ringchestfvkeps", SupersetParent: "", Notes: "", MeasurementNumeric: 0},
							{Exercise: "plateoverhuucz6", SupersetParent: "", Notes: "", MeasurementNumeric: 60},
							{Exercise: "plateoverhuucz6", SupersetParent: "trnqakxgfyp1qdc", Notes: "", MeasurementNumeric: 30},
							{Exercise: "plateoverhuucz6", SupersetParent: "trnqakxgfyp1qdc", Notes: "", MeasurementNumeric: 20},
							{Exercise: "plateoverhuucz6", SupersetParent: "", Notes: "", MeasurementNumeric: 60},
							{Exercise: "plateoverhuucz6", SupersetParent: "?", Notes: "", MeasurementNumeric: 30, ParendInd: 4},
							{Exercise: "plateoverhuucz6", SupersetParent: "?", Notes: "", MeasurementNumeric: 20, ParendInd: 4},
							{Exercise: "ringhangini74hr", SupersetParent: "", Notes: "", MeasurementNumeric: 0},
						},
					},
				}
				verfiyRoutineResponse(t, res, expected)
			},
		},
	}

	for _, scenario := range scenarios {
		scenario.Test(t)
	}
}

func TestRoutineImportRoutineEndpoint(t *testing.T) {
	endpoint := "/routine/importRoutine"
	userToken, err := generateToken("users", "test@test.com")
	if err != nil {
		t.Fatal(err)
	}

	scenarios := []tests.ApiScenario{
		{
			Name:            "try with different http method, e.g. GET",
			Method:          http.MethodGet,
			URL:             endpoint,
			ExpectedStatus:  404,
			ExpectedContent: []string{"\"data\":{}"},
			TestAppFactory:  setupTestApp,
		},
		{
			Name:            "try as guest (aka. no Authorization header)",
			Method:          http.MethodPost,
			URL:             endpoint,
			ExpectedStatus:  401,
			ExpectedContent: []string{"\"data\":{}"},
			TestAppFactory:  setupTestApp,
		},
		{
			Name:            "try import routine with 1 exercise into routine with 2 exercises at end",
			Method:          http.MethodPost,
			URL:             endpoint,
			Body:            createTestImportRoutineBody("zkwbnif3qomyuyd", "agoxssc6gu5b6sy", 2),
			Headers:         map[string]string{"Authorization": userToken},
			ExpectedStatus:  200,
			ExpectedContent: []string{"collectionId"},
			TestAppFactory:  setupTestApp,
			AfterTestFunc: func(t testing.TB, app *tests.TestApp, res *http.Response) {
				expected := MockRoutineResponse{
					Expand: MockRoutineExpand{
						RoutineExercises_via_routine: []MockSessionOrRoutineExercise{
							{Exercise: "bulgarianbh2v1c", SupersetParent: "", Notes: "how", MeasurementNumeric: 30},
							{Exercise: "clubbellorxjgvv", SupersetParent: "", Notes: "note", MeasurementNumeric: 2},
							{Exercise: "cablestraidmcm0", SupersetParent: "", Notes: "hehe", MeasurementNumeric: 1},
						},
					},
				}
				verfiyRoutineResponse(t, res, expected)
			},
		},
		{
			Name:            "try import routine with supersets into routine with 1 exercise at end",
			Method:          http.MethodPost,
			URL:             endpoint,
			Body:            createTestImportRoutineBody("ju66888fbla85hi", "zkwbnif3qomyuyd", 1),
			Headers:         map[string]string{"Authorization": userToken},
			ExpectedStatus:  200,
			ExpectedContent: []string{"collectionId"},
			TestAppFactory:  setupTestApp,
			AfterTestFunc: func(t testing.TB, app *tests.TestApp, res *http.Response) {
				expected := MockRoutineResponse{
					Expand: MockRoutineExpand{
						RoutineExercises_via_routine: []MockSessionOrRoutineExercise{
							{Exercise: "cablestraidmcm0", SupersetParent: "", Notes: "hehe", MeasurementNumeric: 1},
							{Exercise: "ringchestfvkeps", SupersetParent: "", Notes: "", MeasurementNumeric: 0},
							{Exercise: "plateoverhuucz6", SupersetParent: "", Notes: "", MeasurementNumeric: 60},
							{Exercise: "plateoverhuucz6", SupersetParent: "?", Notes: "", MeasurementNumeric: 30, ParendInd: 2},
							{Exercise: "plateoverhuucz6", SupersetParent: "?", Notes: "", MeasurementNumeric: 20, ParendInd: 2},
							{Exercise: "ringhangini74hr", SupersetParent: "", Notes: "", MeasurementNumeric: 0},
						},
					},
				}
				verfiyRoutineResponse(t, res, expected)
			},
		},
	}

	for _, scenario := range scenarios {
		scenario.Test(t)
	}
}

func TestSessionDuplicateRowEndpoint(t *testing.T) {
	endpoint := "/session/duplicateRow"
	userToken, err := generateToken("users", "test@test.com")
	if err != nil {
		t.Fatal(err)
	}

	scenarios := []tests.ApiScenario{
		{
			Name:            "try with different http method, e.g. GET",
			Method:          http.MethodGet,
			URL:             endpoint,
			ExpectedStatus:  404,
			ExpectedContent: []string{"\"data\":{}"},
			TestAppFactory:  setupTestApp,
		},
		{
			Name:            "try as guest (aka. no Authorization header)",
			Method:          http.MethodPost,
			URL:             endpoint,
			ExpectedStatus:  401,
			ExpectedContent: []string{"\"data\":{}"},
			TestAppFactory:  setupTestApp,
		},
		{
			Name:            "try duplicate 3rd exercise row in session",
			Method:          http.MethodPost,
			URL:             endpoint,
			Body:            createTestDuplicateRowBody("r3z048lsu52qo3r", 2),
			Headers:         map[string]string{"Authorization": userToken},
			ExpectedStatus:  200,
			ExpectedContent: []string{"collectionId"},
			TestAppFactory:  setupTestApp,
			AfterTestFunc: func(t testing.TB, app *tests.TestApp, res *http.Response) {
				expected := MockSessionResponse{
					Expand: MockSessionExpand{
						SessionExercises_via_session: []MockSessionOrRoutineExercise{
							{Exercise: "abwheelstayhtr7", SupersetParent: "", Notes: "", MeasurementNumeric: 5},
							{Exercise: "abwheelstayhtr7", SupersetParent: "n488qowbocakkqv", Notes: "", MeasurementNumeric: 4},
							{Exercise: "alternatinvxlfp", SupersetParent: "", Notes: "", MeasurementNumeric: 2},
							{Exercise: "alternatinvxlfp", SupersetParent: "", Notes: "", MeasurementNumeric: 2},
						},
					},
				}
				verfiySessionResponse(t, res, expected)
			},
		},
		{
			Name:            "try duplicate exercise row with dropsets",
			Method:          http.MethodPost,
			URL:             endpoint,
			Body:            createTestDuplicateRowBody("n488qowbocakkqv", 0),
			Headers:         map[string]string{"Authorization": userToken},
			ExpectedStatus:  200,
			ExpectedContent: []string{"collectionId"},
			TestAppFactory:  setupTestApp,
			AfterTestFunc: func(t testing.TB, app *tests.TestApp, res *http.Response) {
				expected := MockSessionResponse{
					Expand: MockSessionExpand{
						SessionExercises_via_session: []MockSessionOrRoutineExercise{
							{Exercise: "abwheelstayhtr7", SupersetParent: "", Notes: "", MeasurementNumeric: 5},
							{Exercise: "abwheelstayhtr7", SupersetParent: "n488qowbocakkqv", Notes: "", MeasurementNumeric: 4},
							{Exercise: "abwheelstayhtr7", SupersetParent: "", Notes: "", MeasurementNumeric: 5},
							{Exercise: "abwheelstayhtr7", SupersetParent: "?", Notes: "", MeasurementNumeric: 4, ParendInd: 2},
							{Exercise: "alternatinvxlfp", SupersetParent: "", Notes: "", MeasurementNumeric: 2},
						},
					},
				}
				verfiySessionResponse(t, res, expected)
			},
		},
	}

	for _, scenario := range scenarios {
		scenario.Test(t)
	}
}

func TestSessionImportRoutineEndpoint(t *testing.T) {
	endpoint := "/session/importRoutine"
	userToken, err := generateToken("users", "test@test.com")
	if err != nil {
		t.Fatal(err)
	}

	scenarios := []tests.ApiScenario{
		{
			Name:            "try with different http method, e.g. GET",
			Method:          http.MethodGet,
			URL:             endpoint,
			ExpectedStatus:  404,
			ExpectedContent: []string{"\"data\":{}"},
			TestAppFactory:  setupTestApp,
		},
		{
			Name:            "try as guest (aka. no Authorization header)",
			Method:          http.MethodPost,
			URL:             endpoint,
			ExpectedStatus:  401,
			ExpectedContent: []string{"\"data\":{}"},
			TestAppFactory:  setupTestApp,
		},
		{
			Name:            "try import routine with 1 exercise into session with no exercises",
			Method:          http.MethodPost,
			URL:             endpoint,
			Body:            createTestImportRoutineBody("zkwbnif3qomyuyd", "v34ogl10g2bbq7v", 0),
			Headers:         map[string]string{"Authorization": userToken},
			ExpectedStatus:  200,
			ExpectedContent: []string{"collectionId"},
			TestAppFactory:  setupTestApp,
			AfterTestFunc: func(t testing.TB, app *tests.TestApp, res *http.Response) {
				expected := MockSessionResponse{
					Expand: MockSessionExpand{
						SessionExercises_via_session: []MockSessionOrRoutineExercise{
							{Exercise: "cablestraidmcm0", SupersetParent: "", Notes: "hehe", MeasurementNumeric: 1},
						},
					},
				}
				verfiySessionResponse(t, res, expected)
			},
		},
		{
			Name:            "try import routine with dropsets into session with 2 exercises",
			Method:          http.MethodPost,
			URL:             endpoint,
			Body:            createTestImportRoutineBody("ju66888fbla85hi", "ty5tm38yvydssc1", 2),
			Headers:         map[string]string{"Authorization": userToken},
			ExpectedStatus:  200,
			ExpectedContent: []string{"collectionId"},
			TestAppFactory:  setupTestApp,
			AfterTestFunc: func(t testing.TB, app *tests.TestApp, res *http.Response) {
				expected := MockSessionResponse{
					Expand: MockSessionExpand{
						SessionExercises_via_session: []MockSessionOrRoutineExercise{
							{Exercise: "singlearmksowou", SupersetParent: "", Notes: "", MeasurementNumeric: 7},
							{Exercise: "singlearmksowou", SupersetParent: "", Notes: "yo", MeasurementNumeric: 0},
							{Exercise: "ringchestfvkeps", SupersetParent: "", Notes: "", MeasurementNumeric: 0},
							{Exercise: "plateoverhuucz6", SupersetParent: "", Notes: "", MeasurementNumeric: 60},
							{Exercise: "plateoverhuucz6", SupersetParent: "?", Notes: "", MeasurementNumeric: 30, ParendInd: 3},
							{Exercise: "plateoverhuucz6", SupersetParent: "?", Notes: "", MeasurementNumeric: 20, ParendInd: 3},
							{Exercise: "ringhangini74hr", SupersetParent: "", Notes: "", MeasurementNumeric: 0},
						},
					},
				}
				verfiySessionResponse(t, res, expected)
			},
		},
	}

	for _, scenario := range scenarios {
		scenario.Test(t)
	}
}
