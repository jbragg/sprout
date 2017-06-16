import React from 'react';
import { HotKeys } from 'react-hotkeys';
import App from '../containers/App';

const map = {
  preview: '1',
};

const RootApp = ({ location, match }) => (
  <HotKeys keyMap={map}>
    <App location={location} match={match} />
  </HotKeys>
);

export default RootApp;
