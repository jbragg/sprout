#!/bin/bash
mkdir -p src/static/js
browserify ./src/index.js \
    -g [envify --NODE_ENV 'production'] \
    -t [ babelify ] \
    | uglifyjs --compress --mangle -o src/static/js/bundle.js
