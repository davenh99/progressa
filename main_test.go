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

const testDataDir = "./dist/test_pb_data"

type MockSessionOrRoutineExercise struct {
	Id             string `json:"id"`
	Exercise       string `json:"exercise"`
	SupersetParent string `json:"supersetParent"`
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
		assert.Equal(t, se.Exercise, receivedItemsSorted[i].Exercise, fmt.Sprintf("failed at ind %d", i))
		assert.Equal(t, se.SupersetParent, receivedItemsSorted[i].SupersetParent, fmt.Sprintf("failed at ind %d", i))
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
	for i, se := range expected.Expand.RoutineExercises_via_routine {
		assert.Equal(t, se.Exercise, receivedItemsSorted[i].Exercise, fmt.Sprintf("failed at ind %d", i))
		assert.Equal(t, se.SupersetParent, receivedItemsSorted[i].SupersetParent, fmt.Sprintf("failed at ind %d", i))
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
							{Exercise: "73repeater00000", SupersetParent: ""},
							{Exercise: "a5wjd65ifgrjt9q", SupersetParent: ""},
							{Exercise: "a5wjd65ifgrjt9q", SupersetParent: ""},
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
							{Exercise: "73repeater00000", SupersetParent: ""},
							{Exercise: "a5wjd65ifgrjt9q", SupersetParent: ""},
							{Exercise: "a5wjd65ifgrjt9m", SupersetParent: ""},
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
							{Exercise: "70vlzfveuudrmax", SupersetParent: ""},
							{Exercise: "70vlzfveuudrmax", SupersetParent: "n488qowbocakkqv"},
							{Exercise: "a5wjd65ifgrjt9j", SupersetParent: ""},
							{Exercise: "a5wjd65ifgrjt9j", SupersetParent: ""},
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
							{Exercise: "a5wjd65ifgrjt9m", SupersetParent: ""},
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
