build:
	@CGO_ENABLED=0 go build -o ./dist/progressa ./main.go

test:
	@go test -v -coverprofile=coverage.out ./...

serve: build
	@cd dist; ./progressa serve

serve-test: build
	@cd dist; ./progressa serve --dir="./test_pb_data"

build-ui:
	@cd ui && npm run build

ui-dev:
	@cd ui && npm run dev

prod: build-ui build

serve-prod: prod
	@cd dist; ./progressa serve

serve-dev:
	@trap "pkill -P $$" EXIT; \
	(make serve &) && \
	(make ui-dev)

dev: serve-dev

release-patch:
	./release.sh patch

release-minor:
	./release.sh minor

release-major:
	./release.sh major