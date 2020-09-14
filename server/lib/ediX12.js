var _x12 = require("x12/core");
var _ = require("underscore");

var PO8504010 = require("../data/PO8504010");

let REFs = {
    CO: "Customer Order Number",
    EU: "End User's Purchase Order Number",
    QK: "Sales Program Number",
    BB: "Authorization Number",
    PLA: "Product Licensing Agreement Number",
    AH: "Agreement Number",
    Q1: "Quote Number",
    PD: "Promotion/Deal Number",
    SE: "Serial Number",
    S6: "Stock Number",
    CT: "Contract Number",
    PG: "Product Group",
    PR: "Price Quote Number"
};

let DTMs = {
    "002": "Delivery Requested",
    "118": "Requested Pickup"
};

let TD5s = {
    H: "Customer Pickup",
    T: "Best Way (Shippers Option)"
};

let POs = {
    CB: "Buyer's Catalog Number",
    BP: "Buyer's Part Number",
    VP: "Vendor's Part Number"
};



const _SEPARATOR_ = "___";
const SEG_TEMINATOR = "~";
const ELE_SEPARATOR = "*";

function generateId(len) {
    if (!len) {
        len = 4;
    }
    var no = Math.random().toString().split(".").join("");
    return no.substr(1, len);
}

function rightpad(str, len, pad) {
    if (len + 1 >= str.length) {
        str += Array(len + 1 - str.length).join(pad);
    }
    return str;
}

function _toString(arData, delimiter, type) {
    if (typeof (type) === "string" && type !== "") {
        switch (type.toUpperCase()) {
            case "ISA":
                arData[0] = rightpad(arData[0], 3, " ");
                arData[1] = rightpad(arData[1], 2, " ");
                arData[2] = rightpad(arData[2], 10, " ");
                arData[3] = rightpad(arData[3], 2, " ");
                arData[4] = rightpad(arData[4], 10, " ");
                arData[5] = rightpad(arData[5], 2, " ");
                arData[6] = rightpad(arData[6], 15, " ");
                arData[7] = rightpad(arData[7], 2, " ");
                arData[8] = rightpad(arData[8], 15, " ");
                arData[9] = rightpad(arData[9], 6, " ");
                arData[10] = rightpad(arData[10], 4, " ");
                arData[11] = rightpad(arData[11], 1, " ");
                arData[12] = rightpad(arData[12], 5, " ");
                arData[13] = rightpad(arData[13], 9, " ");
                arData[14] = rightpad(arData[14], 1, " ");
                arData[15] = rightpad(arData[15], 1, " ");
                arData[16] = rightpad(arData[16], 1, " ");
                break;
        }
    }
    return arData.join(delimiter);
}

function getSegId(segid, data) {
    var i = 0;
    while (i <= 1000) {
        var _s = segid + _SEPARATOR_ + i;
        if (data[_s] === undefined) {
            return _s;
        }
        i++;
    }
    return segid;
}

function splitMultiX12(strContent) {
    if (typeof (strContent) !== "string") {
        return null;
    }
    var delimiter = "ISA*";
    var X12s = strContent.split(delimiter);
    var result = [];
    if (X12s !== null) {
        for (var i in X12s) {
            if (X12s[i] !== "") {
                result.push(delimiter + X12s[i]);
            }
        }
    }
    return result;
}

