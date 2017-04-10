import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ReactMarkdown from 'react-markdown';
import { editGroup, editGeneralInstructions } from '../actions';

const propTypes = {
  onGroupEdit: PropTypes.func.isRequired,
  onEditGeneralInstructions: PropTypes.func.isRequired,
  initialInstructions: PropTypes.string.isRequired,
  generalInstructions: PropTypes.string.isRequired,
  finalLabels: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
};

const Instructions = ({ finalLabels, groups, onGroupEdit, onEditGeneralInstructions, initialInstructions, generalInstructions }) => (
  <div className="row">
    <div className="col-sm-6">
      <div className="panel panel-default">
        <div className="panel-heading"><strong>Worker Instructions</strong></div>
        <div className="panel-body">
          <form
            className="form"
            onSubmit={(e) => { e.preventDefault(); }}
          >
            {finalLabels.map(label => (
              <div key={label}>
                <h2>{label}:</h2>
                {groups.filter(group => group.label === label).map(group => (
                  <div className="form-group" key={group.id}>
                    <div className="input-group">
                      <span className="input-group-addon">
                        <input
                          type="checkbox"
                          checked={group.inInstructions}
                          onChange={(e) => {
                            onGroupEdit(
                              group.id,
                              { inInstructions: e.target.checked },
                            );
                          }}
                        />
                      </span>
                      <span className="input-group-addon">{group.name}</span>
                      <input
                        className="form-control"
                        type="text"
                        value={group.description}
                        onChange={(e) => {
                          onGroupEdit(
                            group.id,
                            { description: e.target.value },
                          );
                        }}
                        placeholder="Describe group to worker"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <div className="form-group">
              <label>General Instructions:</label>
              <span className="pull-right">
                <span>Supports </span>
                <a
                  href="http://commonmark.org/help/"
                  target="_blank"
                >
                  Markdown
                </a>
              </span>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Use this space for instructions that don't fit in any single group, or to call attention to common mistakes."
                value={generalInstructions || ''}
                onChange={(e) => { onEditGeneralInstructions(e.target.value); }}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
    <div className="col-sm-6">
      <div className="panel panel-default">
        <div className="panel-heading"><strong>What Workers Will See</strong></div>
        <div className="panel-body">
          <p>{initialInstructions}</p>
          {finalLabels.map(label => (
            <div key={label}>
              <p>The following categories should be marked <strong>{label}</strong>:</p>
              <ul>
                {groups
                    .filter(group => group.label === label && group.inInstructions)
                    .map(group => (
                      <li key={group.id}>{group.description || group.name}</li>
                    ))
                }
              </ul>
            </div>
          ))}
          <ReactMarkdown source={generalInstructions} />
        </div>
      </div>
    </div>
  </div>
);

Instructions.propTypes = propTypes;

const mapStateToProps = state => ({
  finalLabels: state.finalLabels,
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
