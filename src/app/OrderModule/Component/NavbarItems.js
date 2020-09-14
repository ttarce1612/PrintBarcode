/**
 * Copyright (c) 2019 OVTeam
 * Modified date: 2019/11/11
 * Modified by: Duy Huynh
 */
import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import AddIcon from '@material-ui/icons/Add';
import AccountTree from '@material-ui/icons/AccountTree';

const dispatcher = require('./../../../libs/dispatcher');

export default function NavbarItems(props) {

  const addNewHandle = () => {
    dispatcher.dispatch('role_add_new', {
      action: "CREATE", data: {
        rolename: "",
        description: ""
      }
    });
  }

  const sideList = () => {

    let items = [];

    items.push(
      <ListItem button key={"Add New"} onClick={addNewHandle}>
        <ListItemIcon>
          <AddIcon />
        </ListItemIcon>
        <ListItemText primary={"Tạo Mới"} />
      </ListItem>
    );
    items.push(
      <ListItem selected button key={"Role-List"} onClick={e => { window.dispatchEvent(new CustomEvent('add_role_callback')) }}>
        <ListItemIcon>
          <AccountTree />
        </ListItemIcon>
        <ListItemText primary={"Danh Sách"} />
      </ListItem>
    );

    return items;
  };

  return <List>{sideList()}</List>
}
