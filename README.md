## Installation

To install the front-end dependencies:
```
npm run install
```

To install the back-end dependencies (for experiment logging):
1. Install the [App Engine Python SDK](https://developers.google.com/appengine/downloads).
2. Install dependencies in the project's lib directory. Note: App Engine can only import libraries from inside your project directory.
```
pip install -r requirements.txt -t lib
```

In order to access the remote API to pull logs from the backend server, obtain a key from App Engine:
1. Go to the IAM & Admin -> Service accounts panel of the cloud console.
2. For the App Engine default service account, create a local `{FILENAME}.json` key by selecting Options -> Create key, where `{FILENAME}` is assigned by Google.
3. Set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable to point to this file, for instance by adding `export GOOGLE_APPLICATION_CREDENTIALS="{PATH/TO/FILENAME.json}"` to your `~/.bashrc`.

## Usage

To build a development bundle:
```
npm run build
```

To build a production bundle:
```
npm run build-prod
```

To continuously watch for and re-build on changes (useful for development):
```
npm run watch
```

To run this project locally from the command line (after building the front-end):
```
dev_appserver.py .
```
Visit the application at [http://localhost:8080/](http://localhost:8080/). See [the documentation](https://cloud.google.com/appengine/docs/standard/python/tools/local-devserver-command) for other options for `dev_appserver.py`.

## Deploying the back-end
To deploy the application:

1. Use the [Admin Console](https://appengine.google.com) to create a
   project/app id. (App id and project id are identical)
2. [Deploy the
   application](https://developers.google.com/appengine/docs/python/tools/uploadinganapp).

## Fetching experiment data

1. Export the PYTHONPATH environment variable for your Python directory, for example:
```
export PYTHONPATH=/usr/somedir/v3/bin/python2.7
```
Replace that path with the actual values for your python location.
2. Add your App Engine SDK for Python location to PYTHONPATH:
```
export GAE_SDK_ROOT="/usr/local/home/mydir/google_appengine"
export PYTHONPATH=${GAE_SDK_ROOT}:${PYTHONPATH}
```
Replace the SDK path shown above with your actual path to the App Engine SDK.
3. Export the GOOGLE_APPLICATION_CREDENTIALS environment variable as described [here](https://developers.google.com/identity/protocols/application-default-credentials#howtheywork).
4. Run this command
```
python fetch_data.py PROJECT_ID
```
Replace the project ID above with your actual project id. Data will be stored by default in `experiment_data/`.

Steps 1 through 3 are from [here](https://cloud.google.com/appengine/docs/python/tools/remoteapi#using_the_remote_api_in_a_local_client).

## Front-end input files
NOTE: File locations are temporary.

Experiment data
- location: `src/static/private/pilot_instructions_experiment.with_vec.json`
- NOTE: To add `cluster` and `vector` fields to an experiment data file, use `util/cluster.py`.
- format (in Orderly format, which can be compiled into JSONSchema):
```
object {
  object {
    string initial_instructions;
    array [
      object {
        integer id;
        integer cluster?;  # cluster item belongs to, based on vector embedding of worker answers
        array [
          integer*;
        ] vector?;  # aggregate embedding for answers associated with the item
        integer: subgroup?;  # ground truth cluster
        string: cls?;  # ground truth label
      }*;
    ] data;  # these are the items
  } data;
};
```

Worker answers
- location: `src/static/private/pilot_instructions_data_anon.json`
- format:
```
array [
  object {
    object {
      string answer;
      string unclear_type;
      string unclear_reason;
      integer questionid;
    } data;
  }*;
];
```
