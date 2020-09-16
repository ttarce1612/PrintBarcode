const CryptoJS = require("crypto-js");
const toast = require("./toast");

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
function sendToSmartPrint(barcode) {
  let data = {
    label: "In Barcode.",
    printer_name: "PrinterBarcode",
    printer: "PrinterBarcode",
    printerDefault: "BarcodeLabel",
    template: "BarcodeLabel",
    data: { code: barcode },
    url: ""
  }
  return new Promise(function (resolve, reject) {
    if (!data) {
      resolve({ Status: false, message: "no data" });
    }
    var ws = new WebSocket("ws://127.0.0.1:2377/");
    ws.onerror = function (err, err2) {
      resolve({ Status: false, message: "Can not conect to SmartPrint" });
      ws.close();
    }
    ws.onmessage = function (event) {
      if (data) {
        ws.close();
      }
    };
    ws.onclose = function () {
      resolve({ Status: false, message : "WS is closed" });
    }
    ws.onopen = function () {
      ws.send(
        CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(JSON.stringify(data)))
      );
      resolve({ Status: true, message : "Sent" });
    }
  })

}
module.exports = {
  PrintBarcode: async (req, res) => {
    if (req) {
      if (req.sku && req.quantity > 0) {
        for (let i = 0; i < req.quantity; i++) {
          (function (ind) {
            setTimeout(function () {
              sendToSmartPrint(req.barcode).then(result => {
                if(result.Status) {
                  toast.message("Printting")
                } else {
                  toast.error(result.message)
                }
              })
            }, (1000 * ind));
          })(i);
        }
      }
    }
  }
}