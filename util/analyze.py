#!/usr/bin/env python
"""Module for analyzing experiment results."""
from __future__ import print_function
import argparse
import errno
from functools import reduce
import json
import operator
import os

import dateutil.parser
import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns


def unnormalize(prefixes, df, df_normalized, sep='.'):
    """Return a new dataframe that is normalized except for the prefixes."""
    out = df_normalized
    for prefix in prefixes:
        cols_to_drop = [col for col in out.columns if col.startswith(prefix)]
        out = out.drop(cols_to_drop, axis=1)
        cols = prefix.split(sep)
        out[prefix] = df[cols[0]].map(
            lambda d: reduce(operator.getitem, cols[1:], d)
        )
    return out


class Session(object):
    def __init__(self, fp):
        self.records = json.load(fp)
        df = pd.DataFrame(self.records)
        df_normalized = pd.io.json.json_normalize(self.records)

        df = unnormalize(
            [
                'next_state.entities',
                'prev_state.entities',
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
        end = df[
            (df['action.type'] == 'CHANGE_EXPERIMENT_PHASE')
            & (df['action.phase'] == 'survey')
        ].index.values[0]
        return df.index.get_loc(start), df.index.get_loc(end)

    def final_state(self):
        """Get final state."""
        return self.records[-1]['next_state']

    def save_final_state(self, fp):
        """Save final state."""
        json.dump(self.to_application_state(self.final_state()), fp)

    def feedback(self):
        """Get participant feedback."""
        df = self.df
        return df[
            (df['action.type'] == 'CHANGE_EXPERIMENT_PHASE')
            & (df['action.phase'] == 'thanks')
        ].iloc[0]['action.payload.comments']

    @staticmethod
    def to_application_state(state):
        """Convert state for import."""
        return {
            'instructions': state['generalInstructions'],
            'groups': state['entities']['groups']['byId'].values(),
            'items': state['entities']['items']['byId'].values(),
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
            self.save_final_state(f)

        with open(os.path.join(output_dir, 'feedback.txt'), 'w') as f:
            f.write(self.feedback())


def main(fp, output_dir):
    session = Session(fp)
    session.analyze(output_dir=output_dir)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('input_file', type=argparse.FileType('r'))
    parser.add_argument('-o', '--output_dir', type=str)

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

    main(args.input_file, args.output_dir)