function parse004010850(raw) {
    let jsonX12 = {};

    let _startW = "BEG___0";
    let _endW = "CTT___0";

    let perOfN1 = -1;
    let msgOfN9 = -1;

    for (var key in raw) {
        var keys = key.toString().split(_SEPARATOR_);
        var suffix = _SEPARATOR_ + keys[1];

        if (key === _startW) {
            jsonX12["status"] = raw[key][0];
            jsonX12["type"] = raw[key][1];
            jsonX12["poid"] = raw[key][2];
            jsonX12["date"] = raw[key][4];
            jsonX12["noItems"] = parseInt(raw[_endW][0]);
        } else if (keys[0] === "REF") {
            if (jsonX12["refs"] === undefined) {
                jsonX12["refs"] = [];
            }
            jsonX12["refs"].push({
                type: raw[key][0],
                value: raw[key][1]
            });
        } else if (keys[0] === "DTM") {
            if (jsonX12["dtms"] === undefined) {
                jsonX12["dtms"] = [];
            }
            jsonX12["dtms"].push({
                type: raw[key][0],
                value: raw[key][1]
            });
        } else if (keys[0] === "N1") {
            if (perOfN1 === -1) {
                perOfN1 = 0;
            } else {
                perOfN1++;
            }
            var n3 = "N3" + suffix,
                n2 = "N2" + suffix,
                n4 = "N4" + suffix;
            if (jsonX12["addresses"] === undefined) {
                jsonX12["addresses"] = [];
            }
            jsonX12["addresses"].push({
                code: raw[key][0],
                name: raw[key][1],
                qualifier: raw[key][2],
                identificationcode: raw[key][3],

                additionalinfo: raw[n2] ? raw[n2][0] : "",

                street1: raw[n3] ? raw[n3][0] : "",
                street2: raw[n3] ? raw[n3][1] || "" : "",

                city: raw[n4] ? raw[n4][0] : "",
                state: raw[n4] ? raw[n4][1] : "",
                zipcode: raw[n4] ? raw[n4][2] : "",
                country: raw[n4] ? raw[n4][3] : ""
            });
        } else if (keys[0] === "TD5") {
            jsonX12["carrier"] = {
                methodcode: raw[key][3],
                routing: raw[key][4],
            };
        } else if (keys[0] === "PO1") {
            var pid = "PID" + suffix, po4 = "PO4" + suffix;
            if (jsonX12["items"] === undefined) {
                jsonX12["items"] = [];
            }

            perOfN1 = -1;

            jsonX12["items"].push({
                assignedid: raw[key][0],
                qty: raw[key][1],
                unit: raw[key][2],
                price: raw[key][3],
                consumerpackagecode: raw[key][5],
                consumerpackageno: raw[key][6],
                vendorcatalogcode: raw[key][7] || "",
                vendorcatalogno: raw[key][8] || "",
                manfcode: raw[key][9] || "",
                manfno: raw[key][10] || "",

                itemtype: raw[pid] ? raw[pid][0] : "",
                description: raw[pid] ? raw[pid][4] : "",

                physicalpack: raw[po4] ? raw[po4][0] : "",
                physicalsize: raw[po4] ? raw[po4][1] : "",
                physicalunit: raw[po4] ? raw[po4][2] : "",
            });
        } else if (keys[0] === "PER") {
            if (jsonX12["admincontact"] === undefined) {
                jsonX12["admincontact"] = [];
            }
            var _per = {
                code: raw[key][0],
                name: raw[key][1],
                type: raw[key][2] || "",
                value: raw[key][3] || "",
            };
            if (perOfN1 === -1) {
                jsonX12["admincontact"].push(_per);
            } else {
                jsonX12["addresses"][perOfN1]["admincontact"] = _per;
            }
        } else if (keys[0] === "CUR") {
            jsonX12["currencyowner"] = raw[key][0];
            jsonX12["currencycode"] = raw[key][1];
        } else if (keys[0] === "MSG") {
            if (jsonX12["memo"] === undefined) {
                jsonX12["memo"] = raw[key][0];
            } else {
                jsonX12["memo"] += " " + raw[key][0];
            }
        } else if (keys[0] === "N9") {
            if (jsonX12["attachment"] === undefined) {
                jsonX12["attachment"] = [];
            }
        } else if (keys[0] === "") {

        }
    }
    return jsonX12;
}

