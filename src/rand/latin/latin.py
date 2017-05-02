#!/usr/bin/env python
"""Generate randomized 3x3 latin squares javascript module."""
import random
import copy

COPIES = 10

latin3x3s = [
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
    [[3, 1, 2], [2, 3, 1], [1, 2, 3]]]

random.seed(0)
matrices = []
for i in xrange(COPIES):
    random.shuffle(latin3x3s)
    matrices += copy.deepcopy(latin3x3s)

with open('latin3x3.js', 'w') as f_out:
    f_out.write('export default {0};\n'.format(matrices))
