/**
 * Copyright (c) 2019 OVTeam
 * Modified date: 2019/11/11
 * Modified by: Duy Huynh
 */
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';

import MenuItem from './../../../components/Menu/MenuItem';
import MenuItemList from './../../../components/Menu/ItemList';

const authen = require("./../../../services/authen");

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

  let acc = localStorage.getItem("_acc_");
  if (acc) {
    acc = JSON.parse(acc);
  }
  const title = acc ? acc['username'] : "";

  const subItems = [
    // {
    //   title: "Thiết lập"
    // },
    {
      title: "Đăng xuất",
      onClick: (event) => { authen.logout() }
    }];

  const showAvatar = () => {
    let subs = title.split(" ");
    let sub = "";
    for (let i = 0; i < subs.length; i++) {
      if (i > 2)
        break;
      sub += subs[i][0].toUpperCase();
    }
    return (<Avatar className={classes.avatar}>{sub}</Avatar>);
  }

  return (
    <div className={classes.root + " app-header-uinfo"}>
      <div>
        <MenuItem title={title} icon={showAvatar()}>
          <MenuItemList items={subItems} />
        </MenuItem>
      </div>
    </div>
  );
}
