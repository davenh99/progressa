package utils

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Env               string
	SuperuserName     string
	SuperuserPassword string
	GithubToken       string
}

var Env Config = initConfig()

func initConfig() Config {
	godotenv.Load()

	return Config{
		Env:               getEnv("ENV", "production"),
		SuperuserName:     getEnv("SUPERUSER_NAME", ""),
		SuperuserPassword: getEnv("SUPERUSER_PASSWORD", ""),
		GithubToken:       getEnv("GH_TOKEN", ""),
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}

	return fallback
}
