#!/bin/bash
mkdir -p src/static/js
browserify ./src/index.js \
    -t [ babelify ] \
    -o src/static/js/bundle.js --insert-globals --debug
