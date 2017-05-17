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

const instructions = 'Your instructions for workers go here. To reference an item, use the notation `[](itemid)`. For example, `[](0)` refers to item 0 and will preview as [](0). You may also use other types of [Markdown](http://commonmark.org/help/).';

const InstructionsEditor = ({ generalInstructions, onEditGeneralInstructions, defaultActiveKey, help }) => (
  <div>
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
          <Markdown source={generalInstructions} />
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
