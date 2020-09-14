const { ovakaiURL } = require('../../config');

const outboundHandle = require('../../handles/outboundHandle');

const request = require('request');

module.exports = {
    registerGatwayListener: () => {
        // if (global.jsonCLIENT_APP === undefined)
        //     return false;

        // CLIENT_APP.on('api_order_create', (data, requestid) => {
        //     orderHandle.create(data)
        //         .then((result) => {
        //             if (result) {
        //                 CLIENT_APP.emit("api_order_list_" + requestid, { Status: true, Data: result.socode }, requestid);
        //             } else {
        //                 CLIENT_APP.emit("api_order_list_" + requestid, { Status: false, Data: null }, requestid);
        //             }
        //         })
        // })
    },
    updateOrder(req, res) {
        request.post({
            url: `${ovakaiURL}/api/order/update`,
            body: req.body,
            json: true
        }, (err, httpRes, body) => {
            if (body.Status && body.Content && Object.keys(body.Content).length > 0) {
                let _data = body.Content;
                delete _data['_id'];
                outboundHandle.create(_data)
                    .then((result) => {
                        if (result) {
                            res.json({ Status: true, Data: result.code });
                        } else {
                            res.json({ Status: false, Data: "" });
                        }
                    });
            } else {
                res.json({ Status: false, Data: "Không thể xuất hàng. Vui lòng liên hệ Admin" });
            }
        });
    },
    getList(req, res) {
        return;
        let query = { isdeleted: 0 };
        let keyword = (req.body.keyword || req.query.keyword) || "";
        if (keyword) {
            keyword = new RegExp(keyword, 'ig');
            const fields = ['phone', 'item', 'unit']
            query['$or'] = [];
            fields.map(function (item) {
                let opt = {};
                opt[item] = keyword;
                query['$or'].push(opt)
            });
        }
        request.get({
            url: `${ovakaiURL}/api/order/list`,
            body: {
                query
            },
            json: true
        }, (err, httpRes, body) => {
            res.json({
                docs: body.rows || [],
                total: body.total,
                limit: body.limit,
                page: body.page,
                offset: body.offset,
                pages: body.pages
            });
        })
    }
};