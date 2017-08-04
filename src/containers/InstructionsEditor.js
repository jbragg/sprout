import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Tabs, Tab, FormGroup, FormControl, Well } from 'react-bootstrap';
import Markdown from '../components/Markdown';
import { editGeneralInstructions } from '../actions';

const propTypes = {
  onEditGeneralInstructions: PropTypes.func.isRequired,
  generalInstructions: PropTypes.string.isRequired,
  help: PropTypes.bool,
  initialInstructions: PropTypes.string.isRequired,
  preview: PropTypes.bool,
};

const defaultProps = {
  help: true,
  preview: true,
};

const itemRe = /@([0-9]+)/g;

const editorInstructions = `
Your instructions for workers go here.
Use twitter mention notation to reference items, for example, \`@10\` refers to item 10 and will preview as [](10).
You may also use other types of [Markdown](http://commonmark.org/help/) to format your instructions, like
- \`- This \`will be a list item
- This will be \`**bold**\`
`;

const InstructionsEditor = ({
  generalInstructions, onEditGeneralInstructions, help,
  initialInstructions, preview,
}) => {
  const versions = {
    0: initialInstructions,
    1: generalInstructions,
  };
  const editor = (
    <FormGroup>
      <Tabs defaultActiveKey={'1'} id="instructions-versions">
        {Object.keys(versions).map(i => (
          <Tab key={i} eventKey={i} title={`v${i}`}>
            <FormControl
              componentClass="textarea"
              rows="12"
              value={versions[i]}
              readOnly={i === '0'}
              onChange={i === '0' ? null : (
                (e) => { onEditGeneralInstructions(e.target.value); })
              }
            />
            {preview && (
              <div>
                <h3>Preview</h3>
                <Well bsSize="small">
                  <Markdown
                    source={versions[i].replace(itemRe, '[]($1)')}
                  />
                </Well>
              </div>
            )}
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
};

InstructionsEditor.propTypes = propTypes;
InstructionsEditor.defaultProps = defaultProps;

const mapStateToProps = state => ({
  generalInstructions: state.generalInstructions,
  initialInstructions: state.config.initialInstructions,
});

const mapDispatchToProps = dispatch => ({
  onEditGeneralInstructions: (markdown) => {
    dispatch(editGeneralInstructions(markdown));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(InstructionsEditor);
