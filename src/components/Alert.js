import React from 'react';
import { Alert as BSAlert } from 'react-bootstrap';

const Alert = ({ children }) => (
  <BSAlert bsStyle="danger">
    <span className="glyphicon glyphicon-exclamation-sign" aria-hidden />
    <span className="sr-only">Error:</span>
    {' '}
    {children}
  </BSAlert>
);

export default Alert;
