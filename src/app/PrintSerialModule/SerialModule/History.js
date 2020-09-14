/**
 * Copyright (c) 2019 OVTeam
 * Modified date: 2019/11/11
 * Modified by: Duy Huynh
 */
import React from 'react';
import MaterialTable from 'material-table';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import InfoIcon from '@material-ui/icons/Info';



import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

const DetailSerialPrint = require("./DetailSerialPrint")
const toast = require("./../../../libs/toast");
const SerialService = require("../../../services/serialPrintService");
var moment = require("moment-timezone");

export default function History(props) {
    const { useState, useEffect } = React;

    const [dataList, setDataList] = useState([])
    const [disableSearch, setDisableSearch] = useState(true)
    const [selectedRow, setSelectedRow] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [fullWidth, setFullWidth] = React.useState(true);
    const [maxWidth, setMaxWidth] = React.useState('md');

    let columns = [
        { title: 'STT', field: 'stt', width: '20' },
        { title: 'Mã đối tác', field: 'client', width: '50' },
        { title: 'SKU', field: 'sku', width: '50' },
        { title: 'Số lượng đã in', field: 'total' }
    ]

    const handleClickOpen = () => {
        setOpenDialog(true);
    };

    const handleClose = () => {
        setOpenDialog(false);
    };




    function historyByClient() {
        let client_code = document.getElementById("client-search").value.trim().toUpperCase()
        if (!client_code || (client_code.length > 5)) {
            toast.error("Vui lòng nhập đúng mã khách hàng");
            return;
        } else {
            SerialService.SearchByClient({ client: client_code }).then((result) => {
                let data = []
                for (let i in result.Data) {
                    let item = {
                        stt: parseInt(i) + 1,
                        client: client_code,
                        sku: result.Data[i]._id,
                        total: result.Data[i].total
                    }
                    data.push(item)
                }
                setDataList(data)
            })
        }
    }
    function checkClient(event) {
        let client_code = document.getElementById("client-search").value.trim().toUpperCase()
        document.getElementById("client-search").value = client_code
        if (client_code.length > 0) {
            setDisableSearch(false)
        } else {
            setDisableSearch(true)
        }
    }
    function detailSerailPrint(data) {
        setOpenDialog(true)
    }
    return (
        <div>
            <div style={{ display: "flow-root", padding: "5px" }}>
                <TextField
                    variant="outlined"
                    id="client-search"
                    label="Mã khách hàng"
                    name="Mã khách hàng"
                    autoComplete="client-search"
                    onKeyUp={checkClient}
                    style={{ float: "left", marginLeft: "10px" }}
                />
                <Button style={{ marginTop: "10px" }} disabled={disableSearch} variant="contained" onClick={historyByClient}>Search</Button>
            </div>

            <MaterialTable
                title="Editable Example"
                columns={columns}
                data={dataList}
               
            />
            {/* <Dialog
                fullWidth={fullWidth}
                maxWidth={maxWidth}
                open={openDialog}
                onClose={handleClose}
                aria-labelledby="max-width-dialog-title"
            >
                <DialogTitle id="max-width-dialog-title">Serail Print Detail</DialogTitle>
                <DialogContent>
                   
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog> */}
        </div>

    );
}
