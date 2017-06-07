"""Make groups from queries stored with items."""
import argparse
import collections
import json


def main(experiment_path, out_path):
    queries_to_items = collections.defaultdict(list)
    with open(experiment_path, 'r') as f:
        experiment = json.load(f)
    for item in experiment['data']:
        if 'query' in item['data']:
            queries_to_items[json.dumps(
                item['data']['query'], sort_keys=True)].append(item['id'])
    items = []
    groups = []
    for group_id, query in enumerate(queries_to_items):
        groups.append({'id': group_id, 'label': 'maybe'})
        for item_id in queries_to_items[query]:
            items.append({'id': item_id, 'group': group_id, 'label': None})
    with open(out_path, 'w') as f:
        json.dump({'items': items, 'groups': groups}, f)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument(
        '--experiment',
        type=str)
    parser.add_argument(
        '--out',
        type=str)
    args = parser.parse_args()
    main(experiment_path=args.experiment,
         out_path=args.out)
