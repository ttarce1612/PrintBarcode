/**
 * Copyright (c) 2019 OVTeam
 * Modified date: 2019/11/11
 * Modified by: Duy Huynh
 */
import React from 'react';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { Link as WebLink } from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';
import Logo from '../../assets/logo/logo.png';
import LoginForm from './Component/LoginForm';
import { Image } from 'react-bootstrap'

import {
  Link
} from "react-router-dom";

const useStyles = makeStyles((theme) => createStyles({
  card: {
    width: '100%',
    position: 'relative',
    top: '20vh',
    marginLeft: 'auto',
    marginRight: 'auto',
    margin: 8,
    [theme.breakpoints.up('sm')]: {
      width: 330,
    },
  },
  logo: {
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  cardContent: {
    padding: 8
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: theme.typography.body1.fontSize,
    fontWeight: theme.typography.body1.fontWeight,
    letterSpacing: theme.typography.body1.letterSpacing,
    lineHeight: theme.typography.body1.lineHeight,
    textAlign: 'center'
  },
  pos: {
    marginBottom: 12,
  },
  link: {
    color: 'inherit',
    textDecoration: "none"
  }
}));

export default function LoginModule() {
  const classes = useStyles();
  return (
    <Card className={classes.card}>
      <CardContent className={classes.cardContent}>
      {/* <img width="100" height="100" src={Logo}> </img> */}
      <img src={Logo} />
        {/* <Avatar alt="Remy Sharp" src={Logo} className={classes.logo} /> */}
        <Typography className={classes.title} color="textPrimary" gutterBottom style={{}}>
          {/* <span style={{ marginTop: 'auto', marginBottom: 'auto' }}>Login to ETON</span> */}
        </Typography>
        <LoginForm />
      </CardContent>
      {/* <CardActions>
        <div style={{ width: '100%', marginRight: 8, marginLeft: 8 }}>
          <WebLink
            style={{ marginLeft: 8 }}
            component="button"
            variant="body2"
            color="textPrimary"
          >
            <Link
              to="/forgotpassword"
              className={classes.link}
            >
              Forgot Password?
            </Link>
          </WebLink>
          <WebLink
            style={{ float: 'right', marginLeft: 8 }}
            component="button"
            variant="body2"
            color="textPrimary"
          >
            Revision: 1.0.0
            </WebLink>
        </div>
      </CardActions> */}
    </Card>
  );
}
