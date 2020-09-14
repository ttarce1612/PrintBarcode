/**
 * Copyright (c) 2019 OVTeam
 * Modified date: 2019/11/11
 * Modified by: Duy Huynh
 */
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import MenuIcon from '@material-ui/icons/Menu';
import HeaderLogo from './../assets/logo/header_logo.png';
import IconButton from '@material-ui/core/IconButton';
import { Link } from "react-router-dom";

let dispatcher = require("./../libs/dispatcher");

const useStyles = makeStyles(theme => ({
  menuButton: {
    position: 'absolute',
    padding: 7
  },
  title: {
    display: 'none',
    marginLeft: 45,
    [theme.breakpoints.up('sm')]: {
      display: 'inline-block',
    },
  },
  logo: {
    width: 40,
    [theme.breakpoints.up('xs')]: {
      position: 'relative',
    },
    [theme.breakpoints.up('sm')]: {
      position: 'absolute',
    },
    [theme.breakpoints.up('md')]: {
      position: 'absolute',
    },
  },
  link: {
    textDecoration: "none",
    display: "inline-block",
    paddingTop: 5,
    marginLeft: 45
  },
  menuIcon: {
    display: "inline-flex",
    height: '1.4em',
    width: '1.4em'
  }
}));

export default function HeaderModule(props) {
  const classes = useStyles();
  const btn = (
    <IconButton
      color="inherit"
      aria-label="open drawer"
      edge="start"
      className={classes.menuButton}
      onClick={() => {
        dispatcher.dispatch("nav_bar_toogle", {'regex': true})
      }}
    >
      <MenuIcon className={classes.menuIcon} />
    </IconButton>
  );
  return (
    <div>
      {props.showButton?btn:""}
      <Link className={classes.link} to="/inbounds">
        <img alt="logo" src={HeaderLogo} className={classes.logo} />
        <div>
          <Typography className={classes.title} style={{ color: "#fff", paddingTop: "5px" }} variant="h6" noWrap>
            <div>Delivery on Demand</div>
          </Typography>
        </div>
      </Link>
    </div>
  );
}