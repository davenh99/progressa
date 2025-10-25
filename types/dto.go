package types

type DuplicatePayload struct {
	ExerciseRowId string `json:"exerciseRowId"`
	RowIndex      int    `json:"rowIndex"`
}

type ImportRoutinePayload struct {
	ImportRoutineId    string `json:"importRoutineId"`
	SessionOrRoutineId string `json:"sessionOrRoutineId"`
	InsertIndex        int    `json:"insertIndex"`
}
