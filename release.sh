#!/bin/bash
set -e

cd ui
VERSION=$(npm version "$1" --no-git-tag-version)
cd ..

git add ui/package.json ui/package-lock.json
git commit -m "release: $VERSION"
git tag $VERSION

echo "✔ Tagged $VERSION"
