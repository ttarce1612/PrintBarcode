import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Logo from '../../../assets/logo/logo.png';
import Utils from './../../../libs/utils';
import PowerSettingsNewIcon from '@material-ui/icons/PowerSettingsNew';
const useStyles = makeStyles((theme) => ({
    root: {
        '& > *': {
            margin: theme.spacing(1),
        },
    },
}));

export default function LoginSession(props) {
    const classes = useStyles();
    const logout = () => {
        window.localStorage.removeItem("u_token");
        window.localStorage.removeItem("d_type");
        window.localStorage.removeItem("u_w");
        window.localStorage.removeItem("full_name");
        window.location.href = "/login";
    }
    const getSession = () => {
        let uInfo = Utils.getClientInfo();
        return uInfo;
    }
    return (
        <div className={classes.root}>
            <img src={Logo} style={{ height: "35px", float: "left" }}></img>
            <div style={{ float: "right" }}>
                <span style={{paddingRight:"20px", fontSize:"25px"}}>{getSession()}</span>
                <PowerSettingsNewIcon variant="contained" style={{cursor:"pointer"}} onClick={logout}>Logout</PowerSettingsNewIcon>
            </div>
            
        </div>
    );
}