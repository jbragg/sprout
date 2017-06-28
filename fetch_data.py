import argparse
import json
import os
import datetime

DATA_DIR = os.path.join(os.path.dirname(
    os.path.realpath(__file__)), 'experiment_data')


def json_serial(obj):
    """JSON serializer for objects not serializable by default JSON code."""
    if isinstance(obj, datetime.datetime):
        serial = obj.isoformat()
        return serial
    raise TypeError('Type not serializable')

try:
    import dev_appserver
    dev_appserver.fix_sys_path()
except ImportError:
    print('Please make sure the App Engine SDK is in your PYTHONPATH.')
    raise

from google.appengine.ext.remote_api import remote_api_stub
import model


def fetch_all(query, limit=100):
    results = []
    start_dt = datetime.datetime.now()
    # Fetch all entities in batches.
    entities, cursor, more = query.fetch_page(limit)
    while more:
        results.extend(entities)
        entities, cursor, more = query.fetch_page(limit, start_cursor=cursor)
        print len(results), 'entities at', datetime.datetime.now()  # Progress and time tracker.
    results.extend(entities)
    print len(results), 'total entities fetched in', (datetime.datetime.now() - start_dt).seconds, 'seconds'  # Progress and time tracker.
    return results


def main(project_id, data_dir=DATA_DIR, separate=True):
    """Fetch experiment data.

    Creates data_dir with the following files (JSON-serialized lists of
    entities):
    - actions.json: model.Actions entities.

    """
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)

    remote_api_stub.ConfigureRemoteApiForOAuth(
        '{}.appspot.com'.format(project_id),
        '/_ah/remote_api')

    for entity_type, fname in [(model.Actions, 'actions.json')]:
        filters = []
        if fname == 'actions.json':
            filters = entity_type.query(
                projection=[
                    entity_type.experiment_id,
                    entity_type.task_id,
                    entity_type.participant_id,
                    entity_type.participant_index,
                ],
                distinct=True
            ).fetch()
        if not separate:
            with open(os.path.join(data_dir, fname), 'w') as f:
                print 'fetching {}...'.format(fname)
                records = [
                    rec.to_dict() for rec in fetch_all(
                        entity_type.query().order(entity_type.date))
                ]
                json.dump(records, f, default=json_serial)
        else:
            for filter in filters:
                name = '{}.{}.{}.{}.json'.format(
                    filter.experiment_id or '',
                    filter.task_id or '',
                    filter.participant_id or '',
                    filter.participant_index or '',
                )
                with open(os.path.join(data_dir, name), 'w') as f:
                    records = [
                        rec.to_dict() for rec in fetch_all(
                            entity_type.query(
                                entity_type.experiment_id == filter.experiment_id,
                                entity_type.task_id == filter.task_id,
                                entity_type.participant_id == filter.participant_id,
                                entity_type.participant_index == filter.participant_index,
                            ).order(entity_type.start_time)
                        )
                    ]
                    json.dump(records, f, default=json_serial)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('project_id', help='Your Project ID.')

    args = parser.parse_args()

    main(args.project_id)
