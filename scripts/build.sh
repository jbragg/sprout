#!/bin/bash
mkdir -p src/static/js
browserify -t [ babelify ] src/index.js -o src/static/js/bundle.js --insert-globals --debug
