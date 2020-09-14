/**
 * Copyright (c) 2019 OVTeam
 * Modified date: 2019/11/11
 * Modified by: Duy Huynh
 */

import React from 'react';
import TextField from '@material-ui/core/TextField';

export default function TField(props) {
    const {onChange} = props.inputProps;
    const [refresh, setRefresh] = React.useState(new Date());

    if(!props.inputProps.override) {
        props.inputProps.override = true;
        props.inputProps['onChange'] = (event) => {
            let val = event.target.value;
            props.formData[props.inputProps.name] = val;

            if(onChange) {
                onChange(event, val);
            }
            let valid = true;
            let allowValidate = false;
            if(props.inputProps.required) {
                valid = val?true:false;
                allowValidate = true;
            }
            if(props.inputProps.pattern) {
                valid = props.pattern.test(val);
                allowValidate = true;
            }
            if(allowValidate) {
                props.inputProps['error'] = !valid;
                setRefresh(new Date());
            }
        }
    }

  return (<TextField {...props.inputProps} />);
}
