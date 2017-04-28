import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { PanelGroup, Panel, FormGroup, FormControl, ControlLabel } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';
import { editGroup, editGeneralInstructions } from '../actions';

const propTypes = {
  onGroupEdit: PropTypes.func.isRequired,
  onEditGeneralInstructions: PropTypes.func.isRequired,
  initialInstructions: PropTypes.string.isRequired,
  generalInstructions: PropTypes.string.isRequired,
  finalLabels: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  labels: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
};

const Instructions = ({ finalLabels, labels, groups, onGroupEdit, onEditGeneralInstructions, initialInstructions, generalInstructions }) => (
  <PanelGroup>
    <Panel
      header="Customer's instructions"
    >
      <p>{initialInstructions}</p>
    </Panel>
    <Panel
      header="Improved instructions"
    >
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
    </Panel>
    <Panel
      header="Preview"
    >
      <ReactMarkdown source={generalInstructions} />
    </Panel>
  </PanelGroup>
);

Instructions.propTypes = propTypes;

const mapStateToProps = state => ({
  finalLabels: state.finalLabels,
  labels: state.labels,
  groups: [...state.entities.groups.byId.values()],
  initialInstructions: state.initialInstructions,
  generalInstructions: state.generalInstructions,
});

const mapDispatchToProps = dispatch => ({
  onGroupEdit: (groupId, keyValues) => {
    dispatch(editGroup(groupId, keyValues));
  },
  onEditGeneralInstructions: (markdown) => {
    dispatch(editGeneralInstructions(markdown));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Instructions);
