import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Nav, NavItem } from 'react-bootstrap';
import Oracle from '../containers/Oracle';
import EditColor from '../containers/EditColor';
import { setView } from '../actions';

const propTypes = {
  view: PropTypes.string.isRequired,
  onSetView: PropTypes.func.isRequired,
};

const Navbar = ({ view, onSetView }) => (
  <div className="container-fluid">
    <Nav
      bsStyle="tabs"
      activeKey={view}
      onSelect={(key) => { onSetView(key); }}
    >
      <NavItem eventKey="labeling">Labeling</NavItem>
      <NavItem eventKey="instructions">Instructions</NavItem>
      <EditColor />
      <Oracle />
    </Nav>
  </div>
);

Navbar.propTypes = propTypes;

const mapStateToProps = state => ({
  view: state.view,
});

const mapDispatchToProps = dispatch => ({
  onSetView: (view) => {
    dispatch(setView(view));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Navbar);
