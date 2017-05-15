import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ReactMarkdown from 'react-markdown';
import { Tabs, Tab, FormGroup, FormControl, Clearfix } from 'react-bootstrap';
import { editGeneralInstructions } from '../actions';

const propTypes = {
  onEditGeneralInstructions: PropTypes.func.isRequired,
  generalInstructions: PropTypes.string.isRequired,
  defaultActiveKey: PropTypes.number,
};

const defaultProps = {
  defaultActiveKey: 0,
};

const InstructionsEditor = ({ generalInstructions, onEditGeneralInstructions, defaultActiveKey }) => (
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
      <Clearfix>
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
      </Clearfix>
    </Tab>
    <Tab eventKey={1} title="Preview">
      <ReactMarkdown source={generalInstructions} />
    </Tab>
  </Tabs>
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
