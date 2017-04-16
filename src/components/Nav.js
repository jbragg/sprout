import React from 'react';
import EditColor from '../containers/EditColor';
import Oracle from '../containers/Oracle';

const Nav = () => (
  <nav className="navbar navbar-default">
    <div className="container-fluid">
      <div className="navbar-header">
        <span className="navbar-brand">SYSNAME</span>
      </div>
      <EditColor />
      <Oracle />
    </div>
  </nav>
);

export default Nav;
