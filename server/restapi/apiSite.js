/**
 * Copyright (c) 2019 OVTeam
 * Modified by: Duy Huynh
 * Modified date: 2019/11/11
 */
const { requestSite } = require('./RestAPI'),
    { demoURL } = require('./../config');
const customerHandle = require('./../handles/customerHandle'),
    timezoneHandle = require('./../handles/timezoneHandle'),
    roleHandle = require('./../handles/roleHandle'),
    accountHandle = require('./../handles/accountHandle');

async function getPartner(option = {}) {
    const res = await requestSite('/api/utility/combo/getpartnercombo', null, '/admin/security/user');
    let result = {};
    if (res.Success && Array.isArray(res.Data) && res.Data.length) {
        for (let item of res.Data) {
            const data = customerHandle.initiate(item.Id, item.Custid, item.Company);
            data.modifiedby = option.modifiedby || '';
            result[item.Custid] = await customerHandle.save({ custid: data.custid, isdeleted: 0 }, data);
        }
    } else {
        result = res;
    }
    return result;
}

async function getTimezone(option = {}) {
    const res = await requestSite('/api/utility/combo/gettimezonecombo', null, '/admin/security/user');
    let result = {};
    if (res.Success && Array.isArray(res.Data) && res.Data.length) {
        for (let item of res.Data) {
            const data = timezoneHandle.initiate(item.Id, item.Tzname, item.Tzvalue);
            data.modifiedby = option.modifiedby || '';
            result[item.Tzname] = await timezoneHandle.save({ name: data.name, isdeleted: 0 }, data);
        }
    } else {
        result = res;
    }
    return result;
}

async function getRole(option = {}) {
    const res = await requestSite('/api/utility/combo/getuserrolecombo', null, '/admin/security/user'),
        defaultSite = [{
            icon: "glyphicon glyphicon-globe",
            isdeleted: 0,
            lastmodified: "2017-11-10T09:18:32.352Z",
            modifiedby: "swadmin",
            order: 5,
            url: demoURL,
            title: "DEMO",
            name: "DEMO",
            _id: "5b449e3a68de71127caa4d76"
        }];

    let result = {};
    if (res.Success && Array.isArray(res.Data) && res.Data.length) {
        for (let item of res.Data) {
            const data = roleHandle.initiate(item.Id, item.Rolename, item.Rolename, item.Rolename);
            data.modifiedby = option.modifiedby || '';
            data.sites = defaultSite;
            result[data.code] = await roleHandle.save({ code: data.code, isdeleted: 0 }, data);
        }
    } else {
        result = res;
    }
    return result;
}

function putRole(data) {
    return new Promise(resolve => {
        const info = { Id: data.id || 0, Rolename: data.name };
        if (data.isdeleted) {
            requestSite('/api/user/userrole/delete', { id: data.id }, '/admin/security/userrole', false).then(res => {
                resolve(res);
            });
        } else {
            requestSite('/api/user/userrole/save', info, '/admin/security/userrole', true).then(res => {
                if (res.Data && res.Data.Id) {
                    roleHandle.save({ code: data.code, isdeleted: 0 }, { id: res.Data.Id }).then(aa => {
                    });
                }
                resolve(res);
            });
        }
    });
}

function putUser(data) {
    return new Promise(resolve => {
        let role_code = '';
        if (Array.isArray(data.accesssite) && data.accesssite.length) {
            for (let site of data.accesssite) {
                if (site.url === demoURL && site.props && site.props.Rule) {
                    role_code = site.props.Rule;
                    break;
                }
            }
        }
        if (role_code) {
            roleHandle.retrieve({ code: role_code, isdeleted: 0 }).then(roleRes => {
                if (roleRes.Status) {
                    const info = {
                        Id: data.id || 0,
                        Accountname: data.loginname,
                        Email: data.email,
                        Fullname: data.name,
                        Phone1: data.phone,
                        Phone2: '', Hashedpassword: '', ConfirmedPassword: '',
                        Roleid: roleRes.Data.id,
                        Isdeleted: data.locked || data.isdeleted,
                        Multipartner: data.partner ? data.partner.id : 0,
                        Timezoneid: data.timezone ? data.timezone.id : 0,
                    };
                    if (data.password) {
                        info.Hashedpassword = data.password;
                        info.ConfirmedPassword = data.password;
                    }
                   
                    requestSite('/api/user/users/save', info, '/admin/security/user', true).then(res => {
                        if (res.Data && res.Data.Id) {
                            accountHandle.save({ loginname: data.loginname, isdeleted: 0 }, { id: res.Data.Id });
                        }
                        resolve(res);
                    });
                } else {
                    resolve({ Success: false, Data: null, ErrorInfo: { System: { key: 'Role missed' } } });
                }
            });
        } else {
            resolve({ Success: false, Data: null, ErrorInfo: { System: { key: 'Role missed' } } });
        }
    });
}

module.exports = {
    getPartner, getTimezone, getRole, putRole, putUser
}