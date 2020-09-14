
/**
 * Copyright (c) 2019 OVTeam
 * Modified date: 2019/11/11
 * Modified by: Duy Huynh
 */
import React from 'react';
import Button from '@material-ui/core/Button';
import { useHistory } from 'react-router-dom';

export default function RedirectButton(props) {
    const history = useHistory();
    return (
        <Button className={props.cls} onClick={(e)=>history.push(props.path)}  variant="contained" size="medium" color="primary">
          {props.title}
        </Button>
    )
}