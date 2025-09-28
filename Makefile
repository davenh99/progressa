build:
	@CGO_ENABLED=0 go build -o ./dist/progressa ./main.go

test:
	@go test -v -coverprofile=coverage.out ./...

serve: build
	@cd dist; ./progressa serve

frontend:
	@cd ui && npm run build

prod: frontend build

prod-serve: prod
	@cd dist; ./progressa serve
