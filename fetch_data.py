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


def main(project_id, data_dir=DATA_DIR):
    """Fetch experiment data.

    Creates data_dir with the following files (JSON-serialized lists of
    entities):
    - demographics.json: model.Demographics entities.
    - treatments.json: model.Treatment entities.
    - trials.json: model.TrialResponse entities.
    - comments.json: model.Comments entities.
    - postsurvey.json: model.PostSurvey entities.

    """
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)

    remote_api_stub.ConfigureRemoteApiForOAuth(
        '{}.appspot.com'.format(project_id),
        '/_ah/remote_api')

    for entity_type, fname in [(model.Actions, 'actions.json')]:
        with open(os.path.join(data_dir, fname), 'w') as f:
            print 'fetching {}...'.format(fname)
            records = [
                rec.to_dict() for rec in fetch_all(entity_type.query())]
            json.dump(records, f, default=json_serial)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('project_id', help='Your Project ID.')

    args = parser.parse_args()

    main(args.project_id)
