/**
 * Copyright (c) 2019 OVTeam
 * Modified date: 2019/11/11
 * Modified by: Duy Huynh
 */
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import SvgIcon from '@material-ui/core/SvgIcon';
import "./style.css";

const useStyles = makeStyles(theme => ({
  root: {
    padding: 0
  },
  popover: {
    pointerEvents: 'none',
  },
  btn: {
    textTransform: 'initial'
  }
}));

function PullDownIcon(props) {
  return (
    <SvgIcon {...props} style={{ fontSize: "1.2em", marginLeft: 5 }} >
      <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" />
    </SvgIcon>
  );
}

export default function MouseOverPopover(props) {
  const classes = useStyles();

  const _icon = () => {
    if(props.icon) {
      return props.icon;
    }
    if(props.children) {
      return (<PullDownIcon />);
    }
    return [];
  }
  return (
    <div>
        <List component="ul" className={classes.root + " app-menu-parent"} style={{marginLeft: 20}}>
          <ListItem button style={{paddingBottom: 4, paddingTop: 4}}>
            <ListItemText primary={props.title} />
            {_icon()}
          </ListItem>
          { props.children }
        </List>
    </div>
  );
}
