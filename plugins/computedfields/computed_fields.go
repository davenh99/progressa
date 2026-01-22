package computedfields

import (
	"fmt"

	"github.com/davenh99/pb-typescript/gentypes"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
)

type Field struct {
	FieldName string
	FieldType string
	ReadOnly  bool
}

func (f Field) GetName() string  { return f.FieldName }
func (f Field) GetType() string  { return f.FieldType }
func (f Field) IsReadOnly() bool { return f.ReadOnly }

type FieldType string

const (
	TEXT   FieldType = "text"
	NUMBER FieldType = "number"
	BOOL   FieldType = "bool"
	JSON   FieldType = "json"
)

// FieldType should be any of text, number, bool, json
type ComputedField struct {
	FieldName string
	FieldType FieldType
	// Compute needs to return the field value
	Compute func(e *core.RecordEnrichEvent) any
}

type Config struct {
	CollectionComputedFields map[string][]ComputedField
}

func Register(app *pocketbase.PocketBase, cfg Config) {
	for collection, fields := range cfg.CollectionComputedFields {
		app.OnRecordEnrich(collection).BindFunc(func(e *core.RecordEnrichEvent) error {
			e.Record.WithCustomData(true)

			for _, field := range fields {
				if f := e.Record.Collection().Fields.GetByName(field.FieldName); f != nil {
					e.App.Logger().Error(fmt.Sprintf(
						"could not add computed field, field name %s already exists on collection %s",
						field.FieldName,
						e.Record.TableName(),
					))
					continue
				}

				e.Record.Set(field.FieldName, field.Compute(e))
			}

			return e.Next()
		})
	}
}

func (c *Config) ExtractFields() map[string][]gentypes.AdditionalField {
	extracted := make(map[string][]gentypes.AdditionalField)

	for collection, fields := range c.CollectionComputedFields {
		for _, f := range fields {
			extracted[collection] = append(extracted[collection], Field{
				FieldName: f.FieldName,
				FieldType: string(f.FieldType),
				ReadOnly:  true,
			})
		}
	}

	return extracted
}
