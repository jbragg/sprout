## Installation

To install:
```
npm run install
```

## Usage

To build a development bundle:
```
npm run build
```

To run a light-weight server:
```
npm run dev
```

To continuously watch for and re-build on changes:
```
npm run watch
```

## Input files
Experiment data
- location: `src/static/private/pilot_instructions_experiment.json`
- format (in Orderly format, which can be compiled into JSONSchema):
```
object {
  object {
    string initial_instructions;
    array [
      object {
        integer id;
        integer cluster?;  # cluster item belongs to, based on vector embedding of worker answers
        integer: label?;  # ground truth label for customer value
        array [
          integer*;
        ] vector?;  # aggregate embedding for answers associated with the item
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
    string answer;
    string unclear_type;
    string unclear_reason;
  }*;
];
```
