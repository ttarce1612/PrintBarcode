/**
 * Copyright (c) 2019 OVTeam
 * Modified by: Duy Huynh
 * Modified date: 2019/11/11
 */
const objectModel = require("./../data/userModel"),
    sortObj = require('sort-object'),
    { demoURL } = require('./../config');
const baseHandle = require('./../handles/baseHandle');
const utils = require("../lib/utils");
const DEFAULT_FIELDS = { name: 1, loginname: 1, id: 1, email: 1, engineerid: 1, printname: 1, phone: 1 },
    SP_INFO = {
        ROOT_PN: 'DEMO',
        ROOT_ROLE: 'ADMINISTRATOR'
    };

function validate(data, instance = null) {
    return new Promise(resolve => {
        if (!data || !Object.keys(data).length) {
            resolve({ Status: false, Data: 'Data invalid' });
        } else {
            let filterData = {}, flag = false, accessable = false;
            if (Array.isArray(data.accesssite) && data.accesssite.length > 0) {
                accessable = true;
                filterData.accesssite = [];
                for (let site of data.accesssite) {
                    if (site.props && site.props.Initial) {
                        flag = true;
                        filterData.accesssite.push({
                            'props.Initial': site.props.Initial,
                            name: site.name
                        });
                    }
                }
                if (!flag) delete filterData.accesssite;
            }
            require("./../lib/dataValidator").unique(objectModel, filterData, true, data._id).then(res => {
                let result = { Status: res.status, Data: res.message, Sites: res.site };
                if (instance) {
                    instance.validate(error => {
                        let listError = {};
                        if (error) {
                            for (let i in error.errors) {
                                listError[i] = error.errors[i].message;
                            }
                        }
                        /* START Add Initial to List Error - Huy Nghiem - 12/11/2019 */
                        let _accesssite = data.accesssite;
                        for (let _site of _accesssite) {
                            if (_site.props && _site.props.Initial != undefined && _site.props.Initial == "") {
                                listError["initial"] = 'Initial required.';
                            }
                        }
                        /* END Add Initial to List Error - Huy Nghiem - 12/11/2019 */

                        /* START Check phone number - Huy Nghiem - 12/11/2019 */
                        let _is2fa = data.is2fa,
                            _fa2mode = data.fa2mode,
                            _phone = data.phone;
                        if (_is2fa && _fa2mode && _fa2mode.sms && _phone == "") {
                            listError["phone"] = 'Phone number required.';
                        } 
                        // else if (_phone) {
                        //     let regionCode = utils.getRegionCode(data.countrycode),
                        //         formatNumber = _phone.trim().replace(/[^0-9]/g, ''),
                        //         phoneNumPattern = /^[(]{0,1}[0-9]{3}[)]{0,1}[-\s\.]{0,1}[0-9]{3}[-\s\.]{0,1}[0-9]{0,11}$/,
                        //         isValidNumber = false;
                        //     // Check format number
                        //     if (phoneNumPattern.test(_phone))
                        //         isValidNumber = true;
                        //     // Check valid global number
                        //     if (isValidNumber) {
                        //         const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
                        //         const number = (formatNumber.length < 18) ? phoneUtil.parseAndKeepRawInput(_phone, regionCode) : "";
                        //         isValidNumber = (number) ? phoneUtil.isValidNumber(number) : false;
                        //     }
                        //     if (!isValidNumber)
                        //         listError["phone"] = 'Your phone number is not valid.';
                        // }
                        /* END Check phone number - Huy Nghiem - 12/11/2019 */

                        if (!Object.keys(listError).length) {
                            if (result.Status && !accessable) {
                                result.Status = false;
                                result.Data = 'No accessed site';
                            }
                            resolve(result);
                        } else {
                            listError = sortObj(listError, ["engineerid", "usersignature", "accesssite", "phone", "password", "loginname", "email", "name", "initial"]);
                            resolve({ Status: false, Data: listError });
                        }
                    });
                } else {
                    if (result.Status && !accessable) {
                        result.Status = false;
                        result.Data = 'No accessed site';
                    }
                    resolve(result);
                }
            });
        }
    });
}

function validateSite(data) {
    let res = { Status: true, Site: false };
    if (Array.isArray(data.accesssite) && data.accesssite.length > 0) {
        for (let site of data.accesssite) {
            if (site.url === demoURL) {
                res.Site = true;
                break;
            }
        }
    }
    return res;
}

function find(start, limit, searchText) {
    if (!start) start = 0;
    if (!limit) limit = 20;

    let searchParam = {};
    if (searchText.trim() != "") {
        searchParam = { $or: [{ name: new RegExp(searchText, 'i') }, { code: new RegExp(searchText, 'i') }] };
    }

    return baseHandle.paginate(objectModel, Object.assign({ isdeleted: 0 }, searchParam), {
        page: start, limit: limit,
        fields: DEFAULT_FIELDS,
        sort: { lastmodified: 1 }
    });
}

function retrieve(searchParams = null, fields = null, sort = null) {
    return new Promise(resolve => {
        if (searchParams && Object.keys(searchParams).length) {
            baseHandle.retrieve(objectModel, searchParams, {
                fields: fields || DEFAULT_FIELDS,
                sort: sort || { lastmodified: 1 }
            }).then(res => {
                resolve(res);
            });
        } else {
            resolve({ Status: false, Data: 'Data invalid' });
        }
    });
}

function navigate(direction, name) {
    direction = direction.toLowerCase();
    //If in init screen (do not chose any cust, if user click PREV => go to FIRST, if user click on NEXT => go to LAST
    if (!name || name.trim() == "") {
        if (direction == "prev") {
            direction = "first";
        } else if (direction == "next") {
            direction = "last";
        }
    }

    let sort = (direction == 'next' || direction == 'first') ? 1 : -1,
        searchParams = { isdeleted: 0 };

    if (direction == 'prev' && name) {
        searchParams.name = { $lt: name };
    } else if (direction == 'next' && name) {
        searchParams.name = { $gt: name };
    }

    return new Promise(resolve => {
        retrieve(searchParams, null, sort).then(res1 => {
            if (res1.Status) {
                resolve(res1);
            } else {
                retrieve({ isdeleted: 0 }, null, sort).then(res2 => {
                    resolve(res2);
                });
            }
        });
    });
}

function save(searchParam, data) {
    return new Promise(resolve => {
        if (data) {
            data.lastmodified = new Date();
            delete data['__v'];
            baseHandle.save(objectModel, searchParam, data).then(res => {
                resolve(res)
            });
        } else {
            resolve({ Status: false, Data: 'Data invalid' });
        }
    });
}

function remove(filter) {
    return baseHandle.remove(objectModel, filter, false);
}

function initiate(id, name, code, description) {
    code = code.trim().replace(/(^\W+|\W+$)/g, '').trim();
    return {
        code: code.replace(/[^\w]/g, '_').toUpperCase(),
        id, name, description,
        sites: [],
        isdeleted: 0,
        lastmodified: new Date(),
        modifiedby: ''
    };
}

module.exports = {
    find, save, navigate, retrieve, remove, initiate, validate, validateSite
};