import React, { Component } from "react";
import { ExcelRenderer, OutTable } from "react-excel-renderer";
import AutoGenerate from "./SerialModule/MaualInput";
import ImportExcel from "./SerialModule/ImportInput";
import ListSerialPrint from "./SerialModule/ListSerialPrint";
import History from "./SerialModule/History";
import "./PrintSerial.css";
import Container from "@material-ui/core/Container";
import Button from "@material-ui/core/Button";
import LoginSession from './SerialModule/LoginSession';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

const toast = require("./../../libs/toast");
var moment = require("moment-timezone");

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rows: [],
      cols: [],
      open: false,
      data: {}
    };
    this.generateCode = this.generateCode.bind(this);
    this.handleUpdateList = this.handleUpdateList.bind(this)
  }
  handleOpen = () => {
    this.setState({ open: true })
  };

  handleClose = () => {
    this.setState({ open: false })
  };
  handleUpdateList() {
    this.updateList()
    this.handleClose()
  }
  changeHandler(event) {
    let fileObj = event.target.files[0];
    if (!fileObj) { return; }
    if (fileObj.type != "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
      toast.error("Not excel file");
      return;
    } else {
      ExcelRenderer(fileObj, (err, resp) => {
        if (err) {
          alert(err);
        } else {
          if (resp.rows && resp.rows.length > 0) {
            let _row = []
            for (let i = 1; i < resp.rows.length; i++) {
              let item = resp.rows[i];
              let data = {
                stt: i,
                client: item[0],
                sku: item[1],
                quantity: item[2]
              };
              let check_data = this.checkInputValue(data);
              if (!check_data) {
                break;
              } else {
                data["printed_time"] = "";
                data["id"] = new Date();
                data["disable"] = false
                _row.push(data)
              }
            }
            if (this.checkUnique(_row)) {
              return;
            }
            this.setState({ rows: _row });
          }
        }
      });
    }
    this.resetFile()
  }
  checkUnique(list) {
    for (let i = 0; i < list.length - 1; i++) {
      for (let y = i + 1; y < list.length; y++) {
        if (list[i].client == list[y].client && list[i].sku == list[y].sku) {
          toast.error("Giá trị nhập vào bị trùng --- Client: " + list[i].client + "--- SKU: " + list[i].sku);
          return true
        }
      }
    }
    return false
  }
  manualSerialList() {
    let data = {
      stt: 1,
      client: document.getElementById("client").value,
      sku: document.getElementById("sku").value,
      quantity: parseInt(document.getElementById("quantity").value),
    }
    let checkValue = this.checkInputValue(data)
    if (!checkValue) {
      return;
    } else {

      let _row = [...this.state.rows]
      _row.push(data)
      if (this.checkUnique(_row)) {
        this.state.data = data
        this.handleOpen()
      } else {
        data["printed_time"] = "";
        data["id"] = new Date();
        data["disable"] = false
        this.setState({ rows: _row });
      }
    }
  }
  updateList() {
    let data = this.state.data
    let _row = [...this.state.rows]
    for (let i in _row) {
      if (_row[i].client == data.client && _row[i].sku == data.sku) {
        _row[i].quantity = data.quantity
        _row[i]["printed_time"] = "";
      }
    }
    this.setState({ rows: _row });
  }
  checkInputValue(data) {
    for (let key in data) {
      if (!data[key]) {
        toast.error("Giá trị nhập vào chưa đúng");
        return false
      }
    }
    if (parseInt(data["quantity"]) < 1 || parseInt(data["quantity"]) > 500) {
      toast.error("Số lượng phải lớn hơn 0 và nhỏ hơn 500");
      return false
    }
    return true
  }
  printSerial() {
    let printData = this.doPrepareData(this.state.rows);
    if (printData.length === 0) {
      toast.error("No data");
      return;
    }
    document.getElementById("uploadInputFile").value = "";
  }
  doPrepareData(data) {
    let _printData = [];
    for (let i = 1; i < data.length; i++) {
      let _code = this.generateCode(data[i][0]);
      let serial = {
        code: _code,
        number: data[i][1],
      };
      _printData.push(serial);
    }
    return _printData;
  }
  generateCode(sku) {
    let date = moment(new Date()).tz("Asia/Ho_Chi_Minh").format("YYMMDD");
    return "E" + sku + date;
  }
  resetFile() {
    document.getElementById("uploadInputFile").value = "";
  }
  render() {
    return (
      <div style={{ padding: "10px" }}>
        <div id="user-session" style={{ paddingBottom: "25px" }}>
          <LoginSession />
        </div>
        <div>
          <h1 style={{ textAlign: "left", paddingLeft: "15px" }}>SERIAL PRINTING</h1>
        </div>
        <div id="user-interface" style={{ display: "flex" }}>
          <div id="input-area" style={{ float: "left", width: "45%" }}>
            <div id="manuel" >
              <Container component="main" maxWidth="xs">
                <AutoGenerate />
                <Button onClick={this.manualSerialList.bind(this)} fullWidth size="large" variant="contained" className="generate">
                  Generate Serial
              </Button>
              </Container>
            </div>
            <div id="excel" style={{ paddingTop: "25px" }}>
              <ImportExcel handleChange={this.changeHandler.bind(this)} />
            </div>
          </div>
          {/* <div id="history" style={{ width: "55%", paddingTop: "30px", paddingRight: "15px" }}>
            <History />
          </div> */}
        </div>
        <div id="tableList" style={{ padding: "15px" }}>
          <ListSerialPrint data={this.state.rows} />
        </div>
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{"Giá trị nhập vào bị trùng"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Client với số SKU đã có trong danh sách, bạn có muốn in lại ?
          </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary">
              Không
          </Button>
            <Button onClick={this.handleUpdateList} color="primary" autoFocus>
              Đồng ý
          </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}
export default App;
