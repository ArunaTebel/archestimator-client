import React, {Component} from "react";
import {Card, Form, OverlayTrigger, Table, Tooltip} from "react-bootstrap";
import '../styles/ArchestCrudListComponent.scss';

const _ = require('lodash');

class ArchestCrudListComponent extends Component {

    constructor(props) {
        super(props);

        this.state = {
            items: {},
            uniqueKey: props.uniqueKey ? props.uniqueKey : 'id',
            hasSelectableRows: props.hasOwnProperty('hasSelectableRows') ? props.hasSelectableRows : true,
            hasSavePerRow: props.hasOwnProperty('hasSavePerRow') ? props.hasSavePerRow : true,
        };

        this.state.items = this.getItemsObject(props.items);
    }

    getItemsObject(items) {
        let itemsObject = {};
        const clonedItems = _.cloneDeep(items);
        for (let i = 0; i < clonedItems.length; i++) {
            itemsObject[clonedItems[i][this.state.uniqueKey]] = clonedItems[i];
        }
        return itemsObject;
    }

    getTableHeaders() {

        const headerKeys = Object.keys(this.props.headers);

        let tableHeaders = _.map(headerKeys, ((headerKey) => {
            return <th key={headerKey}>{this.props.headers[headerKey]['title']}</th>;
        }));

        if (this.state.hasSelectableRows) {
            tableHeaders.unshift(<th key={'selectable-th'}/>);
        }

        if (this.state.hasSavePerRow) {
            tableHeaders.push(<th key={'save-th'}/>);
        }

        return tableHeaders;
    }

    onCellChange(uid, headerKey, changedValue) {
        const newState = Object.assign({}, this.state);
        newState.items[uid][headerKey] = changedValue;
        this.setState(newState);
    }

    getTableRowTdContent(uid, headerKey, tdContent, cellConfig) {

        let rowTdContent;

        if (cellConfig.type === 'label') {
            rowTdContent = tdContent;
        } else if (cellConfig.type === 'text-input') {
            let cellData = this.state.items[uid];
            rowTdContent =
                <Form.Control
                    size="sm"
                    type="text"
                    value={cellData[headerKey]}
                    onChange={(event) => this.onCellChange(uid, headerKey, event.target.value)}/>;
        } else {
            rowTdContent = tdContent;
        }

        return rowTdContent;
    }

    getTableRows() {

        return _.map(this.props.items, ((item) => {

            let itemKey = item[this.state.uniqueKey];
            const headerKeys = Object.keys(this.props.headers);

            const rowTds = _.map(headerKeys, ((headerKey) => {
                return <td
                    key={headerKey}>{this.getTableRowTdContent(itemKey, headerKey, item[headerKey], this.props.headers[headerKey]['cellConfig'])}</td>;
            }));

            if (this.state.hasSelectableRows) {
                rowTds.unshift(<td key={'selectable-td'}><Form.Check type="checkbox"/></td>);
            }

            if (this.state.hasSavePerRow) {
                rowTds.push(
                    <td key={'save-td'}>
                        <OverlayTrigger key="save" placement="right" overlay={<Tooltip id="tooltip-top">Save</Tooltip>}>
                            <i onClick={() => this.onRowSave(itemKey, item)} className="material-icons">save</i>
                        </OverlayTrigger>
                    </td>
                );
            }

            return <tr key={itemKey}>{rowTds}</tr>;
        }));

    }

    onRowSave(uid, originalRowData) {
        if (_.isFunction(this.props.rowSaveCallback)) {
            return this.props.rowSaveCallback(uid, originalRowData, this.state.items[uid]);
        }
    }

    render() {

        const tableHeaders = this.getTableHeaders();
        const tableRows = this.getTableRows();

        return (
            <Card className="archest-card archest-crud-list-card">

                <Card.Header className="archest-crud-list-card-header">
                    {this.props.title}
                </Card.Header>

                <Card.Body className="archest-card-body archest-crud-list-card-body">
                    <Table size="sm" className="archest-crud-list-card-body-list-group">
                        <thead>
                        <tr>
                            {tableHeaders}
                        </tr>
                        </thead>
                        <tbody>
                        {tableRows}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        );
    }
}

export default ArchestCrudListComponent;
