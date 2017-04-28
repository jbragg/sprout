import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Navbar, Nav, NavItem } from 'react-bootstrap';
import Oracle from '../containers/Oracle';
import EditColor from '../containers/EditColor';
import { setView } from '../actions';

const propTypes = {
  view: PropTypes.string.isRequired,
  onSetView: PropTypes.func.isRequired,
};

const AppNavbar = ({ view, onSetView, unlabeledItems, labeledItems}) => (
  <div className="container-fluid">
    <Navbar fluid>
      <EditColor />
      <Oracle />
    </Navbar>
  </div>
);

AppNavbar.propTypes = propTypes;

const mapStateToProps = state => ({
  view: state.view,
});

const mapDispatchToProps = dispatch => ({
  onSetView: (view) => {
    dispatch(setView(view));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(AppNavbar);
