#!/usr/bin/env python
"""Generate randomized binary values javascript module."""
import random

SIZE = 100
random.seed(0)
binary = [[random.randint(0, 1) for j in xrange(SIZE)] for i in xrange(SIZE)]
with open('binary.js', 'w') as f_out:
    f_out.write('export default {0};\n'.format(binary))
