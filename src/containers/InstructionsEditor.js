import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ReactMarkdown from 'react-markdown';
import { Panel, Tabs, Tab, FormGroup, FormControl } from 'react-bootstrap';
import { editGeneralInstructions } from '../actions';

const propTypes = {
  onEditGeneralInstructions: PropTypes.func.isRequired,
  generalInstructions: PropTypes.string.isRequired,
};

const InstructionsEditor = ({ generalInstructions, onEditGeneralInstructions }) => (
  <Panel
    header={<span>Improved instructions</span>}
  >
    <Tabs defaultActiveKey={0} id="instructions-editor">
      <Tab eventKey={0} title="Write">
        <FormGroup>
          <FormControl
            componentClass="textarea"
            rows="6"
            value={generalInstructions}
            onChange={(e) => { onEditGeneralInstructions(e.target.value); }}
          />
        </FormGroup>
        <span className="pull-right">
          <span>Supports </span>
          <a
            href="http://commonmark.org/help/"
            target="_blank"
            rel="noopener noreferrer"
          >
              Markdown
            </a>
        </span>
      </Tab>
      <Tab eventKey={1} title="Preview">
        <ReactMarkdown source={generalInstructions} />
      </Tab>
    </Tabs>
  </Panel>
);

InstructionsEditor.propTypes = propTypes;

const mapStateToProps = state => ({
  generalInstructions: state.generalInstructions,
});

const mapDispatchToProps = dispatch => ({
  onEditGeneralInstructions: (markdown) => {
    dispatch(editGeneralInstructions(markdown));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(InstructionsEditor);
