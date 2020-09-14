/**
 * Copyright (c) 2019 OVTeam
 * Modified date: 2019/11/11
 * Modified by: Duy Huynh
 */
import React, { useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

import TField from '../../../components/TextField';

const dispatcher = require('../../../libs/dispatcher');
const outboundService = require('../../../services/outboundService');


const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    textAlign: 'center'
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: '45%',
  },
  textFullWidth: {
    width: '93%',
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  dense: {
    marginTop: 19,
  },
  menu: {
    width: 200,
  },
  btn: {
    float: 'right'
  },
}));

export default function Onbound() {
  const model = {
    item: React.createRef(),
    qty: React.createRef(),
    unit: React.createRef(),
    cost: React.createRef()
  };
  const [error, setError] = React.useState({ item: "", qty: "", unit: "", cost: "" });

  const [modelData, setModelData] = React.useState({
    item: "",
    qty: "",
    unit: "",
    cost: ""
  });

  const [open, setOpen] = React.useState(false);

  const classes = useStyles();

  const grantData = (initData) => {
    if (!initData) {
      setModelData({
        action: "CREATE",
        item: "",
        qty: "",
        unit: "",
        cost: ""
      });
    } else {
      initData['action'] = "UPDATE";
      setModelData(initData);
    }
  }

  //Receive Event from dispatcher
  dispatcher.register('outbound_add_new', (payload) => {
    if (payload && payload.data) {
      if (payload.action === 'CREATE') {
        setOpen(true);
        grantData(null);
      } else {
        outboundService.getOne(payload.data._id)
          .then((result) => {
            if (result.data) {
              grantData(result.data);
              setOpen(true);
            }
          })
      }
    }
  });

  const hadleCancelClick = () => {
    setOpen(false);
    setError({ item: "", qty: "", unit: "", cost: "" });
  }

  const validation = () => {
    let item = model.item.current.value;
    // let qty = model.qty.current.value;
    let valid = true;
    let _error = {
      item: "",
      qty: "",
      unit: "",
      cost: ""
    };
    if (!item || item.length < 6) {
      _error['item'] = "The Item Name least 6 characters";
      valid = false;
    }
    for (let i in _error) {
      if (_error[i] === true) {
        model[i].current.focus();
        break;
      }
    }
    if (valid === false) {
      setError(_error)
    }
    return valid;
  }

  const handleKeyup = (e) => {
    if (e.key === 'Enter') {
      let map = {
        item: "qty"
      }
      let id = e.target.id;
      if (id) {
        let nextInput = map[id] || "";
        if (model[nextInput] && model[nextInput].current) {
          model[nextInput].current.focus();
        }
      }
    }
  }

  const handleSave = () => {
    setModelData(modelData);
    if (validation() === false) {
      return;
    }

    if (modelData.action === 'UPDATE') {
      outboundService.update(modelData);
    } else {
      outboundService.create(modelData);
    }

    hadleCancelClick();
  }

  //Unmounted component
  React.useEffect(() => {
    return () => {
      dispatcher.destroy('outbound_add_new');
    };
  }, []);

  return (
    <div>
      <Dialog open={open} onBackdropClick={hadleCancelClick} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">{modelData.action == 'CREATE' ? 'TẠO MỚI' : 'CẬP NHẬT'} INBOUND</DialogTitle>
        <DialogContent>
          <form className={classes.container} noValidate autoComplete="off">
            <div style={{ width: '100%' }}>
              <TField
                inputProps={{
                  error: error.item,
                  id: "item",
                  name: "item",
                  label: "Tên Sản Phẩm",
                  required: true,
                  className: classes.textFullWidth,
                  margin: "normal",
                  defaultValue: modelData.item,
                  inputRef: model.item,
                  onKeyUp: handleKeyup
                }}
                formData={modelData}
              />
            </div>
            <div style={{ width: '100%' }}>
              <TField
                inputProps={{
                  error: error.qty,
                  id: "qty",
                  name: "qty",
                  label: "Số lượng",
                  disabled: false, // (modelData.action === 'UPDATE'),
                  required: false,
                  className: classes.textFullWidth,
                  margin: "normal",
                  defaultValue: modelData.qty,
                  inputRef: model.qty,
                  onKeyUp: handleKeyup
                }}
                formData={modelData}
              />
            </div>
            <div style={{ width: '100%' }}>
              <TField
                inputProps={{
                  error: error.unit,
                  id: "unit",
                  name: "unit",
                  label: "Đơn vị",
                  disabled: false, // (modelData.action === 'UPDATE'),
                  required: false,
                  className: classes.textFullWidth,
                  margin: "normal",
                  defaultValue: modelData.unit,
                  inputRef: model.qty,
                  onKeyUp: handleKeyup
                }}
                formData={modelData}
              />
            </div>
            <div style={{ width: '100%' }}>
              <TField
                inputProps={{
                  error: error.cost,
                  id: "cost",
                  name: "cost",
                  label: "Giá tiền",
                  disabled: false, // (modelData.action === 'UPDATE'),
                  required: false,
                  className: classes.textFullWidth,
                  margin: "normal",
                  defaultValue: modelData.cost,
                  inputRef: model.cost,
                  onKeyUp: handleKeyup,
                  type:"number"
                }}
                formData={modelData}
              />
            </div>
          </form>
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={hadleCancelClick}>
            Thoát
          </Button>
          <Button color="primary" onClick={handleSave}>
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}