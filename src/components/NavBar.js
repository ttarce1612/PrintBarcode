/**
 * Copyright (c) 2019 OVTeam
 * Modified date: 2019/11/11
 * Modified by: Duy Huynh
 */
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';

const dispatcher = require("./../libs/dispatcher");

const useStyles = makeStyles(theme =>({
  drawer: {
    flexShrink: 0,
    zIndex: 2
  },
  drawerPaper: {
    width: theme.navbarLeft.width,
    marginTop: theme.header.height,
    borderRight: 'none'
  },
  toolbar: theme.mixins.toolbar,
}));

export default function NavBar(props) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(true);

   //Register event
   dispatcher.register('nav_bar_toogle.left', () => {
    setOpen(!open);
  });

  //un-Mount component
  React.useEffect(() => {
    return () => {
        // dispatcher.destroy('nav_bar_toogle.left');
    };
  }, []);

  const sideList = () => (
    <div
      className={classes.toolbar}
      role="presentation"
    >
      {props.items || []}
    </div>
  );

  return (
      <Drawer className={classes.drawer}
        variant="persistent"
        classes={{
          paper: classes.drawerPaper,
        }} open={open}>
        {sideList('left')}
      </Drawer>
  );
}
