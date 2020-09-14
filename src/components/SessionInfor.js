import React from 'react';
import Button from '@material-ui/core/Button';
import logoutLogo from '../assets/logo/logout.ico';
import Utils from './../libs/utils';

export default function CustomizedMenus() {
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleClick = event => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const getSession = () => {
        let uInfo = Utils.getClientInfo();
        return uInfo;
    }

    const logout = () => {
        window.localStorage.removeItem("u_token");
        window.localStorage.removeItem("d_type");
        window.localStorage.removeItem("u_w");
        window.localStorage.removeItem("full_name");
        window.location.href = "/login";
    }


    return (
        <div>
            <span style={{paddingRight:"20px", fontSize:"20px"}}>{getSession()}</span>
            <img src={logoutLogo} style={{ width: "40px", cursor: 'pointer' }} onClick={logout} />
        </div>
    );
}
