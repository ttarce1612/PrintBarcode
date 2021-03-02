
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
function sendToSmartPrint(qrCode1, qrCode2, qrCode3, qrCode4) {
  console.log("sendToSmartPrint -> qrCode4", qrCode4)
  console.log("sendToSmartPrint -> qrCode3", qrCode3)
  console.log("sendToSmartPrint -> qrCode2", qrCode2)
  console.log("sendToSmartPrint -> qrCode1", qrCode1)

  if (!qrCode2) { qrCode2 = "" }
  if (!qrCode3) { qrCode3 = "" }
  if (!qrCode4) { qrCode4 = "" }

  let data = {
    label: "In QrCode.",
    printer_name: "PrinterQrCode", // Printer SmartPrint
    printer: "PrinterQrCode_Store", // Printer_Managerment
    printerDefault: "PrinterQrCode_Store",
    template: "PrinterQrCode", // Template
    data: { qr1: qrCode1, qr2: qrCode2, qr3: qrCode3, qr4: qrCode4 },
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
      resolve({ Status: "sent" });
    }
  })

}
const PrintQrcode = (req) => {
  return new Promise((resolve, reject) => {
    if (req) {
      if (req.sku && req.quantity > 0) {
        for (let i = 0; i < req.quantity; i++) {
          (function (ind) {
            setTimeout(function () {
              sendToSmartPrint(req.full_adress).then(result => {
                if (result.Status) {
                  resolve(result)
                } else {
                  reject(result)
                }
              })
            }, (1000 * ind));
          })(i);
        }
      }
    }
  })
}

const PrintAllQrcode = (req) => {
  console.log("PrintAllQrcode -> req", req)

  return new Promise((resolve, reject) => {

    if (req.length > 0) {
      let qrCodeList = req
      let paper = Math.ceil(qrCodeList.length / 4)
      console.log("PrintAllQrcode -> paper", paper)
      for (let i = 0; i < qrCodeList.length; i++) {
        let item = qrCodeList[i];
        (function (ind) {
          setTimeout(function () {
            sendToSmartPrint(item, item, item, item)
          }, (1000 * ind));
        })(i);
      }
    }
    resolve({result:true})
  })
}
module.exports = {
  PrintQrcode, PrintAllQrcode
}