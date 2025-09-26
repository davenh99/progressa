package main

import (
	"log"
	"workouter/utils"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/plugins/jsvm"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"
)

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

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
