import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

const propTypes = {
  json: PropTypes.string.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.arrayOf(PropTypes.node),
  ]),
};

const defaultProps = {
  children: null,
};

const Export = ({ json, children }) => (
  <a
    href={`data:text/json;charset=utf-8,${encodeURIComponent(json)}`}
    download="labels.json"
  >
    {children}
  </a>
);

Export.propTypes = propTypes;
Export.defaultProps = defaultProps;

const mapStateToProps = state => ({
  json: JSON.stringify({
    instructions: state.generalInstructions,
    groups: state.entities.groups.byId.toArray(),
    items: state.entities.items.byId.toArray(),
  }),
});

export default connect(mapStateToProps)(Export);
