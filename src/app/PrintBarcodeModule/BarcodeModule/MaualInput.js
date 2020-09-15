import React from 'react';

import TextField from '@material-ui/core/TextField';

import Grid from '@material-ui/core/Grid';

import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export default function SignUp() {
  const classes = useStyles();

  return (
    <div className={classes.paper}>
      <Typography component="h1" variant="h5">
        Manual Input
        </Typography>
      <Grid container spacing={2}
            container
            direction="row"
            justify="center"
            alignItems="center">
        <Grid item xs={12} >
          <TextField
            autoComplete="fname"
            name="client"
            variant="outlined"
            required
            fullWidth
            id="client"
            label="Đối tác"
            autoFocus
            defaultValue = "PVU"
            disabled = {true}
          />
        </Grid>
        <Grid item xs={12} >
          <TextField
            variant="outlined"
            required
            fullWidth
            id="sku"
            label="SKU"
            name="sku"
            autoComplete="lname"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            variant="outlined"
            required
            fullWidth
            id="quantity"
            label="Số Lượng"
            name="quantity"
            autoComplete="quantity"
            type = "number"
            min = {1}
          />
        </Grid>
      </Grid>
    </div>

  );
}