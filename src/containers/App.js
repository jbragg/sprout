import React from 'react';
import PropTypes from 'prop-types';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { parse } from 'query-string';
import { connect } from 'react-redux';
import { Grid, Row, Col, PanelGroup } from 'react-bootstrap';
import { ItemLargeContainer } from './ItemContainer';
import LabelSection from './LabelSection';
import Instructions from './Instructions';
import UnlabeledSection from '../components/UnlabeledSection';
import Countdown from './Countdown';
import CustomDragLayer from '../CustomDragLayer';
import Master from './Master';
import { fetchExperiment } from '../actions';
import conditions from '../experiment';
import { experimentReady as isReady } from '../reducers/index';

const propTypes = {
  experimentReady: PropTypes.bool.isRequired,
  labels: PropTypes.arrayOf(PropTypes.string.isRequired),
  currentItemId: PropTypes.number,
  initialize: PropTypes.func.isRequired,
  match: PropTypes.shape({
    params: PropTypes.object.isRequired,
  }).isRequired,
  location: PropTypes.shape({
    search: PropTypes.string.isRequired,
  }).isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      data: PropTypes.shape({
        path: PropTypes.string.isRequired,
      }).isRequired,
    }),
  ),
  useAnswers: PropTypes.bool,
  useReasons: PropTypes.bool,
  masterView: PropTypes.bool,
};

const defaultProps = {
  currentItemId: null,
  items: null,
  labels: null,
  useAnswers: true,
  useReasons: true,
  masterView: false,
};

class App extends React.Component {
  constructor(props) {
    super(props);
    const { initialize } = this.props;
    const params = {
      ...this.props.match.params,
      ...parse(this.props.location.search),
    };
    ['participantIndex', 'taskIndex', 'systemVersion'].forEach((key) => {
      if (params[key] != null) {
        params[key] = Number(params[key]);
      }
    });
    initialize(params);
  }

  render() {
    const { experimentReady, items, labels, ready, currentItemId, useAnswers, useReasons, masterView } = this.props;
    if (!experimentReady) {
      return (
        <Grid>
          <h1>Loading <span className="glyphicon glyphicon-refresh spinning" /></h1>
        </Grid>
      );
    } else if (masterView) {
      return <Grid fluid><Master /></Grid>;
    } else {
      return (
        <div id="app">
          <div className="hidden">
            {items.map(item => (
              <img src={item.data.path} key={item.id} />
            ))}
          </div>
          {currentItemId == null ? null : <CustomDragLayer />}
          <Grid fluid>
            <Col sm={4}>
              <Instructions />
              <Countdown />
            </Col>
            <Col sm={4}>
              <PanelGroup>
                <UnlabeledSection useReasons={useReasons} />
                {currentItemId == null ? null : (
                  <ItemLargeContainer
                    draggable
                    itemId={currentItemId}
                  />
                )}
              </PanelGroup>
            </Col>
            <Col sm={4}>
              <PanelGroup>
                {labels.map(label => <LabelSection label={label} key={label} />)}
              </PanelGroup>
            </Col>
          </Grid>
        </div>
      );
    }
  }
}

App.propTypes = propTypes;
App.defaultProps = defaultProps;

const mapStateToProps = (state, { location } ) => {
  const experimentReady = isReady(state);
  if (!experimentReady) {
    return { experimentReady };
  }
  return {
    experimentReady,
    labels: state.labels,
    items: [...state.entities.items.byId.values()],
    currentItemId: state.currentItemId,
    useAnswers: conditions[state.systemVersion].useAnswers,
    useReasons: conditions[state.systemVersion].useReasons,
    masterView: parse(location.search).master === undefined ? false : true,
  };
};

const mapDispatchToProps = dispatch => ({
  initialize: (params) => {
    dispatch(fetchExperiment(params));
  },
});

export default DragDropContext(HTML5Backend)(connect(mapStateToProps, mapDispatchToProps)(App));
