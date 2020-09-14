
function find(entity, searchParams, option = {}) {
    return new Promise((resolve) => {
        const eModel = entity.find(searchParams);
        if (option.fields) {
            eModel.select(option.fields);
        }
        if (option.sort) {
            eModel.sort(option.sort);
        }
        if (option.start) {
            eModel.skip(option.start);
        }
        if (option.limit) {
            eModel.limit(option.limit);
        }
        eModel.exec((err, res) => {
            if (err || !res.length) {
                resolve({ Status: false, Data: err ? err.message : 'Data not found' });
            } else {
                resolve({ Status: true, Data: res });
            }
        })
    });
}

function paginate(entity, searchParams, option = {}) {
    return new Promise((resolve) => {
        let paginateOption = Object.create(null);
        paginateOption.sort = option.sort || { lastmodified: -1 };
        paginateOption.limit = option.limit || 10;
        paginateOption.page = option.page || 1;
        if (option.fields) {
            paginateOption.select = option.fields;
        }

        entity.paginate(searchParams, paginateOption, function (err, res) {
            if (err) {
                resolve({ Status: false, Data: err.message });
            } else {
                resolve({ Status: true, Data: res.docs, Total: res.total });
            }
        });
    });
}

function save(entity, searchParams, data) {
    return new Promise((resolve) => {
        entity.updateOne(searchParams, { $set: data }, { upsert: true }, (err, raw) => {
            if (err || !raw.n) {
                resolve({ Status: false, Data: err ? err.message : 'No data updated' });
            } else {
                resolve({ Status: true, Data: 'Updated successfully' });
            }
        });
    });
}

function history(entity, data = {}) {
    return new Promise((resolve) => {
        data.lastmodified = new Date();
        delete data._id;
        delete data._v;

        const eHis = new entity(data);
        eHis.save(function (err) {
            if (err) {
                resolve({ Status: false, Data: err.message });
            } else {
                resolve({ Status: true, Data: eHis._id });
            }
        });
    });
}

function retrieve(entity, searchParams, option = {}) {
    return new Promise((resolve) => {
        const eModel = entity.findOne(searchParams);
        if (option.fields) {
            eModel.select(option.fields);
        }
        if (option.sort) {
            eModel.sort(option.sort);
        }
        eModel.exec((err, res) => {
            if (err || !res) {
                resolve({ Status: false, Data: err ? err.message : 'Data not found' });
            } else {
                resolve({ Status: true, Data: res.toObject() });
            }
        });
    });
}

function remove(entity, searchParams, force = false) {
    return new Promise((resolve) => {
        if (force) {
            entity.remove(searchParams, (err) => {
                resolve({ Status: err ? false : true, Data: err ? err.message : 'Deleted sucessfully.' });
            });
        } else {
            save(entity, searchParams, { isdeleted: 1 }, { multi: true }).then((res) => {
                resolve({ Status: res.Status, Data: res.Status ? 'Deleted sucessfully.' : res.Data });
            });
        }
    });
}

module.exports = {
    find, paginate, save, history, retrieve, remove
};
