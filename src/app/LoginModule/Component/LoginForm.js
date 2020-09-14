/**
 * Copyright (c) 2019 OVTeam
 * Modified date: 2019/11/11
 * Modified by: Duy Huynh
 */
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

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
  btn: {
      float: 'right'
  },
}));

export default function LoginForm() {
  const loginNameRef = React.createRef();
  const passwordRef = React.createRef();
  const classes = useStyles();

  const doLogin = ()=> {
    if(loginNameRef.current.value && !passwordRef.current.value) {
      passwordRef.current.focus();
    } else if(!loginNameRef.current.value && passwordRef.current.value) {
      loginNameRef.current.focus();
    } else {
      authen.login(loginNameRef.current.value, passwordRef.current.value);
    }
  }

  const handleKeyup = (e) => {
    if (e.key === 'Enter') {
      doLogin();
    }
  }
  return (
    <form className={classes.container} noValidate autoComplete="off">
      <TextField
        required
        id="loginname"
        label="Login name"
        style={{ margin: 8 }}
        placeholder=""
        helperText=""
        fullWidth
        margin="normal"
        autoFocus={true}
        inputRef={loginNameRef}
        onKeyUp={handleKeyup}
      />
      <TextField
        required
        id="password"
        label="Password"
        type="password"
        style={{ margin: 8 }}
        placeholder=""
        helperText=""
        fullWidth
        margin="normal"
        inputRef={passwordRef}
        onKeyUp={handleKeyup}
      />
      <div style={{width: '100%', margin: 8}} >
       <Button onClick={doLogin} fullWidth className={classes.btn}  variant="contained" size="medium" color="primary">
          Login
        </Button>
        </div>
    </form>
  );
}
