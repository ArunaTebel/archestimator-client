import React, {Component} from "react";
import {Button, Card, Dropdown, DropdownButton, Form, Modal, OverlayTrigger, Table, Tooltip} from "react-bootstrap";
import '../styles/ArchestCrudListComponent.scss';

const _ = require('lodash');

class ArchestCrudListComponent extends Component {

    constructor(props) {
        super(props);

        this.state = {
            selectedItemUids: [],
            uniqueKey: props.hasOwnProperty('uniqueKey') ? props.uniqueKey : 'id',
            hasSelectableRows: props.hasOwnProperty('hasSelectableRows') ? props.hasSelectableRows : true,
            newItemUidPrefix: props.hasOwnProperty('newItemUidPrefix') ? props.newItemUidPrefix : 'archest-crud-list-new-',
            canSave: props.hasOwnProperty('canSave') ? props.canSave : true,
            canAdd: props.hasOwnProperty('canAdd') ? props.canAdd : true,
            modalProps: {show: false, message: 'Do you really want to delete the selected items?'}
        };

        this.state.nextNewItemUid = 0;
    }

    getTableHeaders() {

        const headerKeys = Object.keys(this.props.headers);

        let tableHeaders = _.map(headerKeys, ((headerKey) => {
            return <th className="archest-crud-list-card-body-table-thead-tr-th"
                       key={headerKey}>{this.props.headers[headerKey]['title']}</th>;
        }));

        if (this.state.hasSelectableRows) {
            tableHeaders.unshift(<th key={'selectable-th'}
                                     className="archest-crud-list-card-body-table-thead-tr-th archest-crud-list-card-body-table-thead-tr-select-options-th">
                <DropdownButton size="sm" title="" id="archest-crud-list-options-dropdown">
                    <Dropdown.Item eventKey="1" onClick={() => this.toggleRowSelection(true)}>Select All</Dropdown.Item>
                    <Dropdown.Item eventKey="2" onClick={() => this.toggleRowSelection(false)}>Deselect
                        All</Dropdown.Item>
                    <Dropdown.Divider/>
                    <Dropdown.Item eventKey="3" onClick={() => this.deleteSelection()}>Delete Selected</Dropdown.Item>
                </DropdownButton>
            </th>);
        }

        if (this.state.canSave) {
            tableHeaders.push(<th
                className="archest-crud-list-card-body-table-thead-tr-th archest-crud-list-card-body-table-thead-tr-row-options-th"
                key={'save-th'}/>);
        }

        return tableHeaders;
    }

    onCellChange(uid, headerKey, changedValue) {

    }

    getTableRowTdContent(uid, headerKey, tdContent, cellConfig) {

        let rowTdContent;

        if (cellConfig.type === 'label') {
            rowTdContent = tdContent;
        } else if (cellConfig.type === 'text-input') {
            let cellData = this.props.items[uid];
            rowTdContent =
                <Form.Control
                    className="archest-crud-list-tr-td-content"
                    data-archest-crud-list-td-uid={`${uid}`}
                    data-archest-crud-list-td-header-key={`${headerKey}`}
                    size="sm"
                    type="text"
                    defaultValue={cellData[headerKey]}
                    onChange={(event) => this.onCellChange(uid, headerKey, event.target.value)}/>;
        } else {
            rowTdContent = tdContent;
        }

        return rowTdContent;
    }