function compose004010855(raw) {
    let isaId = generateId(9), gsId = generateId(4), stId = generateId(4),
        ediVersion = "004010", ediType = "PR", ediCode = "855", ediFormat = "X";
    let ediDoc = [];

    let noOfItems = 0, noOfTrans = 1, noOfGroups = 1, noOfSegs = 0;

    var _isaSeg = _toString(["ISA", "00", "", "00", "", "", "", "", "", "date", "time", "U", "00401", isaId, "0", "P", ">"], "*", "ISA");
    ediDoc.push(_isaSeg);

    var _gsSeg = _toString(["GS", ediType, "sendercode", "receivercde", "date", "time", gsId, ediFormat, ediVersion], "*");
    ediDoc.push(_gsSeg);

    var _stSeg = _toString(["ST", ediCode, stId], "*");
    ediDoc.push(_stSeg);

    var _bakSeg = _toString(["BAK", "00", "AC", raw.poid, raw.date, "", generateId(8), "", "", ""], "*");
    ediDoc.push(_bakSeg);

    noOfSegs += 2;
    for (var i = 0; i < raw.items.length; i++) {
        var item = raw.items[i];
        noOfItems++;

        var _po1Seg = _toString(["PO1", item.assignedid, item.qty, item.unit, item.price, "NT", item.consumerpackagecode, item.consumerpackageno, item.vendorcatalogcode, item.vendorcatalogno, "", ""], "*");
        ediDoc.push(_po1Seg);

        var _ackSeg = _toString(["ACK", "IA", item.qty, item.unit, "", "", "", "UK", generateId(6)], "*");
        ediDoc.push(_ackSeg);

        noOfSegs += 2;
    }

    let tpl855 = [
        "ISA*00*          *00*          *12*ABCCOM         *01*999999999      *110527*1719*U*00400*000004438*0*P*>~",
        "GS*PR*4405197800*999999999*20110527*1719*1421*X*004010VICS~",
        "ST*855*1001~",
        "BAK*00*AC*ABC123*20000430*****20000430~",
        "DTM*067*20000507~",
        "N1*ST**21*HO1000A00~",
        "PO1*1*10*CA*72.95*CT*UK*50387698433528~",
        "ACK*IA*10*CA*067*20000507**UK*50387698433528~",
        "PO1*2*25*BX*15.75*CT*UK*30387698775411~",
        "ACK*IA*25*BX*067*20000507**UK*30387698775411~",
        "CTT*2~",
        "SE*10*1001~",
        "GE*1*1421~",
        "IEA*1*000004438~"
    ];

    ediDoc.push(_toString(["CTT", noOfItems], "*"));
    ediDoc.push(_toString(["SE", noOfSegs += 2, stId], "*"));
    ediDoc.push(_toString(["GE", noOfTrans, gsId], "*"));
    ediDoc.push(_toString(["IEA", noOfGroups, isaId], "*"));
    return _toString(ediDoc, "~\n\r") + "~";
}

function compose004010856(raw) {
    let tpl856 = [
        "ISA*01*0000000000*01*ABCCO     *12*4405197800     *01*999999999      *111206*1719*-*00406*000000049*0*P*>~",
        "GS*SH*4405197800*999999999*20111206*1045*49*X*004060~",
        "ST*856*0008~",
        "BSN*14*829716*20111206*142428*0002~",
        "HL*1**S~",
        "TD1*PCS*2****A3*60.310*LB~",
        "TD5**2*XXXX**XXXX~",
        "REF*BM*999999-001~",
        "REF*CN*5787970539~",
        "DTM*011*20111206~",
        "N1*SH*1 EDI SOURCE~",
        "N3*31875 SOLON RD~",
        "N4*SOLON*OH*44139~",
        "N1*OB*XYZ RETAIL~",
        "N3*P O BOX 9999999~",
        "N4*ATLANTA*GA*31139-0020**SN*9999~",
        "N1*SF*1 EDI SOURCE~",
        "N3*31875 SOLON ROAD~",
        "N4*SOLON*OH*44139~",
        "HL*2*1*O~",
        "PRF*99999817***20111205~",
        "HL*3*2*I~",
        "LIN*1*VP*87787D*UP*999999310145~",
        "SN1*1*24*EA~",
        "PO4*1*24*EA~",
        "PID*F****BLUE WIDGET~",
        "HL*4*2*I~",
        "LIN*2*VP*99887D*UP*999999311746~",
        "SN1*2*6*EA~",
        "PO4*1*6*EA~",
        "PID*F****RED WIDGET~",
        "CTT*4*30~",
        "SE*31*0008~",
        "GE*1*49~",
        "IEA*1*000000049~"
    ];
}

