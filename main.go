package main

import (
	"embed"
	"io/fs"
	"log"
	"workouter/utils"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/plugins/jsvm"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"
	"github.com/pocketbase/pocketbase/tools/hook"
)

//go:embed ui/dist/*
var embeddedFiles embed.FS

func main() {
	app := pocketbase.New()
	env := utils.Env.Env

	migrationsFilePattern := `^\d.*\.(js|ts)`
	if env == "development" {
		migrationsFilePattern = `^.*\.(js|ts)$`
	}

	jsvm.MustRegister(app, jsvm.Config{
		MigrationsDir:          "./pb_migrations",
		MigrationsFilesPattern: migrationsFilePattern,
	})

	// migrate command (with js templates)
	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
		TemplateLang: migratecmd.TemplateLangJS,
		Automigrate:  env == "development",
	})

	app.OnServe().Bind(&hook.Handler[*core.ServeEvent]{
		Func: func(e *core.ServeEvent) error {
			distFS, err := fs.Sub(embeddedFiles, "ui/dist")
			if err != nil {
				return err
			}

			e.Router.GET("/{path...}", apis.Static(distFS, true))

			return e.Next()
		},
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
