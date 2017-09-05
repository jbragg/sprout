import React from 'react';
import PropTypes from 'prop-types';
import { OrderedSet as Set } from 'immutable';
import { connect } from 'react-redux';
import { Tabs, Tab, FormGroup, FormControl, Well } from 'react-bootstrap';
import Markdown from '../components/Markdown';
import { editGeneralInstructions, recommendTestItems } from '../actions';
import { itemIdsSelector } from '../reducers/index';

const propTypes = {
  onEditGeneralInstructions: PropTypes.func.isRequired,
  onNewExamples: PropTypes.func.isRequired,
  generalInstructions: PropTypes.string.isRequired,
  help: PropTypes.bool,
  initialInstructions: PropTypes.string.isRequired,
  previewDefault: PropTypes.bool,
  itemIds: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
  secsUntilItemRecorded: PropTypes.number,
};

const defaultProps = {
  help: true,
  previewDefault: false,
  secsUntilItemRecorded: 2,
};

const itemRe = /@([0-9]+)/g;
const matchAll = (s) => {
  const re = new RegExp('@([0-9]+)', 'g');
  let match = re.exec(s);
  const arr = [];
  while (match != null) {
    arr.push(Number(match[1]));
    match = re.exec(s);
  }
  return arr;
};

const editorInstructions = `
Your instructions for workers go here.
Use twitter mention notation to reference items, for example, \`@10\` refers to item 10 and will preview as [](10).
You may also use other types of [Markdown](http://commonmark.org/help/) to format your instructions, like
- \`- This \`will be a list item
- This will be \`**bold**\`
`;

class InstructionsEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      examples: new Set(),
    };
    this.editInstructions = this.editInstructions.bind(this);
  }

  editInstructions(e) {
    const instructions = e.target.value;
    this.props.onEditGeneralInstructions(instructions);
    setTimeout(() => {
      this.setState((prevState, props) => {
        const latestExamples = new Set(matchAll(props.generalInstructions))
          .filter(v => props.itemIds.indexOf(v) >= 0);
        const examples = new Set(matchAll(instructions))
          .filter(v => latestExamples.has(v));
        const newExamples = examples
          .subtract(prevState.examples);
        if (newExamples.size > 0) {
          props.onNewExamples([...newExamples.values()]);
        }
        return { examples };
      });
    }, this.props.secsUntilItemRecorded * 1000);
  }

  render() {
    const {
      generalInstructions, help, initialInstructions, previewDefault,
    } = this.props;
    const versions = {
      0: initialInstructions,
      1: generalInstructions,
    };
    const editor = (
      <FormGroup>
        <Tabs defaultActiveKey={'1'} id="instructions-versions">
          {Object.keys(versions).map(i => (
            <Tab key={i} eventKey={i} title={`v${i}`}>
              <Tabs
                defaultActiveKey={i === '0' || previewDefault ? 'preview' : 'write'}
                id="instructions-editor"
              >
                <Tab eventKey="write" title="Write">
                  <FormControl
                    componentClass="textarea"
                    rows="12"
                    value={versions[i]}
                    readOnly={i === '0'}
                    onChange={i === '0' ? null : this.editInstructions}
                  />
                </Tab>
                <Tab eventKey="preview" title="Preview">
                  <div>
                    <Well bsSize="small">
                      <Markdown
                        source={versions[i].replace(itemRe, '[]($1)')}
                      />
                    </Well>
                  </div>
                </Tab>
              </Tabs>
            </Tab>
          ))}
        </Tabs>
      </FormGroup>
    );
    return (
      <div className="instructions-editor">
        {help ? <Markdown source={editorInstructions} /> : null}
        {editor}
      </div>
    );
  }
}

InstructionsEditor.propTypes = propTypes;
InstructionsEditor.defaultProps = defaultProps;

const mapStateToProps = state => ({
  generalInstructions: state.generalInstructions,
  initialInstructions: state.config.initialInstructions,
  itemIds: itemIdsSelector(state),
});

const mapDispatchToProps = {
  onEditGeneralInstructions: editGeneralInstructions,
  onNewExamples: recommendTestItems,
};

export default connect(mapStateToProps, mapDispatchToProps)(InstructionsEditor);