function x12Translator(strX12) {
    let xParser = new _x12.X12Parser(true);
    var _str = ["ISA*00*          *00*          *ZZ*SENDERISA      *14*0073268795005  *960807*1548*U*00401*000000020*0*T*>~",
        "GS*PO*SENDERGS*007326879*19960807*1548*1*X*004010~",
        "ST*850*000000001~",
        "BEG*00*SA*A99999-01**19971207~",
        "REF*VR*54321~",
        "ITD*01*3*1**15**16~",
        "DTM*002*19971219~",
        "DTM*015*20140528~",
        "N1*BT*BUYSNACKS INC.*9*1223334444~",
        "N3*P.O. BOX 0000~",
        "N4*TEMPLE*TX*76503~",
        "N1*ST*BUYSNACKS PORT*9*1223334445~",
        "N3*1000 N. SAMPLE HIGHWAY~",
        "N4*ATHENS*GA*30603~",
        "PO1**16*CA*12.34**CB*000111111*UA*002840022222~",
        "PID*F****CRUNCHY CHIPS LSS~",
        "PO4*48*7.89*LB~",
        "PO1**13*CA*12.34**CB*000555555*UA*002840033333~",
        "PID*F****NACHO CHIPS LSS~",
        "PO4*48*8.9*LB~",
        "PO1**32*CA*12.34**CB*000666666*UA*002840044444~",
        "PID*F****POTATO CHIPS~",
        "PO4*72*6.78*LB~",
        "PO1**51*CA*12.34**CB*000874917*UA*002840055555~",
        "PID*F****CORN CHIPS~",
        "PO4*48*8.9*LB~",
        "PO1**9*CA*12.34**CB*000874958*UA*002840066666~",
        "PID*F****BBQ CHIPS~",
        "PO4*48*4.5*LB~",
        "PO1**85*CA*12.34**CB*000874990*UA*002840077777~",
        "PID*F****GREAT BIG CHIPS LSS~",
        "PO4*48*4.56*LB~",
        "PO1**1*CA*12.34**CB*000875088*UA*002840088888~",
        "PID*F****MINI CHIPS LSS~",
        "PO4*48*4.56*LB~",
        "CTT*7~",
        "SE*35*000000001~",
        "ST*850*000000002~",
        "BEG*00*SA*A22222-13**19971207~",
        "REF*VR*54321~",
        "ITD*01*3*1**15**16~",
        "DTM*002*19971219~",
        "N1*BT*BUYSNACKS INC.*9*1223334444~",
        "N3*P.O. BOX 0000~",
        "N4*TEMPLE*TX*76503~",
        "N1*ST*BUYSNACKS PORT*9*1223334445~",
        "N3*1000 N. SAMPLE HIGHWAY~",
        "N4*ATHENS*GA*30603~",
        "PO1**16*CA*12.34**CB*000111111*UA*002840022222~",
        "PID*F****CRUNCHY CHIPS LSS~",
        "PO4*48*7.89*LB~",
        "PO1**13*CA*12.34**CB*000555555*UA*002840033333~",
        "PID*F****NACHO CHIPS LSS~",
        "PO4*48*8.9*LB~",
        "PO1**32*CA*12.34**CB*000666666*UA*002840044444~",
        "PID*F****POTATO CHIPS~",
        "PO4*72*6.78*LB~",
        "PO1**51*CA*12.34**CB*000874917*UA*002840055555~",
        "PID*F****CORN CHIPS~",
        "PO4*48*8.9*LB~",
        "PO1**9*CA*12.34**CB*000874958*UA*002840066666~",
        "PID*F****BBQ CHIPS~",
        "PO4*48*4.5*LB~",
        "PO1**85*CA*12.34**CB*000874990*UA*002840077777~",
        "PID*F****GREAT BIG CHIPS LSS~",
        "PO4*48*4.56*LB~",
        "PO1**1*CA*12.34**CB*000875088*UA*002840088888~",
        "PID*F****MINI CHIPS LSS~",
        "PO4*48*4.56*LB~",
        "CTT*7~",
        "SE*34*000000002~",
        "GE*2*1~",
        "GS*IN*SENDERDEPT*007326879*19960807*1548*2*X*004010~",
        "ST*810*000000001~",
        "BIG*19971211*00001**A99999-01~",
        "N1*ST*BUYSNACKS PORT*9*1223334445~",
        "N3*1000 N. SAMPLE HIGHWAY~",
        "N4*ATHENS*GA*30603~",
        "N1*BT*BUYSNACKS*9*1223334444~",
        "N3*P.O. BOX 0000~",
        "N4*TEMPLE*TX*76503~",
        "N1*RE*FOODSELLER*9*12345QQQQ~",
        "N3*P.O. BOX 222222~",
        "N4*DALLAS*TX*723224444~",
        "ITD*01*3*1.000**15**16*****1/15 NET 30~",
        "FOB*PP~",
        "IT1**16*CA*12.34**UA*002840022222~",
        "PID*F****CRUNCHY CHIPS LSS~",
        "IT1**13*CA*12.34**UA*002840033333~",
        "PID*F****NACHO CHIPS LSS~",
        "IT1**32*CA*12.34**UA*002840044444~",
        "PID*F****POTATO CHIPS~",
        "IT1**51*CA*12.34**UA*002840055555~",
        "PID*F****CORN CHIPS~",
        "IT1**9*CA*12.34**UA*002840066666~",
        "PID*F****BBQ CHIPS~",
        "IT1**85*CA*12.34**UA*002840077777~",
        "PID*F****GREAT BIG CHIPS LSS~",
        "IT1**1*CA*12.34**UA*002840088888~",
        "PID*F****MINI CHIPS LSS~",
        "TDS*255438~",
        "CAD*****FREEFORM~",
        "ISS*207*CA~",
        "CTT*7~",
        "SE*32*000000001~",
        "GE*1*2~",
        "IEA*2*000000020~"].join("");

    let isa = null;
    try {
        isa = xParser.parseX12(strX12);
    } catch (error) {
        throw error.message;
    }

    let gss = isa.functionalGroups;

    let data = {};

    for (var gi in gss) {
        var sts = gss[gi].transactions;

        var groupName = gss[gi].header.elements[0].value + _SEPARATOR_ + gss[gi].header.elements[7].value + _SEPARATOR_ + gss[gi].header.elements[5].value;
        if (data[groupName] === undefined) {
            data[groupName] = {
                Code: gss[gi].header.elements[0].value,
                Sender: gss[gi].header.elements[1].value,
                Receiver: gss[gi].header.elements[2].value,
                Date: gss[gi].header.elements[3].value,
                Time: gss[gi].header.elements[4].value,
                Id: gss[gi].header.elements[5].value,
                Agency: gss[gi].header.elements[6].value,
                Version: gss[gi].header.elements[7].value,
                Items: {}
            };
        }

        for (var si in sts) {
            var segs = sts[si].segments;

            var transactionName = sts[si].header.elements[0].value + _SEPARATOR_ + sts[si].header.elements[1].value;

            if (data[groupName].Items[transactionName] === undefined) {
                data[groupName].Items[transactionName] = {};
            }

            for (var ei in segs) {
                var els = segs[ei].elements;
                var segID = getSegId(segs[ei].tag, data[groupName].Items[transactionName]);
                if (data[groupName].Items[transactionName][segID] === undefined) {
                    data[groupName].Items[transactionName][segID] = [];
                }
                for (var i in els) {
                    data[groupName].Items[transactionName][segID].push(els[i].value);
                }
            }
        }
    }
    /*for (var i in jsonX12) {
        var item = new PO8504010(_.extend({}, jsonX12[i]));
        item.save(function (err) {
            console.log(JSON.stringify(err));
        });
    }*/
    return data;
}

module.exports = {
    translator: function (strX12) {
        let PO = [];
        let x12s = splitMultiX12(strX12);
        if (x12s === null || x12s.length <= 0) {
            return null;
        } else {
            for (var i in x12s) {
                var rawObj = x12Translator(x12s[i]);
                for (var edi in rawObj) {
                    var keys = edi.split(_SEPARATOR_);
                    for (var name in rawObj[edi].Items) {
                        var names = name.split(_SEPARATOR_);
                        if (keys[0] === "PO" && keys[1] === "004010" && names[0] === "850") {
                            jsonX12 = parse004010850(rawObj[edi].Items[name]);
                            PO.push(jsonX12);
                            /*var item = new PO8504010(_.extend({}, jsonX12));
                            item.save(function (err) {
                                console.log(JSON.stringify(err));
                            });*/
                        }
                    }
                }
            }
        }
        return PO;
    },
    composer: function (id, _callback) {
        //To be continue...
        PO8504010.findOne({ poid: id }, function (err, document) {
            var ediStr = compose004010855(document);
            _callback(ediStr);
        });
    }
};