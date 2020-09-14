const CryptoJS = require("crypto-js");

function generateList(item) {
  let listPrint = []
  for (let i = 1; i <= item.number; i++) {
    let unit = generateUnit(item.code, i)
    listPrint.push(unit)
  }
  return listPrint
}
function generateUnit(code, autonumber) {
  return code + genereateAutoNumber(autonumber, 4)
}
function genereateAutoNumber(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}
function sendToSmartPrint(serial1, serial2, serial3) {
  if (!serial2) { serial2 = "" }
  if (!serial3) { serial3 = "" }
  let data = {
    label: "In Serial.",
    printer_name: "PrinterSerial",
    printer: "PrinterSerial",
    printerDefault: "SerialLabel",
    template: "SerialLabel",
    data: { unitcode1: serial1, unitcode2: serial2, unitcode3: serial3 },
    url: ""
  }
  new Promise(function (resolve, reject) {
    if (!data) {
      resolve({ Status: "FINISHED" });
    }
    var ws = new WebSocket("ws://127.0.0.1:2377/");
    ws.onerror = function () {
      resolve({ Status: "FINISHED" });
      ws.close();
    }
    ws.onmessage = function (event) {
      if (data) {
        ws.close();
      }
    };
    ws.onclose = function () {
      resolve({ Status: "FINISHED" });
    }
    ws.onopen = function () {
      ws.send(
        CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(JSON.stringify(data)))
      );
    }
  })

}
module.exports = {
  PrintSerial: async (req, res) => {
    if (req.sucess > 0) {
      let _serialList = req.serialList
      let paper = Math.ceil(_serialList.length / 3)
      for (let i = 0; i < paper; i++) {
        (function (ind) {
          setTimeout(function () {
            sendToSmartPrint(_serialList[ind * 3], _serialList[(ind * 3) + 1], _serialList[(ind * 3) + 2])
          }, (1000 * ind));
        })(i);
      }
    }
  }
}