    getTableRows() {
        let tableRows = _.map(this.props.items, ((item) => {

            let itemUid = item[this.state.uniqueKey];
            const headerKeys = Object.keys(this.props.headers);

            const rowTds = _.map(headerKeys, ((headerKey) => {
                return <td className="archest-crud-list-card-body-table-tbody-tr-td"
                           key={headerKey}>{this.getTableRowTdContent(itemUid, headerKey, item[headerKey], this.props.headers[headerKey]['cellConfig'])}</td>;
            }));

            if (this.state.hasSelectableRows) {
                rowTds.unshift(
                    <td className="archest-crud-list-card-body-table-tbody-tr-td" key={'selectable-td'}>
                        <Form.Check className="archest-crud-list-card-body-table-tbody-tr-select-check-td"
                                    data-archest-crud-list-card-body-table-tbody-tr-select-check-td={`${itemUid}`}
                                    type="checkbox"/>
                    </td>
                );
            }

            if (this.state.canSave) {
                rowTds.push(
                    <td className="archest-crud-list-card-body-table-tbody-tr-td" key={'save-td'}>
                        <OverlayTrigger key="save" placement="right" overlay={<Tooltip id="tooltip-top">Save</Tooltip>}>
                            <i onClick={() => this.onRowSave(itemUid, item)}
                               className="archest-crud-list-save-icon material-icons">save</i>
                        </OverlayTrigger>
                    </td>
                );
            }

            return <tr className="archest-crud-list-card-body-table-tbody-tr-td" key={itemUid}>{rowTds}</tr>;
        }));

        if (this.state.canAdd) {
            tableRows.push(
                <tr className="archest-crud-list-card-body-table-tbody-tr-td archest-crud-list-card-body-table-tbody-tr-add-item-td"
                    key="archest-crud-list-card-body-table-tbody-tr-add-item-td">
                    <td/>
                    <td>
                        <Button onClick={() => this.addNewItem()} variant="link" size="sm">
                            <span className="oi oi-plus"/>&nbsp;&nbsp;
                            <span>Add New</span>
                        </Button>
                    </td>
                </tr>
            );
        }

        return tableRows;

    }

    getAllCheckboxes() {
        return document.body.querySelectorAll('.archest-crud-list-card-body-table-tbody-tr-select-check-td');
    }

    deleteSelection() {
        var checkboxes = this.getAllCheckboxes();
        let selectedUids = [];
        for (let i = 0; i < checkboxes.length; i++) {
            if (checkboxes[i].children[0].checked) {
                selectedUids.push(checkboxes[i].children[0].dataset['archestCrudListCardBodyTableTbodyTrSelectCheckTd']);
            }
        }
        if (selectedUids.length > 0) {
            this.setState({modalProps: {show: true}, selectedItemUids: selectedUids});
        }
    }

    toggleRowSelection(checked) {
        var checkboxes = this.getAllCheckboxes();
        for (let i = 0; i < checkboxes.length; i++) {
            checkboxes[i].children[0].checked = checked;
        }
    }

    addNewItem() {
        this.props.addNewItemCallback();
    }

    onRowSave(uid, originalRowData) {
        var nodes = document.body.querySelectorAll(`.archest-crud-list-tr-td-content[data-archest-crud-list-td-uid="${uid}"]`);

        let rowValues = {};

        for (let i = 0; i < nodes.length; i++) {
            rowValues[nodes[i]['dataset']['archestCrudListTdHeaderKey']] = nodes[i].value;
        }
        if (_.isFunction(this.props.rowSaveCallback)) {
            return this.props.rowSaveCallback(uid, rowValues, this.props.items[uid]);
        }
    }

    modalFunctions = {
        onCancelClickHandler: () => {
            this.setState({modalProps: {show: false}});
        },
        onConfirmClickHandler: () => {
            this.setState({modalProps: {show: false}});
            this.props.deleteSelectedItemsCallback(this.state.selectedItemUids);
        }
    };

    render() {

        const tableHeaders = this.getTableHeaders();
        const tableRows = this.getTableRows();

        return (
            <Card className="archest-card archest-crud-list-card">

                <Modal show={this.state.modalProps.show} onHide={this.modalFunctions.onCancelClickHandler}>
                    <Modal.Header closeButton>
                        <Modal.Title>{'Confirmation'}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>{'Do you really want to delete the selected items?'}</Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.modalFunctions.onCancelClickHandler}>
                            {'Cancel'}
                        </Button>
                        <Button variant="primary" onClick={this.modalFunctions.onConfirmClickHandler}>
                            {'Ok'}
                        </Button>
                    </Modal.Footer>
                </Modal>

                <Card.Header className="archest-crud-list-card-header">
                    {this.props.title}
                </Card.Header>

                <Card.Body className="archest-card-body archest-crud-list-card-body">
                    <Table size="sm" className="archest-crud-list-card-body-table">
                        <thead className="archest-crud-list-card-body-table-thead">
                        <tr className="archest-crud-list-card-body-table-thead-tr">
                            {tableHeaders}
                        </tr>
                        </thead>
                        <tbody className="archest-crud-list-card-body-table-tbody">
                        {tableRows}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        );
    }
}

export default ArchestCrudListComponent;
