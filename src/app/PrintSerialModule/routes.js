/**
 * Copyright (c) 2019 OVTeam
 * Modified date: 2019/11/11
 * Modified by: Duy Huynh
 */

import PrintSerialModule from "./";

function getConfig() {
    return [
        {path: "/printserial", component: PrintSerialModule},
    ]
}
export {
    getConfig
}