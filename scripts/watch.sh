#!/bin/bash
mkdir -p src/static/js
watchify ./src/index.js \
    -t [ babelify ] \
    -o src/static/js/bundle.js --insert-globals --debug -v \
    --ignore-watch="**/\.git/**|**/node_modules/**|**/experiment_data/**"
