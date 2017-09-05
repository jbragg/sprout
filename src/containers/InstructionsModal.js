import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Row, Col, Panel, FormGroup, ControlLabel, Modal, Button } from 'react-bootstrap';
import InstructionsEditor from '../containers/InstructionsEditor';
import AnswerFormControl from '../containers/AnswerFormControl';
import ReasonFormControl from '../containers/ReasonFormControl';
import { ItemLargeContainer } from '../containers/ItemContainer';
import { itemLabelsSelector } from '../reducers/index';
import { editItem } from '../actions';
import ExplanationTips from '../components/ExplanationTips';

const propTypes = {
  show: PropTypes.bool.isRequired,
  item: PropTypes.shape({
    id: PropTypes.number.isRequired,
    reason: PropTypes.shape({
      label: PropTypes.string,
      text: PropTypes.string,
    }),
  }),
  itemLabel: PropTypes.string,
  finalLabels: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  onEditItem: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  labelOutside: PropTypes.bool.isRequired,
};

const defaultProps = {
  item: null,
  itemLabel: null,
};

class InstructionsModal extends React.Component {
  constructor(props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onSubmit() {
    /*
     * Fire edit item label on closing modal in case no edits made.
     */
    this.props.onEditItem({
      reason: {
        text: '',
        ...this.props.item.reason,
        label: this.props.itemLabel,
      },
    });
  }

  render() {
    const {
      show, item, itemLabel, onSubmit, finalLabels, labelOutside,
    } = this.props;
    const canEdit = item != null && (!labelOutside || finalLabels.indexOf(itemLabel) >= 0);
    return (
      <Modal show={show}>
        <Modal.Body>
          {!canEdit
            ? (
              <p>You must label the item {finalLabels.join(' / ')} before you can edit an explanation</p>
            )
            : (
              <div>
                {labelOutside && (
                  <p>Explain to a worker why this item should be labeled <strong>{itemLabel}</strong>.</p>
                )}
                <p>Suggestions for good explanations:</p>
                <ExplanationTips />
                <p>Your explanation will be used to teach workers after they answer this question. You may also edit your instructions here if you choose.</p>
                <h1>Task</h1>
                <Panel header={<h4>Instructions</h4>}>
                  <InstructionsEditor help={false} previewDefault />
                </Panel>
                <Row>
                  <Col sm={6}>
                    <ItemLargeContainer
                      itemId={item.id}
                      useAnswers={false}
                      useReasons={false}
                      zoomable={false}
                    />
                  </Col>
                  <Col sm={6}>
                    {!labelOutside && (
                      <FormGroup>
                        <ControlLabel>Your answer:</ControlLabel>
                        <AnswerFormControl itemId={item.id} />
                      </FormGroup>
                    )}
                    <FormGroup>
                      <ControlLabel>Your explanation:</ControlLabel>
                      <ReasonFormControl
                        itemId={item.id}
                        placeholder={
                          labelOutside
                            ? `Explain why the answer is ${itemLabel}`
                            : 'Explain your answer'
                        }
                      />
                    </FormGroup>
                  </Col>
                </Row>
              </div>
            )
          }
        </Modal.Body>
        <Modal.Footer>
          {!canEdit
            ? (
              <Button onClick={onSubmit}>
                Ok
              </Button>
            )
            : (
              <Button
                bsStyle="primary"
                onClick={() => {
                  this.onSubmit();
                  onSubmit();
                }}
              >
                Done
              </Button>
            )
          }
        </Modal.Footer>
      </Modal>
    );
  }
}

InstructionsModal.propTypes = propTypes;
InstructionsModal.defaultProps = defaultProps;

const mapStateToProps = (state, { itemId }) => ({
  item: itemId == null ? null : state.entities.items.byId.get(itemId),
  itemLabel: itemId == null ? null : itemLabelsSelector(state).get(itemId),
  finalLabels: state.config.finalLabels,
});

const mapDispatchToProps = (dispatch, { itemId }) => ({
  onEditItem: (keyValues) => {
    dispatch(editItem(itemId, keyValues));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(InstructionsModal);
