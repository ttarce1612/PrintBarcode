
/**
 * Copyright (c) 2019 OVTeam
 * Modified date: 2019/11/11
 * Modified by: Duy Huynh
 */
import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";
import Page404 from "./components/404";
const moduleList = require("./modules");

const security = require("./libs/security");
const Authen = require("./services/authen");

function FadingRoute({ component: Component, ...rest }) {
        return (
                <Route
                        {...rest}
                        render={routeProps => {
                                let isLogged = true;
                                if (rest.isCheckAuthentication) {
                                        isLogged = security.logged()
                                }
                                if (isLogged) {
                                        return (<Component {...routeProps} />)
                                }
                                else {
                                        return (<div></div>);
                                }
                        }}
                />
        );
}
export default class Routes extends React.Component {
        constructor(props) {
                super(props);
                this.state = {
                        routes: [],

                }
                Authen.sso().then((res) => {
                        if (res.isvalid) {
                                let _routes = this.registerModule(true);
                                this.setState({ routes: _routes });
                        } else {
                                let isLogged = security.logged(true);
                                {
                                        this.setState({ routes: this.registerModule(false) });
                                }
                        }
                });
        }

        checkState() {
                window.localStorage.removeItem('_site');
                window.localStorage.removeItem('_admin');
                Authen.getState()
                        .then((res) => {
                                console.log(111, res);
                                let isAdmin = false;
                                if (res.status === 200) {
                                        if (res.data.status === true) {
                                                isAdmin = true;
                                                window.localStorage.setItem('_site', JSON.stringify(res.data.sites || []));
                                                window.localStorage.setItem('_admin', res.data.isadmin);
                                                isAdmin = res.data.isadmin;
                                        }
                                }
                                let _routes = this.registerModule(isAdmin);
                                this.setState({ routes: _routes });

                        });
        }

        registerModule(isAdmin) {
                let routes = [];
                for (let name in moduleList) {
                        let confs = moduleList[name]['module'].getConfig();
                        for (let i = 0; i < confs.length; i++) {
                                confs[i].isCheckAuthentication = moduleList[name].isCheckAuthentication;
                                routes.push(
                                        <FadingRoute key={name + i}  {...confs[i]} />
                                )
                        }
                }
                let redirect = <Redirect to="/printbarcode" />
                if (!window.localStorage.getItem("token")) {
                        redirect = <Redirect to="/login" />
                        
                }
                console.log("Routes -> registerModule -> redirect", redirect)
                return (
                        <Switch>
                                <Route exact path="/" >
                                        {redirect}
                                </Route>
                                {routes}
                                <FadingRoute path="*" component={Page404} />
                        </Switch>
                )
        }
        render() {
                return (
                        <Router>
                                {this.state.routes}
                        </Router>
                )
        }
}