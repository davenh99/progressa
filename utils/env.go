package utils

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Env string
}

var Env Config = initConfig()

func initConfig() Config {
	godotenv.Load()

	return Config{
		Env: getEnv("ENV", "production"),
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}

	return fallback
}
