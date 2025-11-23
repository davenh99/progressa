package core

import "progressa/plugins/computedfields"

var ComputedFieldsCfg = computedfields.Config{
	CollectionComputedFields: map[string][]computedfields.ComputedField{},
}
