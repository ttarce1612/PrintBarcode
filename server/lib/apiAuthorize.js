const { tokenAPI, dataAPI } = require('../config')
var request = require('request');
const Truck = require("./../data/truckModel");

async function authenFromWms(warehouseId) {
    const wmsUserModel = require("./../data/wmsUserModel");
    const warehouseModel = require("./../data/wmsWarehouse");
    const _warehouse = await warehouseModel.findOne({id: warehouseId});
    const info = await wmsUserModel.findOne({warehouse: warehouseId});
    
    if(!info) {
        return {
            Status: false
        }
    }
    return new Promise((resolve) => {
        let options = {
            'method': tokenAPI.method,
            'url': tokenAPI.url,
            'headers': {
                'Content-Type': tokenAPI.ContentType
            },
            form: {
                'grant_type': tokenAPI.grant_type,
                'username': info.loginname,
                'password': info.password,
                'client_id': tokenAPI.client_id,
                'client_secret': tokenAPI.client_secret,
                'scope': tokenAPI.scope
            }
        };
        request(options, function (error, response) {
            let data = {
                Body: "",
                Status: false
            }
            if (response && response.body) {
                if (typeof (response.body) == "string") {
                    data.Body = JSON.parse(response.body);
                } else if (typeof (response.body) == "object") {
                    data.Body = response.body
                }
                data.Status = true
                data.Warehouse = {
                    Id: _warehouse?_warehouse.Id:0,
                    Name: _warehouse?_warehouse.name:""
                }
            }
            resolve(data);
        });
    })
}

async function findCurrentPoint(point) {
    let _location = {
        address: '',
        location: {
            lat: 0,
            lng: 0
        }
    };
    if(point) {
        const PointModel = require("./../data/distributionPointModel");
        let doc = await PointModel.findOne({ code: point, status: 'Active', isdeleted: 0 }).exec();
        if (doc && doc.location && doc.location.location) {
            _location.location['lat'] = doc.location.location.lat
            _location.location['lng'] = doc.location.location.lng
        }
        _location['address'] = "";
        if(doc.address) {
            _location['address'] = doc.address + ', ';
        }
        _location['address'] += `${doc.ward.name}, ${doc.district.name}, ${doc.province.name}`;
        
    }
    return _location;
}

module.exports = {
    authorize: async function (req, res) {
        try {
            const crypto = require('crypto');
            const hash = crypto.createHmac('sha256', req.body.password)
                .update('truckdeleveryscret')
                .digest('hex');

            let _truck = await Truck.findOne({
                isdeleted: 0,
                secret: hash,
                secret_id: req.body.loginname
            }).exec();

            if (!_truck) {
                res.json({
                    Status: false,
                    Data: 'authen_invalid'
                });
                return;
            }
            if (_truck['isdeleted'] || _truck['status'] !== 'Active') {
                res.json({
                    Status: false,
                    Data: 'authen_locked'
                });
                return;
            }

            let _auth = await authenFromWms(_truck.warehouse_id);
            
            if (_auth && _auth.Status) {
                _truck = _truck.toObject();
                _auth.Truck = {
                    Point: _truck.point?_truck.point.code:'',
                    Code: _truck.truckcode,
                    Name: _truck.name,
                    Location: await findCurrentPoint(_truck.point?_truck.point.code:'')
                }
            }
            res.json(_auth);
        } catch (err) {
            res.json({
                Status: false,
                Data: 'authen_failed'
            });
        }

    },
    getDataAPI(token) {
        return new Promise(function (resolve, reject) {
            let options = {
                'method': dataAPI.method,
                'url': dataAPI.url,
                'headers': {
                    'Content-Type': dataAPI.ContentType,
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(dataAPI.body)
            };
            request(options, function (error, response) {
                var data = {
                    body: "",
                    status: false,
                    info: ""
                }
                if (response && response.body) {
                    let _date = new Date()
                    if (typeof (response.body) == "string") {
                        data.body = JSON.parse(response.body)
                    } else if (typeof (response.body) == "object") {
                        data.body = response.body
                    }
                    data.status = true
                    data.date = _date

                }
                resolve(data)
            });
        });
    },
    parseJwt: function (token) {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    },
}
