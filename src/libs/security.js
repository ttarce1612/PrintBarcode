
/**
 * Copyright (c) 2019 OVTeam
 * Modified date: 2019/11/11
 * Modified by: Duy Huynh
 */

module.exports = {
    logged: (disableRedirect) => {
        let _refs_= localStorage.getItem('user_info');
        let valid = false;
        if (_refs_) {
                valid = true;
        }
        if(disableRedirect === true) {
            return valid;
        }
        if (valid === false) {
            window.location.href = "/login";
        }
        return valid;
    }
}