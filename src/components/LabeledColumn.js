import React from 'react';
import { PanelGroup } from 'react-bootstrap';
import LabelSection from '../containers/LabelSection';

export default ({ labels }) => (
  <PanelGroup className="labeled-column">
    {labels.map(label => <LabelSection label={label} key={label} />)}
  </PanelGroup>
);

