package main

import (
	"embed"
	"io/fs"
	"log"
	c "progressa/core"
	"progressa/core/routes"
	"progressa/plugins/computedfields"
	"progressa/plugins/gentypes"
	"progressa/utils"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/plugins/ghupdate"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"
	"github.com/pocketbase/pocketbase/tools/hook"

	_ "progressa/migrations"
)

var Version = "dev"

//go:embed ui/dist/*
var embeddedFiles embed.FS

func main() {
	app := pocketbase.New()
	env := utils.Env

	computedfields.Register(app, c.ComputedFieldsCfg)

	migrationsDir := "./migrations"

	switch env.Env {
	case "development":
		migrationsDir = "../migrations"

		gentypes.Register(app, gentypes.Config{
			FilePath:                   "ui/base.d.ts",
			CollectionAdditionalFields: c.ComputedFieldsCfg.ExtractFields(),
			SelectOptionsPath:          "ui/selectOptions.ts",
		})
	case "production":
		ghupdate.MustRegister(app, app.RootCmd, ghupdate.Config{
			Owner:             "davenh99",
			Repo:              "progressa",
			ArchiveExecutable: "progressa",
		})
	default:
		log.Fatalf("Unknown ENV value: %s", env.Env)
	}

	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
		Automigrate: env.Env == "development",
		Dir:         migrationsDir,
	})

	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		routesHandler := routes.NewHandler(app)
		routesHandler.RegisterRoutes(se)

		return se.Next()
	})

	app.OnServe().Bind(&hook.Handler[*core.ServeEvent]{
		Func: func(e *core.ServeEvent) error {
			if distFS, err := fs.Sub(embeddedFiles, "ui/dist"); err == nil {
				e.Router.GET("/{path...}", apis.Static(distFS, true))
			}

			return e.Next()
		},
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
