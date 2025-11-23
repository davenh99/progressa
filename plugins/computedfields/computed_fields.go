package computedfields

import (
	"progressa/common"

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

// FieldType should be any of text, number, bool, json
type ComputedField struct {
	FieldName string
	FieldType string
	Compute   func(e *core.RecordEnrichEvent) any
}

type Config struct {
	CollectionComputedFields map[string][]ComputedField
}

func Register(app *pocketbase.PocketBase, cfg Config) {
	for collection, fields := range cfg.CollectionComputedFields {
		app.OnRecordEnrich(collection).BindFunc(func(e *core.RecordEnrichEvent) error {
			e.Record.WithCustomData(true)

			for _, field := range fields {
				e.Record.Set(field.FieldName, field.Compute)
			}

			return e.Next()
		})
	}
}

func (c *Config) ExtractFields() map[string][]common.Field {
	extracted := make(map[string][]common.Field)

	for collection, fields := range c.CollectionComputedFields {
		for _, f := range fields {
			extracted[collection] = append(extracted[collection], Field{
				FieldName: f.FieldName,
				FieldType: f.FieldType,
				ReadOnly:  true,
			})
		}
	}

	return extracted
}
