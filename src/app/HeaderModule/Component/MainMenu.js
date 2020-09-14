/**
 * Copyright (c) 2019 OVTeam
 * Modified date: 2019/11/11
 * Modified by: Duy Huynh
 */
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import MenuItem from './../../../components/Menu/MenuItem';
import MenuItemList from './../../../components/Menu/ItemList';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
  },
  avatar: {
    marginLeft: 10,
  },
  paper: {
    marginRight: theme.spacing(2),
  },
  menu: {
    color: '#fff',
    marginRight: "60px",
    paddingLeft: "16px",
    paddingRight: "16px",
    paddingBottom: "4px",
    paddingTop: "4px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    height: "50px",
    width: "100%",
    position: "relative",
    boxSizing: "border-box",
    textAlign: "left",
    alignItems: "center",
    paddingTop: "8px",
    paddingBottom: "8px",
    justifyContent: "flex-start",
    textDecoration: "none"
  }
}));

export default function MenuListComposition() {
  const classes = useStyles();
  const [open] = React.useState(false);
  const anchorRef = React.useRef(null);

  const prevOpen = React.useRef(open);
  React.useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }

    prevOpen.current = open;
  }, [open]);

  const items = [{
    title: "Inbounds",
    path: '/inbounds'
  }, {
    title: "Outbounds",
    path: '/outbounds'
  }, {
    title: "Orders",
    path: '/orders'
  }];

  // let isAdmin = window.localStorage.getItem('_admin') === 'true';
  
  // if(isAdmin === false) {
  //   return (<div></div>);
  // }

  const listMenu = () => {
    let data = [];
    for(let i = 0; i < items.length; i++) {
      data.push(
        <a key={"submenu"+i} className={classes.menu} href={items[i].path}>
          {items[i].title}
        </a>
      );
    }
    return data;
  }

  return (
    <div className={classes.root}>
      <div>
          {listMenu()}
      </div>
    </div>
  );
}
