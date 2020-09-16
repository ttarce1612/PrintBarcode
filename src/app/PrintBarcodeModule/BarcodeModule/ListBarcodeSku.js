import React, { useState } from 'react';
import PropTypes from 'prop-types';
import MaterialTable from 'material-table'

import TextField from '@material-ui/core/TextField';

import Button from '@material-ui/core/Button';
const toast = require("./../../../libs/toast");
var moment = require("moment-timezone");

const PrintBarcode = require('../../../libs/printBarcode')
const BarcodeService = require("../../../services/barcodePrintService");

ListBarcodeSku.propTypes = {

};


function ListBarcodeSku(props) {
    const [dataList, setDataList] = useState([])

    let columns = [
        { title: 'STT', field: 'stt' , width: '10'},
        { title: 'Client', field: 'client', width: '20'},
        { title: 'SKU', field: 'SKU' },
        { title: 'Name', field: 'name' },
        { title: 'Unit', field: 'unit' , width: '20'},
        // { title: 'Quantity', field: 'qty', width: '20' },
        { title: 'Unit per case', field: 'unit_per_case' },
        { title: 'Barcode', field: 'barcode' }
    ]

    const printBarcode = (rowData) => {
        if (rowData.length === 0) {
            toast.error("No data");
            return;
        } else {
            let printData = doPrepareData(rowData);
            console.log("printBarcode -> printData", printData)
            PrintBarcode.PrintBarcode(printData)
            // let _dataList = [...dataList]
            // for (let i in _dataList) {
            //     if (rowData.client == _dataList[i].client && rowData.sku == _dataList[i].sku) {
            //         _dataList[i]["printed_time"] = moment(new Date()).tz("Asia/Ho_Chi_Minh").format("HH:mm DD/MM/YYYY");
            //     }
            // }
            // setDataList(_dataList)
        }

    }
    const doPrepareData = (data) => {
        let barcode = {
            barcode: data['barcode'],
            sku: data['SKU'],
            quantity: 1,
            client: data['client'],
            user: window.localStorage.getItem("user_info"),
            user_id: window.localStorage.getItem("user_id"),
        }
        return barcode;
    }
    const searchBySKU = () => {
        let _sku = document.getElementById("outlined-search").value.trim()
        let checked = checkSku(_sku)
        if (checked) {
            BarcodeService.SearchBySku({ sku: _sku }).then(result => {
                if (result.status) {
                    let _dataList = []
                    let list = result.list_sku
                    for (let i in list) {
                        let data = {
                            stt: parseInt(i) +1,
                            SKU: list[i].SKU,
                            barcode: list[i].barcode,
                            client: list[i].client,
                            created_date: list[i].created_date,
                            name: list[i].name,
                            qty: list[i].qty,
                            unit: list[i].unit,
                            unit_per_case: list[i].unit_per_case,
                            updated_date: list[i].updated_date,
                        }
                        _dataList.push(data)
                    }
                    setDataList(_dataList)
                }
            })
        }
    }
 
    const checkSku = (sku) => {
        if (sku.length <= 0) {
            toast.warning("Pleas input value SKU")
            return false
        } else {
            return true
        }
    }
    return (
        <div style={{ maxWidth: "98%" }}>
            <div id="search-button" style={{ display: "flex", paddingBottom: "10px" }}>
                <div id="style" style={{ float: "left", verticalAlign: "middle" }}>
                    <span >
                        <TextField id="outlined-search" label="Search by SKU" type="search" variant="outlined" />
                    </span>
                    <span style={{ paddingLeft: "10px", paddingTop: "15px" }}>
                        <Button onClick={searchBySKU} variant="contained">Search</Button>
                    </span>

                </div>
            </div>
            <MaterialTable
                title=""
                columns={columns}
                data={dataList}
                actions={[
                    {
                        icon: 'print',
                        tooltip: 'Print Barcode',
                        onClick: (event, rowData) => { printBarcode(rowData) }
                    }
                ]}
                options={{
                    actionsColumnIndex: -1,
                }}
            />
        </div>
    );
}
export default ListBarcodeSku;