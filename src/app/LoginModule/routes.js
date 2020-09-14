/**
 * Copyright (c) 2019 OVTeam
 * Modified date: 2019/11/11
 * Modified by: Duy Huynh
 */
import React from 'react';
import LoginModule from "./";
import ForgotPassword from "./../ForgotPasswordModule";
import { makeStyles, createStyles } from '@material-ui/core/styles';
import Background from '../../assets/background/login-register.jpg';

const useStyles = makeStyles((theme) => createStyles({
    root: {
        height: '100vh',
        backgroundImage: `url(${Background})`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        overflow: 'hidden'
    }
}));

function LoginPasswordComponent() {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <LoginModule />
        </div>
    )
}

function ForgotPasswordComponent() {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <ForgotPassword />
        </div>
    )
}

function getConfig() {
    return [
        {path: "/login", component: LoginPasswordComponent},
        {path: "/forgotpassword", component: ForgotPasswordComponent},
    ]
}
export {
    getConfig
}