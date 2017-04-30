import React from 'react';
import PropTypes from 'prop-types';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { parse } from 'query-string';
import { connect } from 'react-redux';
import { Grid, Row, Col, PanelGroup } from 'react-bootstrap';
import DrillDownContainer from './DrillDownContainer';
import LabelSection from './LabelSection';
import Instructions from './Instructions';
import SimilarItemList from './SimilarItemList';
import Progress from './Progress';
import CustomDragLayer from '../CustomDragLayer';
import { fetchExperiment } from '../actions';

const propTypes = {
  labels: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  experimentState: PropTypes.string,
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
  ).isRequired,
};

const defaultProps = {
  experimentState: null,
  currentItemId: null,
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
    const { items, labels, experimentState, currentItemId } = this.props;
    return (
      experimentState !== 'loaded'
      ? (
        <div className="container">
          <h1>Loading <span className="glyphicon glyphicon-refresh spinning" /></h1>
        </div>
      )
      : (
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
            </Col>
            <Col sm={4}>
              <PanelGroup>
                <Progress />
                {currentItemId == null ? null : <SimilarItemList />}
                {currentItemId == null ? null : <DrillDownContainer />}
              </PanelGroup>
            </Col>
            <Col sm={4}>
              <div>
                <strong>Crowd answer</strong>
                <img
                  src="/static/RdYlGn.png"
                  height="20"
                  width="100%"
                />
                <Row>
                  <Col
                    className="no-gutter"
                    sm={4}
                  >
                    <div>-1</div>
                    <div>No</div>
                  </Col>
                  <Col
                    className="no-gutter text-center"
                    sm={4}
                  >
                    <div>0</div>
                    <div>Maybe</div>
                  </Col>
                  <Col
                    className="no-gutter text-right"
                    sm={4}
                  >
                    <div>1</div>
                    <div>Yes</div>
                  </Col>
                </Row>
              </div>
              <PanelGroup>
                {labels.map(label => <LabelSection label={label} key={label} />)}
              </PanelGroup>
            </Col>
          </Grid>
        </div>
      )
    );
  }
}

App.propTypes = propTypes;
App.defaultProps = defaultProps;

const mapStateToProps = state => ({
  labels: state.labels,
  items: [...state.entities.items.byId.values()],
  currentItemId: state.currentItemId,
  experimentState: state.experimentState,
});

const mapDispatchToProps = dispatch => ({
  initialize: (params) => {
    dispatch(fetchExperiment(params));
  },
});

export default DragDropContext(HTML5Backend)(connect(mapStateToProps, mapDispatchToProps)(App));
