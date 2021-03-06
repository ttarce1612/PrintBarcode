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
        Request.post("/api/outbound/create", postData)
            .then((res) => {
                if (res.status === 200) {
                    if (res.data.Status === true) {
                        toast.success(res.data.Data);
                        dispatcher.dispatch('outbound_list_load_data', {});
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
        Request.post("/api/outbound/update", postData)
        .then((res) => {
            if(res.status === 200) {
                if(res.data.Status === true) {
                    toast.success(res.data.Data);
                    dispatcher.dispatch('outbound_list_load_data', {});
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
    delete: (postData) => {
        return new Promise(resolve => {
            Request.post("/api/outbound/delete", postData)
                .then((res) => {
                    toast.success("Delete success.");
                    resolve(res.data)
                });
        });
    },
    getList: (query = null) => new Promise((resolve, reject) => {
        let url = '/api/outbounds';
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
    }),
    getOne: (id) => new Promise((resolve, reject) => {
        let url = '/api/outbound/' + id;
        Request.get(url, {})
            .then(result => {
                if (!result.data) {
                    toast.error("Data not found.");
                }
                resolve({
                    data: result.data || null
                });
            });
    })
}