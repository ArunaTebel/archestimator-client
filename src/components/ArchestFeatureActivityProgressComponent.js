import React, {Component} from "react";
import {Col, OverlayTrigger, ProgressBar, Row, Tooltip} from "react-bootstrap";
import ArchestFeatureSubActivityProgressComponent from "./ArchestFeatureSubActivityProgressComponent";
import {ACTIVITY} from "../constants";
import ArchestActivityStatusChangeWidgetComponent from "./ArchestActivityStatusChangeWidgetComponent";

const _ = require('lodash');

class ArchestFeatureActivityProgressComponent extends Component {

    render() {
        let activity = this.props.activity;
        let subActivityComponents = _.map(
            activity.sub_activities,
            subActivity => <ArchestFeatureSubActivityProgressComponent key={subActivity.id} subActivity={subActivity}
                                                                       showWorkEntriesCallback={this.props.showWorkEntriesCallback}/>
        );
        return (
            <Row className='archest-feature-progress-activity-container'>
                <Col lg={12}>
                    <Row className='archest-feature-progress-activity'>
                        <Col lg={5} className='archest-feature-progress-activity-name'>
                            {activity.name}
                        </Col>
                        <Col lg={2} className='archest-feature-progress-activity-completion'>
                            <OverlayTrigger placement="top" overlay={
                                <Tooltip variant='primary'>{activity.completion_percentage}</Tooltip>
                            }>
                                <ProgressBar striped variant="success" now={activity.completion_percentage}/>
                            </OverlayTrigger>
                        </Col>
                        <Col lg={2} className='archest-feature-progress-activity-owner'>
                            {activity.owner}
                        </Col>

                        <Col lg={2}>
                            <Row>
                                <Col lg={4} className='archest-feature-progress-activity-estimated'>
                                    {activity.estimated_time}
                                </Col>
                                <Col lg={4} className='archest-feature-progress-activity-entered'>
                                    <OverlayTrigger placement="top" overlay={
                                        <Tooltip variant='primary'>
                                            Activity {activity.entered_time_directly_to_activity} Hrs, Sub
                                            Activities {activity.entered_time_to_sub_activities} Hrs
                                        </Tooltip>
                                    }>

                                        <p onClick={() => this.props.showWorkEntriesCallback(activity, ACTIVITY)}>
                                            <strong>{activity.total_entered_time}</strong>
                                        </p>
                                    </OverlayTrigger>
                                </Col>
                                <Col lg={4} className={
                                    activity.remaining_time < 0 ?
                                        'archest-feature-progress-activity-remaining-danger' : 'archest-feature-progress-activity-remaining'
                                }>
                                    {activity.remaining_time}
                                </Col>
                            </Row>
                        </Col>


                        <Col lg={1} className='archest-feature-progress-activity-actions'>
                            <ArchestActivityStatusChangeWidgetComponent activity={activity} type={ACTIVITY}/>
                        </Col>
                    </Row>
                    {subActivityComponents}
                </Col>
            </Row>
        );
    }

}

export default ArchestFeatureActivityProgressComponent;