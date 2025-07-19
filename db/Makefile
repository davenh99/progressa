build:
	@CGO_ENABLED=0 go build -o ./dist/workouter ./main.go

test:
	@go test -v -coverprofile=coverage.out ./...

serve: build
	@cd dist; ./workouter serve
