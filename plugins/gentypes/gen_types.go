package gentypes

import (
	"bytes"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"progressa/common"
	"strings"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
	"github.com/spf13/cobra"
)

type Field struct {
	FieldName string
	FieldType string
	ReadOnly  bool
}

func (f Field) GetName() string  { return f.FieldName }
func (f Field) GetType() string  { return f.FieldType }
func (f Field) IsReadOnly() bool { return f.ReadOnly }

type Config struct {
	FilePath                   string
	Export                     bool
	CollectionAdditionalFields map[string][]common.Field
}

func Register(app *pocketbase.PocketBase, cfg Config) {
	app.RootCmd.AddCommand(&cobra.Command{
		Use: "gen-types",
		Run: func(cmd *cobra.Command, args []string) {
			err := cfg.generateTypes(app)
			if err != nil {
				fmt.Printf("error: %v\n", err)
			}
		},
	})

	app.OnCollectionAfterUpdateSuccess().BindFunc(func(e *core.CollectionEvent) error {
		err := cfg.generateTypes(app)
		if err != nil {
			return err
		}

		return e.Next()
	})
}

func (c *Config) generateTypes(app *pocketbase.PocketBase) error {
	collections, err := app.FindAllCollections()
	if err != nil {
		return err
	}

	root, err := projectRoot()
	if err != nil {
		panic(err)
	}

	outPath := filepath.Join(strings.Trim(root, "\t\n\r "), c.FilePath)

	f, err := os.Create(outPath)
	if err != nil {
		return err
	}
	defer f.Close()

	f.WriteString("/* This file was automatically generated, changes will be overwritten. */\n\n")

	c.printBaseType(f)

	for _, collection := range collections {
		if !collection.System {
			c.printCollectionTypes(f, collection)
		}
	}

	return nil
}

func (c *Config) printBaseType(f *os.File) {
	if c.Export {
		fmt.Fprint(f, "export ")
	}
	fmt.Fprint(f, "interface BaseRecord {\n")

	baseFields := []string{"id", "collectionName", "collectionId", "created", "updated"}

	for _, field := range baseFields {
		fmt.Fprintf(f, "  %s: string;\n", field)
	}

	fmt.Fprint(f, "}\n\n")
}

func (c *Config) printCollectionTypes(f *os.File, collection *core.Collection) {
	typeName := capitalise(collection.Name)

	fmt.Fprintf(f, "/* Collection type: %s */\n", collection.Type)
	if c.Export {
		fmt.Fprint(f, "export ")
	}
	fmt.Fprintf(f, "interface %s {\n", typeName)

	for _, field := range collection.Fields {
		if field.Type() == "autodate" || field.GetName() == "id" || field.GetHidden() {
			continue
		}
		fmt.Fprintf(f, "  %s%s; // %s\n", field.GetName(), toTypeScriptType(field), field.Type())
	}

	for _, additionalField := range c.CollectionAdditionalFields[collection.Name] {
		readonly := ""
		if additionalField.IsReadOnly() {
			readonly = "readonly "
		}
		fmt.Fprintf(
			f,
			"  %s%s%s",
			readonly,
			additionalField.GetName(),
			additionalFieldToTypeScriptType(additionalField.GetType()),
		)
	}

	fmt.Fprint(f, "}\n\n")

	if c.Export {
		fmt.Fprint(f, "export ")
	}
	fmt.Fprintf(f, "type %sRecord = %s & BaseRecord;\n\n", typeName, typeName)
}

func capitalise(s string) string {
	if s == "" {
		return ""
	}

	firstLetter := s[0]
	rest := s[1:]

	return strings.ToUpper(string(firstLetter)) + rest
}

func projectRoot() (string, error) {
	cmd := exec.Command("git", "rev-parse", "--show-toplevel")
	cmd.Stderr = os.Stderr

	var out bytes.Buffer
	cmd.Stdout = &out

	if err := cmd.Run(); err != nil {
		return "", fmt.Errorf("failed to find git root: %w", err)
	}

	root := filepath.Clean(out.String())
	return root, nil
}

func toTypeScriptType(f core.Field) string {
	switch f.Type() {
	case "password":
		if sf, ok := f.(*core.PasswordField); ok {
			if sf.Required {
				return ": string"
			}
		}
		return "?: string"
	case "text":
		if sf, ok := f.(*core.TextField); ok {
			if sf.Required {
				return ": string"
			}
		}
		return "?: string"
	case "email":
		if sf, ok := f.(*core.EmailField); ok {
			if sf.Required {
				return ": string"
			}
		}
		return "?: string"
	case "relation":
		if sf, ok := f.(*core.RelationField); ok {
			res := ""
			if !sf.Required {
				res += "?"
			}
			res += ": string"
			if sf.MaxSelect > 1 {
				res += "[]"
			}
			return res
		}
		return "?: string"
	case "autodate":
		return ": string"
	case "date":
		if sf, ok := f.(*core.DateField); ok {
			if sf.Required {
				return ": string"
			}
		}
		return "?: string"
	case "url":
		if sf, ok := f.(*core.FileField); ok {
			if sf.Required {
				return ": string"
			}
		}
		return "?: string"
	case "file":
		if sf, ok := f.(*core.FileField); ok {
			if sf.Required {
				return ": string"
			}
		}
		return "?: string"
	case "select":
		if sf, ok := f.(*core.SelectField); ok {
			res := ""
			values := sf.Values

			if !sf.Required {
				values = append(values, "")
			}

			if len(values) > 0 {
				var quoted []string
				for _, v := range values {
					quoted = append(quoted, fmt.Sprintf("\"%s\"", v))
				}
				res = strings.Join(quoted, " | ")
			}

			if sf.MaxSelect > 1 {
				res = fmt.Sprintf("(%s)[]", res)
			}
			if sf.Required {
				return fmt.Sprintf(": %s", res)
			} else {
				return fmt.Sprintf("?: %s", res)
			}
		}
		return "?: string"
	case "number":
		if sf, ok := f.(*core.NumberField); ok {
			if sf.Required {
				return ": number"
			}
		}
		return "?: number"
	case "bool":
		if sf, ok := f.(*core.BoolField); ok {
			if sf.Required {
				return ": boolean"
			}
		}
		return "?: boolean"
	case "json":
		if sf, ok := f.(*core.JSONField); ok {
			if sf.Required {
				return ": any"
			}
		}
		return "?: any"
	default:
		return "?: unknown"
	}
}

func additionalFieldToTypeScriptType(fType string) string {
	res := ""

	switch fType {
	case "text":
		res = ": string"
	case "number":
		res = ": number"
	case "bool":
		res = ": boolean"
	case "json":
		res = ": any"
	default:
		res = ": unknown"
	}

	return fmt.Sprintf("%s; // %s\n", res, fType)
}
