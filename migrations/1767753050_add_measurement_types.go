package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		// add up queries...

		const newMeasurementTypes = [
      { id: "m01s8yx7wfk2gxd", s: true, dn: "reps", n: "Reps", num: true, p: true },
      { id: "8ldlgtjjvy3ircl", s: true, dn: "time", n: "Time", num: true, p: true },
      { id: "8ldlgghjvy4ircl", s: true, dn: "grade", n: "Boulder grade (hueco)", num: false, p: true },
      { id: "8ldlgghjvy5yrcl", s: true, dn: "grade", n: "Boulder grade (font)", num: false, p: true },
      { id: "8ldlgghjvt7yrcl", s: true, dn: "grade", n: "Route grade (ewbanks)", num: false, p: true },
      { id: "8ldlyyhjvt7yrbl", s: true, dn: "grade", n: "Route grade (french)", num: false, p: true },
	  { id: "distancem000000", dn: "distance (m)", n: "distance (m)", num: true },
      { id: "distancekm00000", dn: "distance (km)", n: "distance (km)", num: true },
      { id: "egdesizemm00000", dn: "edge (mm)", n: "edge size (mm)", num: true },
    ];

	for (const m of newMeasurementTypes) {
      let record = new Record(measurementTypes);
      record.set("id", m.id);
      record.set("system", m.s);
      record.set("name", m.n);
      record.set("displayName", m.dn);
      record.set("numeric", m.num);
      record.set("public", m.p);

      app.save(record);
    }

		return nil
	}, func(app core.App) error {
		return nil
	})
}
