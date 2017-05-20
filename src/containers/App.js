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
import Loading from '../components/Loading';
import Countdown from './Countdown';
import Survey from './Survey';
import CustomDragLayer from '../CustomDragLayer';
import Master from './Master';
import { fetchExperiment, changeExperimentPhase } from '../actions';
import { itemDataSelector } from '../reducers/index';
import conditions from '../experiment';

const propTypes = {
  experimentState: PropTypes.string,
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
  onChangeExperimentPhase: PropTypes.func.isRequired,
  useAnswers: PropTypes.bool,
  useReasons: PropTypes.bool,
  masterView: PropTypes.bool,
};

const defaultProps = {
  experimentState: null,
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
    this.state = {
      date: Date.now(),
      ready: false,
    }
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

    this.handleImageLoaded = this.handleImageLoaded.bind(this);
  }

  componentDidMount() {
    this.timerID = setInterval(
      () => this.tick(),
      1000,
    );
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.experimentState !== 'loaded' && nextProps.experimentState === 'loaded') {
      this.setState({
        itemsLoaded: new Map(nextProps.items.map(item => [item.id, false])),
      });
    }
  }

  tick() {
    this.setState({ date: Date.now() });
  }

  handleImageLoaded(itemId) {
    this.setState((state, props) => {
      const itemsLoaded = new Map([
        ...state.itemsLoaded,
        [itemId, true],
      ]);
      const ready = [...itemsLoaded.values()].every(e => e);
      if (ready) {
        props.onChangeExperimentPhase('ready');
      }
      return { ready, itemsLoaded };
    });
  }

  render() {
    const { experimentState, items, labels, ready, currentItemId, useAnswers, useReasons, masterView } = this.props;
    if (experimentState === 'survey') {
      return <Grid><Survey /></Grid>;
    } else if (experimentState === 'thanks') {
      return <Grid><h1>Thanks!!</h1></Grid>
    } else if (masterView) {
      return <Grid fluid><Master /></Grid>;
    } else if (experimentState === 'loaded' || experimentState === 'ready') {
      return (
        <div id="app">
          <div className="hidden">
            {items.map(item => (
              <img
                src={item.data.path}
                key={item.id}
                onLoad={() => { this.handleImageLoaded(item.id); }}
              />
            ))}
          </div>
          {experimentState !== 'ready'
              ? <Grid><h1><Loading /></h1></Grid>
              : (
                <Grid fluid>
                  {currentItemId == null ? null : <CustomDragLayer />}
                  <Col sm={4}>
                    <Instructions />
                    <Countdown now={this.state.date} />
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
              )
          }
        </div>
      );
    } else {
      return <Grid><h1><Loading /></h1></Grid>;
    }
  }
}

App.propTypes = propTypes;
App.defaultProps = defaultProps;

const mapStateToProps = (state, { location } ) => {
  const { experimentState } = state;
  if (['loaded', 'ready', 'survey'].indexOf(experimentState) < 0) {
    return { experimentState };
  }
  return {
    experimentState,
    labels: state.labels,
    items: [...itemDataSelector(state).byId.values()],
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
  onChangeExperimentPhase: (phase) => {
    dispatch(changeExperimentPhase(phase));
  },
});

export default DragDropContext(HTML5Backend)(connect(mapStateToProps, mapDispatchToProps)(App));
