# Sprout

For more details about the interface configurations and their evalutions, see the related paper:
- Jonathan Bragg, Mausam, and Daniel S. Weld. [Sprout: Crowd-Powered Task Design for Crowdsourcing](https://aiweb.cs.washington.edu/ai/pubs/bragg-uist18.pdf). In Proceedings of the 31st ACM User Interface Software and Technology Symposium (UIST '18). 2018. To appear.

## Installation

To install the front-end dependencies:
```
npm install
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

To install utility dependencies (for preparing data files and performing analysis locally):
```
conda env install -f util/environment.yml -n {ENVIRONMENT_NAME}
```
You can also choose to use `util/environment_dev.yml` for useful development dependencies.

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


### Getting started
Four sample starting configurations are included (and defined in `src/config.js`). Two of these are tutorials:
- [http://localhost:8080/?taskId=sampleStructuredLabeling](http://localhost:8080/?taskId=sampleStructuredLabeling)
- [http://localhost:8080/?taskId=sampleStructuredLabelingTutorial](http://localhost:8080/?taskId=sampleStructuredLabelingTutorial)
- [http://localhost:8080/?taskId=sampleSprout](http://localhost:8080/?taskId=sampleSprout)
- [http://localhost:8080/?taskId=sampleSproutTutorial](http://localhost:8080/?taskId=sampleSproutTutorial)


### Config
Specify `src/config.js` to define your own tasks. For example:
```javascript
export default {
  tasks: [
    [taskId]: {
      experimentPath: {path/to/experiment/file},
      answersPath: {path/to/answers/file},
      itemRootPath: {path/to/root/path/for/images},
      initialInstructions: 'instructions go here',
      tutorial: false,
    },
  ],
  experiments: {
    [experimentId]: {
      tutorial: {taskIdTutorial},
      tasks: [{taskId1}, {taskId2}, {taskId3}],
    }
  },
};
```
If taskIndex or tutorial are specified but not experimentId, experimentId defaults to "default".

### Website usage
url parameters: `/:taskIndex?/:participantIndex?`
all parameters:
- `systemVersion={0,1,2}`
- `taskIndex={0,1,2}`
- `tutorial?`
- `taskId={:str}`
- `experimentId={:str}`
- `participantId={:str}`: useful for tracking a participant outside a study


## Deploying the back-end
To deploy the application:

1. Use the [Admin Console](https://appengine.google.com) to create a
   project/app id. (App id and project id are identical)
2. [Deploy the
   application](https://developers.google.com/appengine/docs/python/tools/uploadinganapp).

## Fetching experiment data for analysis

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

Use `util/analyze.py` to generate analysis for experiment records.

## Front-end input files
NOTE: File locations are temporary.

Experiment data
- NOTE: To add `cluster` and `vector` fields to an experiment data file, use `util/cluster.py`.
- format (in Orderly format, which can be compiled into JSONSchema):
```
object {
  array [
    object {
      integer id?;  # defaults to position in array
      integer cluster?;  # cluster item belongs to, based on vector embedding of worker answers
      boolean exemplar?;  # exemplar for cluster
      array [
        integer*;
      ] vector?;  # aggregate embedding for answers associated with the item
      object {
        string: path;
        object {
        } query?;
      } data;
    }*;
  ] data;  # these are the items
};
```

Worker answers
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

Saved state
- format:
```
object {
  string: instructions?  # Instructions text
  array [
    object {
      integer id;
      array [
        integer*;
      ] itemIds?;  # Ordered list of items in group
      string label;
      string name;
    }*;
  ] groups?;
  array [
    object {
      integer id;
      integer label?;
      integer group?;
      object {
        string label;
        string text;
      } reason?;
      boolean test?;
    }*;
  ] items?;
};
```
