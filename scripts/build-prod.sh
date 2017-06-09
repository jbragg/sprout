#!/bin/bash
mkdir -p src/static/js
browserify ./src/index.js \
    -g [envify --NODE_ENV 'production'] \
    -t [ babelify ] \
    -g uglifyify \
    -p bundle-collapser/plugin \
    | uglifyjs --compress --mangle -o src/static/js/bundle.js
