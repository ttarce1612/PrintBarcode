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
const orderService = require('../../../services/orderService');


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

let lastPid = "";
export default function Order() {
  const model = {
    rolename: React.createRef(),
    description: React.createRef()
  };
  const [error, setError] = React.useState({ rolename: "", description: "" });

  const [modelData, setModelData] = React.useState({
    rolename: "",
    description: ""
  });

  const [postData, setPostData] = React.useState({
    _id: "",
    status: 1
  });

  const [open, setOpen] = React.useState(false);
  const [openInform, setOpenInform] = React.useState(false);

  const classes = useStyles();

  const grantData = (initData) => {
    if (!initData) {
      setModelData({
        action: "CREATE",
        rolename: "",
        description: ""
      });
    } else {
      initData['action'] = "UPDATE";
      setModelData(initData);
    }
  }

  //Receive Event from dispatcher
  dispatcher.register('role_add_new', (payload) => {
    if (payload && payload.data) {
      if (payload.action === 'CREATE') {
        setOpen(true);
        grantData(null);
      } else {
        orderService.getOne(payload.data._id)
          .then((result) => {
            if (result.data) {
              grantData(result.data);
              setOpen(true);
            }
          })
      }
    }
  });

  dispatcher.register('order_inform', (payload) => {
    if (payload && payload.data) {
      if (payload.action === 'INFORM') {
        setPostData({
          _id: payload.data.params._id || "",
          status: payload.data.params.status
        })
        setOpenInform(true);
      }
    }
  });

  const hadleCancelClick = () => {
    setOpen(false);
    setError({ rolename: "", description: "" });
  }

  const validation = () => {
    let roleName = model.rolename.current.value;
    let description = model.description.current.value;
    let valid = true;
    let _error = {
      rolename: "",
      description: ""
    };
    if (!roleName || roleName.length < 6) {
      _error['rolename'] = "The Role Name least 6 characters";
      valid = false;
    }
    // if (!description || description.length < 6) {
    //   _error['description'] = "The description least 6 characters";
    //   valid = false;
    // }
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
        rolename: "description"
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
      orderService.update(modelData);
    } else {
      orderService.create(modelData);
    }

    hadleCancelClick();
  }

  const handleInform = () => {
    orderService.update(postData);
    setOpenInform(false);
  }

  //Unmounted component
  React.useEffect(() => {
    return () => {
      dispatcher.destroy('role_add_new');
    };
  }, []);

  return (
    <div>
      <Dialog open={openInform} onBackdropClick={()=> setOpenInform(false)} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Xem Order</DialogTitle>
        <DialogContent>
          Bạn có muốn pick order không?
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={()=> setOpenInform(false)}>
            Không
          </Button>
          <Button color="primary" onClick={handleInform}>
            Có
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={open} onBackdropClick={hadleCancelClick} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">{modelData.action=='CREATE'?'TẠO MỚI':'CẬP NHẬT'} QUYỀN</DialogTitle>
        <DialogContent>
          <form className={classes.container} noValidate autoComplete="off">
            <div style={{ width: '100%' }}>
              <TField
                inputProps={{
                  // error: error.rolename,
                  id: "rolename",
                  name: "rolename",
                  label: "Tên Quyền",
                  // required: true,
                  className: classes.textFullWidth,
                  margin: "normal",
                  defaultValue: modelData.rolename,
                  // inputRef: model.rolename,
                  // onKeyUp: handleKeyup
                }}
                // formData={modelData}
              />
            </div>
            <div style={{ width: '100%' }}>
              <TField
                inputProps={{
                  error: error.description,
                  id: "description",
                  name: "description",
                  label: "Mô Tả",
                  disabled: false, // (modelData.action === 'UPDATE'),
                  required: false,
                  className: classes.textFullWidth,
                  margin: "normal",
                  defaultValue: modelData.description,
                  inputRef: model.description,
                  onKeyUp: handleKeyup
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