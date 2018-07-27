#!/usr/bin/env python
"""Module for analyzing experiment results."""
from __future__ import print_function
import argparse
import errno
from functools import reduce
import json
import operator
import os
import re

import dateutil.parser
import matplotlib as mpl
mpl.use('agg')
import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns

MENTION_RE = re.compile('@([0-9]+)')

def get_nested(d, keys):
    try:
        return reduce(operator.getitem, keys, d)
    except KeyError:
        return None


def unnormalize(prefixes, df, df_normalized, sep='.'):
    """Return a new dataframe that is normalized except for the prefixes."""
    out = df_normalized
    for prefix in prefixes:
        cols_to_drop = [col for col in out.columns if col.startswith(prefix)]
        out = out.drop(cols_to_drop, axis=1)
        cols = prefix.split(sep)
        out[prefix] = df[cols[0]].map(
            lambda d: get_nested(d, cols[1:])
        )
    return out


class Session(object):
    def __init__(self, records, experiment_data):
        self.records = records
        self.experiment_data = experiment_data
        df = pd.DataFrame(self.records)
        df_normalized = pd.io.json.json_normalize(self.records)

        df = unnormalize(
            [
                'next_state.entities',
                'prev_state.entities',
                'action.payload',
            ],
            df,
            df_normalized,
        )
        df['start_time'] = df['start_time'].map(dateutil.parser.parse)
        df = df.sort_values('start_time')

        # 'elapsed_time' column
        experiment_start_time = df[
            (df['action.type'] == 'CHANGE_EXPERIMENT_PHASE')
            & (df['action.phase'] == 'singlePage')
        ].iloc[0]['start_time']
        df['elapsed_time'] = df['start_time'] - experiment_start_time

        # 'n_groups' column
        df['n_groups'] = df['next_state.entities'].map(
            lambda d: len([k for k in d['groups']['byId']
                           if d['groups']['byId'][k]['itemIds']])
        )
        df = df.set_index('elapsed_time')
        self.df = df

    def experiment_range(self):
        """Return start and end times of core experiment."""
        df = self.df
        start = df[
            (df['action.type'] == 'CHANGE_EXPERIMENT_PHASE')
            & (df['action.phase'] == 'singlePage')
        ].index.values[0]
        try:
            end = df[
                (df['action.type'] == 'CHANGE_EXPERIMENT_PHASE')
                & (df['action.phase'] == 'survey')
            ].index.values[0]
            end = df.index.get_loc(end)
        except IndexError:
            end = len(df) - 1
        return df.index.get_loc(start), end

    def final_state(self):
        """Get final state."""
        return self.records[-1]['next_state']

    def get_final_application_state(self):
        """Get final application state."""
        return self.to_application_state(self.final_state())

    def get_config(self):
        """Get config."""
        return self.final_state()['config']

    @staticmethod
    def get_test_questions(state):
        """Get test questions from state."""
        return [
            v for v in state['entities']['items']['byId'].itervalues()
            if 'test' in v and v['test'] is True
        ]

    def replace_item_mentions(self, instructions, indices=None):
        if indices is None:
            indices = dict()

        counter = max([0] + indices.values())
        for o in MENTION_RE.finditer(instructions):
            id = int(o.group(1))
            if id not in indices:
                counter += 1
                indices[id] = counter

        def replace(o):
            id = int(o.group(1))
            return '[example {0} ![example {0}]({1})]({1}){{: .example target="_blank" }}'.format(
                indices[id],
                self.experiment_data[id]['data']['path'],
            )

        s = MENTION_RE.sub(
            replace,
            instructions,
        )
        return s, indices

    def get_final_instructions(self):
        """Get instructions in format to be consumed by external application."""
        # config = self.get_config()
        last = self.final_state()
        test_questions = self.get_test_questions(last)
        instructions, indices = self.replace_item_mentions(last['generalInstructions'])
        for item in test_questions:
            item.update(self.experiment_data[item['id']])
            if 'reason' in item and 'text' in item['reason']:
                item['reason']['text'], _ = self.replace_item_mentions(item['reason']['text'], indices)
        return {
            'instructions': instructions,
            'examples': [{'id': id, 'index': indices[id]} for id in indices],
            'tests': test_questions,
        }

    def feedback(self):
        """Get participant feedback."""
        df = self.df
        try:
            return df[
                (df['action.type'] == 'CHANGE_EXPERIMENT_PHASE')
                & (df['action.phase'] == 'thanks')
            ].iloc[0]['action.payload']
        except IndexError:
            return None

    @staticmethod
    def to_application_state(state):
        """Convert state for import."""
        return {
            'instructions': state['generalInstructions'],
            'groups': state['entities']['groups']['byId'].values(),
            'items': state['entities']['items']['byId'].values(),
            'recommendations': state['recommendations'],  # Not loaded by Sprout
        }

    def analyze(self, output_dir):
        """Print analysis to stdout."""
        sns.set_context('talk')

        df = self.df

        # Select only experiment records.
        range = self.experiment_range()
        df = df.iloc[range[0]:range[1]]

        # Resample for nicer-looking plots.
        rule = '1S'  # 'T' is minute
        n_groups = df['n_groups'].resample(rule).pad()
        queued = df['prev_state.oracle.queuedItems'].map(
            len).resample(rule).pad()
        answered = df['prev_state.oracle.answeredItems'].map(
            len).resample(rule).pad()

        for ts, name, axis_title in [
            (n_groups, 'n_groups', 'Number of groups'),
            (queued, 'queued', 'Number of items in customer queue'),
            (answered, 'answered', 'Number of items answered by customer'),
        ]:
            ts.plot()
            plt.ylabel(axis_title)
            plt.ylim(0, None)
            plt.xlabel('Elapsed time')
            plt.savefig(os.path.join(output_dir, '{}.png'.format(name)),
                        bbox_inches='tight')
            plt.clf()

        with open(os.path.join(output_dir, 'last_state.json'), 'w') as f:
            json.dump(self.get_final_application_state(), f)

        with open(os.path.join(output_dir, 'instructions.json'), 'w') as f:
            json.dump(self.get_final_instructions(), f)

        with open(os.path.join(output_dir, 'config.json'), 'w') as f:
            json.dump(self.get_config(), f)

        feedback = self.feedback()
        if feedback is not None:
            with open(os.path.join(output_dir, 'feedback.json'), 'w') as f:
                json.dump(feedback, f)


def main(records_fp, experiment_fp, output_dir, item_root_dir=None):
    experiment_data = {
        v['id']: v for v in json.load(experiment_fp)['data']
    }
    if item_root_dir is not None:
        for k in experiment_data:
            experiment_data[k]['data']['path'] = os.path.join(item_root_dir, experiment_data[k]['data']['path'])
    session = Session(
        records=json.load(records_fp),
        experiment_data=experiment_data,
    )
    session.analyze(output_dir=output_dir)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('input_file', type=argparse.FileType('r'),
                        help='Experiment records')
    parser.add_argument('experiment_file', type=argparse.FileType('r'),
                        help='Experiment definition')
    parser.add_argument('-o', '--output_dir', type=str)
    parser.add_argument('--item_root_dir', type=str)

    args = parser.parse_args()
    if args.output_dir is None:
        name, _ = os.path.splitext(os.path.basename(args.input_file.name))
        args.output_dir = os.path.join(
            os.path.dirname(args.input_file.name),
            name,
        )

    try:
        os.makedirs(args.output_dir)
    except OSError as e:
        if e.errno != errno.EEXIST:
            raise

    main(args.input_file, args.experiment_file, args.output_dir, args.item_root_dir)
