package common

type Field interface {
	GetName() string
	GetType() string
	IsReadOnly() bool
}
