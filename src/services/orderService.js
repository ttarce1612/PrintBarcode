/**
 * Copyright (c) 2019 OVTeam
 * Modified date: 2019/11/11
 * Modified by: Duy Huynh
 */

const Utils = require("../libs/utils");
const Request = require("../libs/request");
const toast = require('../libs/toast');
const dispatcher = require('../libs/dispatcher');

module.exports = {
    create: (postData) => {
        Request.post("/api/order/create", postData)
            .then((res) => {
                if (res.status === 200) {
                    if (res.data.Status === true) {
                        toast.success(res.data.Data);
                        dispatcher.dispatch('test_list_load_data', {});
                    } else {
                        if (typeof res.data.Data == "string") toast.error(res.data.Data)
                        else {
                            for (let i in res.data.Data) {
                                toast.error(res.data.Data[i]);
                            }
                        }
                    }
                } else {
                    toast.error("Error")
                }
            })
    },
    update: (postData) => {
        Request.post("/api/order/update", postData)
        .then((res) => {
            if(res.status === 200) {
                if(res.data.Status === true) {
                    toast.success(res.data.Data);
                    dispatcher.dispatch('order_list_load_data', {});
                } else {
                    if (typeof res.data.Data == "string") toast.error(res.data.Data) 
                    else {
                        for(let i in res.data.Data) {
                            toast.error(res.data.Data[i]);
                        }
                    }
                }
            } else {
                toast.error("Error")
            }
        })
    },
    getList: (query = null) => new Promise((resolve, reject) => {
        let url = '/api/orders';
        let params = {
            limit: 0,
            page: 1,
            keyword: ""
        };
        if (query) {
            if (query.pageSize) params['limit'] = query.pageSize;
            if (query.page) params['page'] = query.page + 1;
            if (query.search) params['keyword'] = query.search;
        }
        Request.get(url, params)
            .then(result => {
                resolve({
                    data: result.data.docs || [],
                    page: result.data.page - 1,
                    totalCount: result.data.total,
                })
            });
    })
}