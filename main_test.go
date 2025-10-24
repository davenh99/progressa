package main

import (
	"net/http"
	"progressa/core/routes"
	"testing"

	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tests"
)

const testDataDir = "./dist/test_pb_data"

func generateToken(collectionNameOrId string, email string) (string, error) {
	app, err := tests.NewTestApp(testDataDir)
	if err != nil {
		return "", err
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
			Method:          http.MethodGet,
			URL:             endpoint,
			ExpectedStatus:  404,
			ExpectedContent: []string{"\"data\":{}"},
			TestAppFactory:  setupTestApp,
		},
		{
			Name:   "try as authenticated app user",
			Method: http.MethodPost,
			URL:    endpoint,
			Headers: map[string]string{
				"Authorization": userToken,
			},
			ExpectedStatus:  200,
			ExpectedContent: []string{"\"data\":{}"},
			TestAppFactory:  setupTestApp,
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
			Method:          http.MethodGet,
			URL:             endpoint,
			ExpectedStatus:  404,
			ExpectedContent: []string{"\"data\":{}"},
			TestAppFactory:  setupTestApp,
		},
		{
			Name:   "try as authenticated app user",
			Method: http.MethodPost,
			URL:    endpoint,
			Headers: map[string]string{
				"Authorization": userToken,
			},
			ExpectedStatus:  200,
			ExpectedContent: []string{"\"data\":{}"},
			TestAppFactory:  setupTestApp,
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
			Method:          http.MethodGet,
			URL:             endpoint,
			ExpectedStatus:  404,
			ExpectedContent: []string{"\"data\":{}"},
			TestAppFactory:  setupTestApp,
		},
		{
			Name:   "try as authenticated app user",
			Method: http.MethodPost,
			URL:    endpoint,
			Headers: map[string]string{
				"Authorization": userToken,
			},
			ExpectedStatus:  200,
			ExpectedContent: []string{"\"data\":{}"},
			TestAppFactory:  setupTestApp,
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
			Method:          http.MethodGet,
			URL:             endpoint,
			ExpectedStatus:  404,
			ExpectedContent: []string{"\"data\":{}"},
			TestAppFactory:  setupTestApp,
		},
		{
			Name:   "try as authenticated app user",
			Method: http.MethodPost,
			URL:    endpoint,
			Headers: map[string]string{
				"Authorization": userToken,
			},
			ExpectedStatus:  200,
			ExpectedContent: []string{"\"data\":{}"},
			TestAppFactory:  setupTestApp,
		},
	}

	for _, scenario := range scenarios {
		scenario.Test(t)
	}
}
