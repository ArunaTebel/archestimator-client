import React, {Component} from "react";
import ArchestAuthEnabledComponent from "./ArchestAuthEnabledComponent";
import ArchestMainContainerComponent from "./ArchestMainContainerComponent";
import ArchestHttp from "../modules/archest_http";
import {BACKEND_ESTIMATOR_API_URL} from "../constants";
import {Button, Card, Col, Form} from "react-bootstrap";
import ArchestWidgetMultiSelect from "./ArchestWidgetMultiSelect";
import ArchestCrudListComponent from "./lib/util/ArchestCrudListComponent";

const _ = require('lodash');

class ArchestEditPhaseComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            project: {name: ''},
            phase: {},
            phaseFeatures: [],
            resources: [],
            managers: [],
            formValues: {
                'project': '',
                'name': '',
                'start_date': '',
                'end_date': '',
                'project_managers': [],
                'project_resources': [],
            },
            breadcrumbs: [],
            loading: true,
        };
        this.handleActivityFormFieldChange = this.handleActivityFormFieldChange.bind(this);
        this.savePhaseData = this.savePhaseData.bind(this);
        this.addNewPhaseFeature = this.addNewPhaseFeature.bind(this);
        this.onPhaseFeatureSave = this.onPhaseFeatureSave.bind(this);
        this.deleteSelectedItemsCallback = this.deleteSelectedItemsCallback.bind(this);
    }

    componentDidMount() {
        const phaseId = this.props.match.params.phaseId;
        this.init(phaseId);
    }

    init(phaseId) {
        const requestConfigs = [
            {
                name: 'phase',
                url: `${BACKEND_ESTIMATOR_API_URL}/phases/${phaseId}/`,
                params: {}
            },
            {
                name: 'phaseFeatures',
                url: `${BACKEND_ESTIMATOR_API_URL}/phases/${phaseId}/features/`,
                params: {}
            },
            {
                name: 'resources',
                url: `${BACKEND_ESTIMATOR_API_URL}/resources/`,
                params: {}
            },
        ];

        ArchestHttp.BATCH_GET(requestConfigs, (responses) => {
            const phase = responses.phase.data;
            const resources = responses.resources.data.results;
            const phaseFeatures = responses.phaseFeatures.data.results;

            this.setState({
                project: phase.project,
                phase: phase,
                phaseFeatures: phaseFeatures,
                resources: resources,
                formValues: {
                    name: phase.name,
                    start_date: phase.start_date ? phase.start_date : '',
                    end_date: phase.end_date ? phase.end_date : '',
                    project_managers: phase.managers,
                    project_resources: phase.resources,
                },
                breadcrumbs: [
                    {title: 'Home', url: '/'},
                    {title: 'Projects', url: '/projects'},
                    {title: `Phases of ${phase.project.name}`, url: '/projects/' + phase.project.id + '/phases/'},
                    {title: phase.name, url: '#', active: true},
                ],
                loading: false,
            })
        });
    }

    savePhaseData() {
        this.setState({loading: true});
        let values = this.state.formValues;
        values['resource_ids'] = _.map(values.project_resources, (resource) => parseInt(resource.id, 10));
        values['manager_ids'] = _.map(values.project_managers, (manager) => parseInt(manager.id, 10));
        ArchestHttp.PATCH(`${BACKEND_ESTIMATOR_API_URL}/phases/${this.state.phase.id}/`, values).then((response) => {
            let phase = response.data;
            this.init(phase.id);
        }).catch((error) => {
            console.log(error);
        });
    }

    handleActivityFormFieldChange(eventData, extraData = null) {

        let formFieldName = '';
        let formFieldValue = '';

        if (extraData) {
            formFieldName = extraData.name;
            formFieldValue = eventData;
        } else {
            formFieldName = eventData.target.name;
            formFieldValue = eventData.target.value;
        }

        this.setState(
            {
                formValues: {...this.state.formValues, [formFieldName]: formFieldValue}
            }
        );
    }

    deleteSelectedItemsCallback(featurePhaseIds) {

        ArchestHttp.PATCH(`${BACKEND_ESTIMATOR_API_URL}/features/batch_delete_features/`, {featureIds: featurePhaseIds}).then((response) => {
            ArchestHttp.BATCH_GET([{
                name: 'phaseFeatures',
                url: `${BACKEND_ESTIMATOR_API_URL}/phases/${this.state.phase.id}/features/`,
                params: {}
            }], (responses) => {
                this.setState({
                    phaseFeatures: responses.phaseFeatures.data.results
                });
            });
        }).catch(function (error) {
            console.log(error);
        });

    }

    addNewPhaseFeature() {
        const newState = Object.assign({}, this.state);
        newState.phaseFeatures.push({id: '', name: ''});
        this.setState(newState);
    }

    render() {
        let phaseFeaturesListItems = Object.assign({}, ...this.state.phaseFeatures.map(phaseFeature => ({[phaseFeature.id]: phaseFeature})));

        let phaseFeaturesListHeaders = {
            name: {title: 'Name', cellConfig: {type: 'text-input'}},
        };

        let phaseFeaturesCrudListComponent = <div/>;

        if (!this.state.loading) {
            phaseFeaturesCrudListComponent = <ArchestCrudListComponent
                title={'Activities of ' + this.state.phase.name}
                headers={phaseFeaturesListHeaders}
                items={phaseFeaturesListItems}
                rowSaveCallback={this.onPhaseFeatureSave}
                addNewItemCallback={this.addNewPhaseFeature}
                deleteSelectedItemsCallback={this.deleteSelectedItemsCallback}
            />
        }

        return (
            <ArchestAuthEnabledComponent>
                <ArchestMainContainerComponent breadcrumbs={this.state.breadcrumbs} loading={this.state.loading}>
                    <Card className="archest-card">
                        <Card.Body className="archest-card-body">
                            <Form>
                                <Form.Row>
                                    <Col lg={2}>
                                        <Form.Group controlId="archestPhaseEdit.project">
                                            <Form.Label>Project Name</Form.Label>
                                            <Form.Control
                                                disabled={true}
                                                size={'sm'}
                                                name={'project'}
                                                value={this.state.project.name}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col lg={6}>
                                        <Form.Group controlId="archestPhaseEdit.name">
                                            <Form.Label>Phase Name</Form.Label>
                                            <Form.Control
                                                size={'sm'}
                                                name={'name'}
                                                value={this.state.formValues['name']}
                                                onChange={this.handleActivityFormFieldChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col lg={2}>
                                        <Form.Group controlId="archestPhaseEdit.startDate">
                                            <Form.Label>Start Date</Form.Label>
                                            <Form.Control
                                                type={'date'}
                                                size={'sm'}
                                                name={'start_date'}
                                                value={this.state.formValues['start_date']}
                                                onChange={this.handleActivityFormFieldChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col lg={2}>
                                        <Form.Group controlId="archestPhaseEdit.endDate">
                                            <Form.Label>End Date</Form.Label>
                                            <Form.Control
                                                type={'date'}
                                                size={'sm'}
                                                name={'end_date'}
                                                value={this.state.formValues['end_date']}
                                                onChange={this.handleActivityFormFieldChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Form.Row>
                                <Form.Row>
                                    <Col lg={6}>
                                        <Form.Group controlId="archestPhaseEdit.projectManagers">
                                            <Form.Label>Project Managers</Form.Label>
                                            <ArchestWidgetMultiSelect
                                                name={'project_[];managers'}
                                                onChange={this.handleActivityFormFieldChange}
                                                values={this.state.formValues.project_managers}
                                                options={this.state.resources}
                                                valueGetter={'id'}
                                                labelGetter={'full_name'}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col lg={6}>
                                        <Form.Group controlId="archestPhaseEdit.projectResources">
                                            <Form.Label>Project Resources</Form.Label>
                                            <ArchestWidgetMultiSelect
                                                name={'project_resources'}
                                                onChange={this.handleActivityFormFieldChange}
                                                values={this.state.formValues.project_resources}
                                                options={this.state.resources}
                                                valueGetter={'id'}
                                                labelGetter={'full_name'}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Form.Row>
                                <Button variant="primary" type="button" size={'sm'} onClick={this.savePhaseData}>
                                    Save
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                    {phaseFeaturesCrudListComponent}
                </ArchestMainContainerComponent>
            </ArchestAuthEnabledComponent>
        );
    }

    onPhaseFeatureSave(phaseFeatureId, updatedPhaseFeatureData, originalPhaseFeatureData) {

        const newState = Object.assign({}, this.state);

        if (phaseFeatureId) {

            ArchestHttp.PATCH(`${BACKEND_ESTIMATOR_API_URL}/features/${phaseFeatureId}/`, updatedPhaseFeatureData).then((response) => {

                for (let i = 0; i < newState.phaseFeatures.length; i++) {
                    if (newState.phaseFeatures[i].id === phaseFeatureId) {
                        newState.phaseFeatures[i].name = updatedPhaseFeatureData.name;
                        break;
                    }
                }
                this.setState(newState);

            }).catch((error) => {
                console.log(error);
            });

        } else {
            updatedPhaseFeatureData.phase_id = this.state.phase.id;

            ArchestHttp.POST(`${BACKEND_ESTIMATOR_API_URL}/features/`, updatedPhaseFeatureData).then((response) => {

                for (let i = 0; i < newState.phaseFeatures.length; i++) {
                    if (newState.phaseFeatures[i].id === '') {
                        newState.phaseFeatures[i] = response.data;
                        break;
                    }
                }
                this.setState(newState);

            }).catch((error) => {
                console.log(error);
            });
        }
    }
}

export default ArchestEditPhaseComponent;
