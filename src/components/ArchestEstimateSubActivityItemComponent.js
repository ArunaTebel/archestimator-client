import React, {Component} from "react";
import {Col, Form, Row, Button, Modal} from "react-bootstrap";
import ArchestHttp from "../modules/archest_http";
import {BACKEND_ESTIMATOR_API_URL} from "../constants";

class ArchestEstimateSubActivityItemComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            parentActivityId: this.props.subActivity.parent_id,
            subActivityId: this.props.subActivity.id,
            ownerId: this.props.subActivity.owner ? this.props.subActivity.owner.id : '',
            subActivityName: this.props.subActivity.name,
            subActivityEstimatedTime: this.props.subActivity.estimated_time,
        };
        this.saveSubActivityData = this.saveSubActivityData.bind(this);
        this.deleteSubActivityActivityItem = this.deleteSubActivityActivityItem.bind(this);
        this.handleSubActivityFormFieldChange = this.handleSubActivityFormFieldChange.bind(this);
        this.showDeleteActivityModal = this.showDeleteActivityModal.bind(this);
        this.hideDeleteActivityModal = this.hideDeleteActivityModal.bind(this);
    }

    saveSubActivityData() {

        this.props.saveSubActivityItemCallback(this.state.subActivityId, {
            name: this.state.subActivityName,
            estimated_time: this.state.subActivityEstimatedTime,
            owner_id: this.state.ownerId
        });

    }

    handleSubActivityFormFieldChange(formElement) {
        const changedFormElement = formElement.target;
        this.setState({
            [changedFormElement.name]: this.getValidatedInput(changedFormElement),
        }, () => {
            if (changedFormElement.type === 'select-one') {
                changedFormElement.blur();
            }
            this.props.subActivityChangeHandler(this.state);
        });
    }

    getValidatedInput(changedFormElement) {
        let validatedInput = changedFormElement.value;
        if (changedFormElement.name === 'subActivityEstimatedTime' && parseFloat(changedFormElement.value) < 0) {
            validatedInput = Math.abs(changedFormElement.value);
        }
        return validatedInput;
    }

    deleteSubActivityActivityItem() {
        ArchestHttp.DELETE(BACKEND_ESTIMATOR_API_URL + "/sub_activities/" + this.state.subActivityId + "/", {}).then(
            (response) => this.props.removeSubActivityItemHandler(this.state.subActivityId, response)
        ).catch(function (error) {
            console.error(error);
        });
    }

    showDeleteActivityModal() {
        this.setState({showDeleteActivityModal: true});
    }

    hideDeleteActivityModal() {
        this.setState({showDeleteActivityModal: false});
    }

    render() {

        let resourcesOptions = [];

        if (this.props.estimateResources) {
            resourcesOptions = this.props.estimateResources.map(
                (estimateResource) => <option value={estimateResource.resource.id}
                                              key={estimateResource.resource.id}>{estimateResource.resource.full_name}</option>
            );
        }

        if (this.state.ownerId !== '') {
            let estimateResources = this.props.estimateResources.map((estimateResource) => parseInt(estimateResource.resource.id, 10));
            if (estimateResources.indexOf(parseInt(this.state.ownerId, 10)) === -1) {
                resourcesOptions.unshift(<option value={this.state.ownerId} key={this.state.ownerId}>{this.props.subActivity.owner.full_name}</option>);
            }
        }

        resourcesOptions.unshift(<option value={''} key={''}>{''}</option>);

        return (
            <Row>
                <Modal show={this.state.showDeleteActivityModal} onHide={this.hideDeleteActivityModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Confirmation</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>Do you really want to delete this Sub Activity?</Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.hideDeleteActivityModal}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={this.deleteSubActivityActivityItem}>
                            Delete
                        </Button>
                    </Modal.Footer>
                </Modal>
                <Col lg={9}>
                    <Form.Group controlId="subActivityForm.ActivityName"
                                className="archest-sub-activity-item-activity-name-form-group">
                        <Form.Control size="sm"
                                      as="textarea"
                                      rows="1"
                                      placeholder="Sub Activity"
                                      value={this.state.subActivityName}
                                      disabled={!this.props.subActivity.is_editable}
                                      name="subActivityName"
                                      onChange={this.handleSubActivityFormFieldChange}
                                      onBlur={this.saveSubActivityData}/>
                    </Form.Group>
                </Col>
                <Col lg={2}>
                    <Form.Group as={Row}
                                controlId={'subActivityForm.OwnerId_' + this.state.ownerId}
                                className="archest-sub-activity-item-activity-owner-form-group">
                        <Col>
                            <Form.Control
                                size="sm"
                                as="select"
                                value={this.state.ownerId}
                                disabled={!this.props.subActivity.is_editable}
                                name="ownerId"
                                onChange={this.handleSubActivityFormFieldChange}
                                onBlur={this.saveSubActivityData}>
                                {resourcesOptions}
                            </Form.Control>
                        </Col>
                    </Form.Group>
                </Col>
                <Col lg={1} className="archest-sub-activity-item-activity-estimated-time-col">
                    <Row>
                        <Form.Group controlId="subActivityForm.ActivityName"
                                    className="archest-sub-activity-item-activity-estimated-time-form-group">
                            <Form.Control size="sm"
                                          type="number"
                                          placeholder="Hrs."
                                          value={this.state.subActivityEstimatedTime}
                                          disabled={!this.props.subActivity.is_editable}
                                          name="subActivityEstimatedTime"
                                          onChange={this.handleSubActivityFormFieldChange}
                                          onBlur={this.saveSubActivityData}/>
                        </Form.Group>
                        <span onClick={this.showDeleteActivityModal} hidden={!this.props.subActivity.is_editable}
                              className="oi oi-x archest-sub-activity-item-delete-btn"/>
                    </Row>
                </Col>
            </Row>
        );
    }
}

export default ArchestEstimateSubActivityItemComponent;
