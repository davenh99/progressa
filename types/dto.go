package types

type DuplicatePayload struct {
	RecordId string `json:"recordId"`
	RowIndex int    `json:"rowIndex"`
}

type ImportRoutinePayload struct {
	ImportRoutineId string `json:"importRoutineId"`
	InsertRecordId  string `json:"insertRecordId"`
	InsertIndex     int    `json:"insertIndex"`
}
