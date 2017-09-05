#!/usr/bin/env python
"""Generate randomized 3x3 latin squares javascript module."""
import copy
import random

COPIES = 100

latin_squares = {
    'latin3x3': [
        [[1, 2, 3], [2, 3, 1], [3, 1, 2]],
        [[1, 2, 3], [3, 1, 2], [2, 3, 1]],
        [[1, 3, 2], [2, 1, 3], [3, 2, 1]],
        [[1, 3, 2], [3, 2, 1], [2, 1, 3]],
        [[2, 1, 3], [1, 3, 2], [3, 2, 1]],
        [[2, 1, 3], [3, 2, 1], [1, 3, 2]],
        [[2, 3, 1], [1, 2, 3], [3, 1, 2]],
        [[2, 3, 1], [3, 1, 2], [1, 2, 3]],
        [[3, 2, 1], [1, 3, 2], [2, 1, 3]],
        [[3, 2, 1], [2, 1, 3], [1, 3, 2]],
        [[3, 1, 2], [1, 2, 3], [2, 3, 1]],
        [[3, 1, 2], [2, 3, 1], [1, 2, 3]],
    ],
    'latin2x2': [
        [[1, 2], [2, 1]],
        [[2, 1], [1, 2]],
    ],
}

for k in latin_squares:
    random.seed(0)
    matrices = []
    for i in xrange(COPIES):
        random.shuffle(latin_squares[k])
        matrices += copy.deepcopy(latin_squares[k])
    with open('{0}.js'.format(k), 'w') as f_out:
        f_out.write('export default {0};\n'.format(matrices))
