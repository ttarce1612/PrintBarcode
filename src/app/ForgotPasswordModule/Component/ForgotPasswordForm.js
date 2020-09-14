/**
 * Copyright (c) 2019 OVTeam
 * Modified date: 2019/11/11
 * Modified by: Duy Huynh
 */

import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import RedirectButton from './../../../components/RedirectButton';

const authen = require("./../../../services/authen");

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 200,
  },
  dense: {
    marginTop: 19,
  },
  menu: {
    width: 200,
  },
  btnnext: { 
      float: 'right'
  }
}));

export default function ForgotPasswordForm() {
  const loginNameRef = React.createRef();
  const classes = useStyles();

  const forgotPasswordHandle = () => {
    if(!loginNameRef.current.value) {
      loginNameRef.current.focus();
      return;
    }
    authen.forgotPassword(loginNameRef.current.value);
  }

  const handleKeyup = (e) => {
    if (e.key === 'Enter') {
      forgotPasswordHandle();
      e.preventDefault();
    }
  }
  return (
    <form onSubmit={(event)=>{event.preventDefault();}} className={classes.container} noValidate autoComplete="off">
      <TextField
        required
        id="loginname"
        label="Login name"
        style={{ margin: 8 }}
        placeholder=""
        fullWidth
        margin="normal"
        autoFocus={true}
        inputRef={loginNameRef}
        onKeyUp={handleKeyup}
        helperText="Enter your login name to reset password."
      />
      <div style={{width: '100%', margin: 8}} >
       <RedirectButton title="Back" cls={classes.btn} path={"/login"} />
        <Button onClick={forgotPasswordHandle} className={classes.btnnext}  variant="contained" size="medium" color="primary">
          Next
        </Button>
        </div>
    </form>
  );
}
