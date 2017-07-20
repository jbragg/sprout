import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Tabs, Tab, FormGroup, FormControl, Well } from 'react-bootstrap';
import Markdown from '../components/Markdown';
import { editGeneralInstructions } from '../actions';

const propTypes = {
  onEditGeneralInstructions: PropTypes.func.isRequired,
  generalInstructions: PropTypes.string.isRequired,
  defaultActiveKey: PropTypes.number,
  help: PropTypes.bool,
};

const defaultProps = {
  defaultActiveKey: 0,
  help: true,
};

const itemRe = /@([0-9]+)/g;

const instructions = 'Your instructions for workers go here. Use twitter mention notation to reference items, for example, `@10` refers to item 10 and will preview as [](10). You may also use other types of [Markdown](http://commonmark.org/help/) to format your instructions, like `-` for bullet lists.';

const InstructionsEditor = ({
  generalInstructions, onEditGeneralInstructions, defaultActiveKey, help,
}) => (
  <div className="instructions-editor">
    {help ? <Markdown source={instructions} /> : null}
    <Tabs defaultActiveKey={defaultActiveKey} id="instructions-editor">
      <Tab eventKey={0} title="Write">
        <FormGroup>
          <FormControl
            componentClass="textarea"
            rows="6"
            value={generalInstructions}
            onChange={(e) => { onEditGeneralInstructions(e.target.value); }}
          />
        </FormGroup>
      </Tab>
      <Tab eventKey={1} title="Preview">
        <Well bsSize="sm">
          <Markdown source={generalInstructions.replace(itemRe, '[]($1)')} />
        </Well>
      </Tab>
    </Tabs>
  </div>
);

InstructionsEditor.propTypes = propTypes;
InstructionsEditor.defaultProps = defaultProps;

const mapStateToProps = state => ({
  generalInstructions: state.generalInstructions,
});

const mapDispatchToProps = dispatch => ({
  onEditGeneralInstructions: (markdown) => {
    dispatch(editGeneralInstructions(markdown));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(InstructionsEditor);
