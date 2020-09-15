/**
 * Copyright (c) 2019 OVTeam
 * Modified date: 2019/11/11
 * Modified by: Duy Huynh
 */

import PrintBarcodeModule from "./";

function getConfig() {
    return [
        {path: "/printbarcode", component: PrintBarcodeModule},
    ]
}
export {
    getConfig
}