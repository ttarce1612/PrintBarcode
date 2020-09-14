/**
 * Copyright (c) 2019 OVTeam
 * Modified date: 2019/11/11
 * Modified by: Duy Huynh
 */

import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import { makeStyles } from '@material-ui/core/styles';
import Header from '../HeaderModule';
import NavBar from '../../components/NavBar';
import NavbarItems from './Component/NavbarItems';
import NavBarContent from '../../components/NavBarContent';

import Inbound from './Component/Inbound';
import Inbounds from './Component/Inbounds';

const useStyles = makeStyles(theme => ({
    root: {
      display: 'flex',
    },
    content: {
      flexGrow: 1,
      // padding: theme.spacing(3),
      // transition: theme.transitions.create('margin', {
      //   easing: theme.transitions.easing.sharp,
      //   duration: theme.transitions.duration.leavingScreen,
      // }),
      // marginLeft: -drawerWidth,
    },
    contentShift: {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    },
    drawerHeader: {
      display: 'flex',
      alignItems: 'center',
      padding: theme.spacing(0, 1),
      ...theme.mixins.toolbar,
      justifyContent: 'flex-end',
    },
  }));
export default function FixedContainer() {
  const classes = useStyles();
  return (
      <div className={classes.root}>
          <CssBaseline />
          <Header showButton={true} />
          <NavBar items={<NavbarItems />} />
          <NavBarContent >
          <Inbounds />
          </NavBarContent>
          <Inbound />
          
      </div>
  );
}