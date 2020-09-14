const mongoose = require("mongoose"),
    passwordHash = require('password-hash'),
    Account = require("./../../data/userModel"),
    _ = require("underscore"),
    { checkCaseInsensitive, syncAccount2Sites, parseAccountInfo } = require("./../../utils/ovutility"),
    accountHandle = require('./../../handles/accountHandle');

const mailer = require('./../../lib/mailer');

module.exports = {
    createAccount(req, res) {
        const account = new Account({ ...req.body });
        accountHandle.retrieve({ loginname: checkCaseInsensitive(account.loginname) }).then(resp2 => {
            if (resp2.Status) {
                res.json({ Status: false, Data: `${account.loginname} existed.` });
            } else {
                account._id = mongoose.Types.ObjectId();
                account.isdeleted = 0;
                account.locked = false;
                account.insertnew = true;
                let _p  = account.password;
                if (account.password !== '') {
                    account.password = passwordHash.generate(account.password);
                }
                const __data = account.toObject();
                accountHandle.save({
                    _id: account._id,
                    // insertnew: true
                }, __data).then(resp3 => {
                    if (resp3.Status) {
                        let _mcontent = "<!DOCTYPE html><html><body><p>Tạo mới tài khoản thành công.</p><p>Dưới đây là thong tin tài khoản:</p><p>Tài Khoản: account</p><p>Mật Khẩu: pasword</p></body></html>";
                        _mcontent = _mcontent.replace("account", account.loginname);
                        _mcontent = _mcontent.replace("password", _p);
                        mailer.send({
                            to: __data.email,
                            subject: "Tạo Mới Tài Khoản OVAuthen",
                            content: _mcontent
                        });
                        res.json({ Status: true, Data: "Created successfully" });
                    } else {
                        res.send(resp3);
                    }
                });
            }
        });
    },
    updateAcc(req, res) {
        Account.findById(req.body._id).exec(function (err, account) {
            if (err || !account) {
                res.send({ Status: false, Data: err ? err.message : 'Data not found' });
            } else {
                account = new Account(_.extend(account, req.body));
                if (req.body.password) {
                    account.password = passwordHash.generate(req.body.password);
                }
                const __data = account.toObject();
                delete __data['__v'];
                accountHandle.save({ _id: account._id }, __data).then(resp3 => {
                    if (resp3.Status) {
                        res.json({ Status: true, Data: "Updated succesfully" });
                    } else {
                        res.send(resp3);
                    }
                });
            }
        });
    },
    getList(req, res) {
        let query = { isdeleted: 0 };
        let options = {
            select: 'loginname email name',
            sort: { lastmodified: -1 },
            page: parseInt(req.query.page),
            limit: parseInt(req.query.limit || 5)
        };
        let keyword = (req.body.keyword || req.query.keyword) || "";
        if (keyword) {
            keyword = new RegExp(keyword, 'ig');
            const fields = ['loginname', 'name', 'email']
            query['$or'] = [];
            fields.map(function (item) {
                let opt = {};
                opt[item] = keyword;
                query['$or'].push(opt)
            });
        }
        Account.paginate(query, options).then(function (result) {
            res.json(result);
        });
    },
    deleteAcc(req, res) {
        let loginList = [];
        if (req.body) {
            for (let i in req.body) {
                if (req.body[i].loginname) {
                    loginList.push(req.body[i].loginname);
                }
            }
        }
        if (loginList.length) {
            Account.update({ loginname: { "$in": loginList } }, { '$set': { isdeleted: 1 } }, { multi: true }, function (err, raw) {
                if (err) {
                    res.send({ status: false, message: err });
                } else {
                    syncAccount2Sites(req.body, "/api/account/deletebyapi");
                    res.send({ status: true, message: "The accounts: [" + loginList.join(", ") + "] were/was deleted successfully." });
                }
            });
        } else {
            res.send({ status: false, message: "Access denied." });
        }
    },
    getOne(req, res) {
        let id = req.params.id;//depend requires we will add more parameters on request
        //that parameters stay on url by GET method, if we use POST method, we can use req.body parse json string
        Account.findById(id, function (err, doc) {
            if (err || !doc) {
                res.send(err);
            } else {
                let account = doc.toObject();
                delete account.password;
                // let sites = {};
                // if (account.sites) {
                //     for (let i in account.sites) {
                //         sites = { ...sites, ...account.sites[i] };
                //     }
                // }
                // account.sites = sites;
                res.json(account);
            }
        });
    }
};