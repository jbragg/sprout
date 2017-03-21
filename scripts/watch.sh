#!/bin/bash
mkdir -p src/static/js
watchify -t [ babelify ] src/index.js -o src/static/js/bundle.js --insert-globals --debug -v
