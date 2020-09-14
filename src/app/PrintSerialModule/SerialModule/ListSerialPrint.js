/**
 * Copyright (c) 2019 OVTeam
 * Modified date: 2019/11/11
 * Modified by: Duy Huynh
 */
import React from 'react';
import MaterialTable from 'material-table';

const toast = require("./../../../libs/toast");
const SerialService = require("../../../services/serialPrintService");
var moment = require("moment-timezone");

export default function MaterialTableDemo(props) {
    const { useState, useEffect } = React;

    const [dataList, setDataList] = useState(props.data)
    const [selectedRow, setSelectedRow] = useState(null);
    let columns = [
        { title: 'STT', field: 'stt', width: '20' },
        { title: 'Đối tác', field: 'client', width: '50' },
        { title: 'SKU', field: 'sku', width: '50' },
        { title: 'Số lượng', field: 'quantity' },
        { title: 'Thời gian in', field: 'printed_time' }
    ]
    useEffect(() => {
        setDataList(props.data)
    });
    function printSerial(rowData) {
        let printData = doPrepareData(rowData);
        if (printData.length === 0) {
            toast.error("No data");
            return;
        } else {
            toast.info("Generating serial");
            SerialService.PrintSerial(printData);
            let _dataList = [...dataList]
            for (let i in _dataList) {
                if (rowData.client == _dataList[i].client && rowData.sku == _dataList[i].sku) {
                    _dataList[i]["printed_time"] = moment(new Date()).tz("Asia/Ho_Chi_Minh").format("HH:mm DD/MM/YYYY");
                }
            }
            setDataList(_dataList)
        }
    }
    function doPrepareData(data) {
        let serial = {
            sku: data['sku'],
            quantity: data['quantity'],
            client: data['client'],
            user: window.localStorage.getItem("user_info"),
            id: window.localStorage.getItem("user_id"),
        }
        return serial;
    }
    return (
        <MaterialTable
            title="Serial Print"
            columns={columns}
            data={dataList}
            style={{
                backgroundColor: "black",
            }}
            options={{
                selection: true,
                selectionProps: rowData => ({
                    disabled: rowData.name === '',
                    color: 'primary'
                })
            }}
            onRowClick={((evt, selectedRow) => setSelectedRow(selectedRow.tableData.id))}
            actions={[
                {
                    icon: 'print',
                    tooltip: 'Print Serial',
                    onClick: (event, rowData) => {
                        printSerial(rowData)
                    }
                }
            ]}
            options={{
                headerStyle: {
                    backgroundColor: '#1F1F1F',
                    color: '#FFF'
                },
                actionsColumnIndex: -1,
                search: false
            }}
        />
    );
}
