package main

import (
	"testing"

	"github.com/pocketbase/pocketbase/tests"
)

const testDataDir = "./test_pb_data"

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

func TestRoutineDuplicateRowEndpoint(t *testing.T) {

}

func TestRoutineImportRoutineEndpoint(t *testing.T) {

}

func TestSessionDuplicateRowEndpoint(t *testing.T) {

}

func TestSessionImportRoutineEndpoint(t *testing.T) {

}
