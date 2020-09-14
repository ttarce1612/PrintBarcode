/**
 * Copyright (c) 2019 OVTeam
 * Modified date: 2019/11/11
 * Modified by: Duy Huynh
 */
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Link } from "react-router-dom";
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    display: 'none',
    position: 'absolute',
    width: 'max-content',
    maxWidth: 360,
    backgroundColor: theme.palette.background.header,
  },
  link: {
    textDecoration: 'none',
    color: theme.palette.text.primary,
  }
}));

export default function SelectedListItem(props) {
  const classes = useStyles();

  const items = () => {
    let _items = props.items;
    let data = [];
    for(let i = 0; i < _items.length; i++) {
      data.push(
        <ListItem
          key={"submenu"+i}
          button
          {..._items[i]}
        >
          <Link to={_items[i].path || ""} className={classes.link}>
            <ListItemText primary={_items[i].title} />
          </Link>
        </ListItem>
      );
    }
    return data;
  }

  return (
    <List
      disablePadding={true}
      component="ul" className={classes.root + " app-menu-subnav-content"}>
      {items()}
    </List>
  );
}
