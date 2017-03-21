#!/bin/bash
mkdir -p src/static/js
browserify -g [envify --NODE_ENV 'production'] -t [ babelify ] src/index.js | uglifyjs --compress -o src/static/js/bundle.js
