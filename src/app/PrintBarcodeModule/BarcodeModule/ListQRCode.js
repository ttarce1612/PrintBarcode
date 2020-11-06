import React, { useState } from 'react';
import PropTypes from 'prop-types';
import MaterialTable from 'material-table'

import TextField from '@material-ui/core/TextField';

import Button from '@material-ui/core/Button';
const toast = require("./../../../libs/toast");
var moment = require("moment-timezone");

const PrintQrcode = require('../../../libs/printQrcode')
const QrcodeService = require("../../../services/qrcodePrintService");

ListBarcodeSku.propTypes = {

};


function ListBarcodeSku(props) {
    const [dataList, setDataList] = useState([])

    let columns = [
        { title: 'STT', field: 'stt', width: '10' },
        { title: 'Code', field: 'code', width: '20' },
        { title: 'Name', field: 'name' },
        // { title: 'Type', field: 'type' },
        // { title: 'Region', field: 'region', width: '20' },
        // { title: 'Quantity', field: 'qty', width: '20' },
        { title: 'Full Adress', field: 'full_address' },
        // { title: 'Barcode', field: 'barcode' },
        // { title: 'Printed Time', field: 'printed_time' }
    ]

    const printQrcode = (rowData) => {
        if (rowData.length === 0) {
            toast.error("No data");
            return;
        } else {
            let printData = doPrepareData(rowData);
            console.log("printQrcode -> printData", printData)
            PrintQrcode.PrintQrcode(printData).then(resolve => {
                toast.message("Printting")
                let _dataList = [...dataList]
                for (let i in _dataList) {
                    if (rowData.barcode == _dataList[i].barcode && rowData.sku == _dataList[i].sku) {
                        _dataList[i]["printed_time"] = moment(new Date()).tz("Asia/Ho_Chi_Minh").format("HH:mm DD/MM/YYYY");
                    }
                }
                setDataList(_dataList)
            }, reject => {
                toast.error(reject.message)
            })

        }

    }
    const printAll = () => {
        let dataPrint = [...dataList]
        // for (let i = 0; i < dataPrint.length; i++) {
           
        //     let qrcode = {
        //         code: dataPrint[i].code,
        //         refcode: dataPrint[i].refcode,
        //         name: dataPrint[i].name,
        //         address: dataPrint[i].full_address
        //     }
        //     let jsoncode = JSON.stringify(qrcode)
        //     dataPrint[i]['qrcode'] = jsoncode
        // }
        if (dataPrint && dataPrint.length > 0) {
            PrintQrcode.PrintAllQrcode(dataPrint).then(resolve => {
                console.log("printAll -> resolve", resolve)
                toast.success("Printting")
                // let _dataList = [...dataList]
                // for (let i in _dataList) {
                //     if (dataPrint.barcode == _dataList[i].barcode && dataPrint.sku == _dataList[i].sku) {
                //         _dataList[i]["printed_time"] = moment(new Date()).tz("Asia/Ho_Chi_Minh").format("HH:mm DD/MM/YYYY");
                //     }
                // }
                // setDataList(_dataList)
            }, reject => {
                toast.error(reject.message)
            })
        }




    }
    const doPrepareData = (data) => {
        console.log("doPrepareData -> data", data)
        let barcode = {
            barcode: data['barcode'],
            type: data['type'],
            quantity: 1,
            full_address: data['full_address'],
            user: window.localStorage.getItem("user_info"),
            user_id: window.localStorage.getItem("user_id"),
        }
        return barcode;
    }
    const searchByCode = () => {
        let _sku = document.getElementById("outlined-search-code").value.trim()
        let checked = checkSku(_sku)
        if (checked) {
            QrcodeService.SearchByCode({ district: _sku }).then(result => {
                console.log("searchBySKU -> result", result)
                if (result.list_store.length === 0) {
                    toast.warning("Not found SKU: " + _sku)
                }
                if (result.status) {
                    let _dataList = []
                    let list = result.list_store
                    for (let i in list) {
                        let data = {
                            stt: parseInt(i) + 1,
                            code: list[i].code,
                            name: list[i].name,
                            type: list[i].type,
                            region: list[i].region,
                            full_address: list[i].full_address,
                            barcode: list[i].barcode,
                            unit_per_case: list[i].unit_per_case,
                            updated_date: list[i].updated_date,
                            refcode: list[i].refcode
                        }
                        _dataList.push(data)
                    }
                    setDataList(_dataList)
                }
            })
        }
    }

    const searchAllStore = () => {
        QrcodeService.SearchAllStore({ code: "all" }).then(result => {
            console.log("searchBySKU -> result", result)
            if (result.status) {
                let _dataList = []
                let list = result.list_store
                for (let i in list) {
                    let data = {
                        stt: parseInt(i) + 1,
                        code: list[i].code,
                        name: list[i].name,
                        type: list[i].type,
                        region: list[i].region,
                        full_address: list[i].full_address,
                        refcode: list[i].refcode,
                        unit_per_case: list[i].unit_per_case,
                        updated_date: list[i].updated_date,
                    }
                    _dataList.push(data)
                }
                setDataList(_dataList)
            }
        })
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
                        <TextField id="outlined-search-code" label="Search by Code" type="search" variant="outlined" />
                    </span>
                    <span style={{ paddingLeft: "10px", paddingTop: "15px" }}>
                        <Button onClick={searchByCode} variant="contained">Search by District</Button>
                    </span>
                    {/* <span style={{ paddingLeft: "10px", paddingTop: "15px" }}>
                        <Button onClick={searchAllStore} variant="contained">Search All</Button>
                    </span> */}
                    <span style={{ paddingLeft: "10px", paddingTop: "15px" }}>
                        <Button onClick={printAll} variant="contained">Print All</Button>
                    </span>
                </div>
            </div>
            <MaterialTable
                title="Store List"
                columns={columns}
                data={dataList}
                actions={[
                    {
                        icon: 'print',
                        tooltip: 'Print Barcode',
                        onClick: (event, rowData) => { printQrcode(rowData) }
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